-- ==============================================================================
-- ĐỒ ÁN: HỆ THỐNG QUẢN LÝ NHÂN SỰ (EMS) - BẢO MẬT CƠ SỞ DỮ LIỆU
-- SCRIPT 04: CƠ CHẾ GIÁM SÁT VÀ LƯU VẾT (NỘI DUNG 6 - FGA AUDIT)
-- SERVICE NAME: FREEPDB1
--
-- GHI CHÚ KIẾN TRÚC:
-- Database này dùng UNIFIED AUDITING (mặc định từ Oracle 12c+, bắt buộc ở 21c/23ai).
-- Khi Unified Auditing ON, DBMS_FGA.ADD_POLICY vẫn dùng API như cũ, nhưng dữ liệu
-- log được ghi vào UNIFIED_AUDIT_TRAIL (cột FGA_POLICY_NAME) thay vì
-- DBA_FGA_AUDIT_TRAIL (view cũ này sẽ luôn rỗng trong môi trường Unified Auditing).
-- Kiểm tra: SHOW PARAMETER audit_trail; SELECT * FROM v$option WHERE parameter =
-- 'Unified Auditing'; (kết quả TRUE trên máy đã triển khai).
--
-- Vì Backend dùng DUY NHẤT 1 tài khoản kỹ thuật EMS_ADMIN để kết nối Oracle (connection
-- pooling), DBUSERNAME trong audit trail luôn là EMS_ADMIN. Để biết CHÍNH XÁC nhân
-- viên nào (USR_xxx) thực hiện hành động, ta dùng DBMS_SESSION.SET_IDENTIFIER ngay
-- trong pkg_sec_admin.set_context (được Backend gọi mỗi request qua Interceptor) ->
-- giá trị này được audit trail ghi vào cột CLIENT_IDENTIFIER.
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- PHẦN I: CẤP QUYỀN (CHẠY BẰNG TÀI KHOẢN 'SYS AS SYSDBA' VÀO 'FREEPDB1')
-- LƯU Ý: Oracle yêu cầu GRANT trực tiếp (không qua role DBA/SELECT_CATALOG_ROLE)
-- để EMS_ADMIN có thể tạo VIEW tham chiếu UNIFIED_AUDIT_TRAIL.
-- ------------------------------------------------------------------------------
GRANT SELECT ON UNIFIED_AUDIT_TRAIL TO EMS_ADMIN;


-- ------------------------------------------------------------------------------
-- PHẦN II: CẬP NHẬT PACKAGE ĐỊNH DANH (CHẠY BẰNG TÀI KHOẢN 'EMS_ADMIN' VÀO 'FREEPDB1')
-- Bổ sung DBMS_SESSION.SET_IDENTIFIER để audit trail nhận diện đúng người dùng cuối.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PACKAGE BODY pkg_sec_admin AS
    PROCEDURE set_context(p_user_id VARCHAR2, p_role VARCHAR2, p_mapb VARCHAR2) IS
    BEGIN
        DBMS_SESSION.SET_CONTEXT('ctx_qlnv', 'USER_ID', p_user_id);
        DBMS_SESSION.SET_CONTEXT('ctx_qlnv', 'ROLE', p_role);
        DBMS_SESSION.SET_CONTEXT('ctx_qlnv', 'MAPB', p_mapb);
        DBMS_SESSION.SET_IDENTIFIER(p_user_id);
    END;
END;
/


-- ------------------------------------------------------------------------------
-- PHẦN III: THIẾT LẬP FGA POLICY (CHẠY BẰNG TÀI KHOẢN 'EMS_ADMIN' VÀO 'FREEPDB1')
-- Mục tiêu: Ghi log mọi hành động UPDATE trên bảng NHAN_VIEN khi người thực
-- hiện có Context ROLE là HR_STAFF hoặc HR_MANAGER (các role được phép sửa NV).
-- ------------------------------------------------------------------------------
BEGIN
    BEGIN
        DBMS_FGA.DROP_POLICY(
            object_schema => 'EMS_ADMIN',
            object_name   => 'NHAN_VIEN',
            policy_name   => 'FGA_HR_EDIT_NHANVIEN'
        );
    EXCEPTION WHEN OTHERS THEN NULL; -- Bỏ qua nếu policy chưa tồn tại
    END;

    DBMS_FGA.ADD_POLICY(
        object_schema   => 'EMS_ADMIN',
        object_name     => 'NHAN_VIEN',
        policy_name     => 'FGA_HR_EDIT_NHANVIEN',
        audit_condition => q'[SYS_CONTEXT('ctx_qlnv','ROLE') IN ('HR_STAFF','HR_MANAGER')]',
        statement_types => 'UPDATE',
        enable          => TRUE
    );
END;
/


-- ------------------------------------------------------------------------------
-- PHẦN IV: VIEW BÁO CÁO CHO TRƯỞNG PHÒNG HR (CHẠY BẰNG TÀI KHOẢN 'EMS_ADMIN' VÀO 'FREEPDB1')
-- Trưởng phòng HR (role HR_MANAGER) sẽ truy xuất view này qua API Backend
-- (GET /audit/logs), không truy cập trực tiếp UNIFIED_AUDIT_TRAIL.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW VW_AUDIT_HR_EDITS AS
SELECT
    u.event_timestamp                              AS log_time,
    u.client_identifier                            AS db_user,
    NVL(au.username, u.client_identifier)          AS real_user_name,
    u.action_name                                  AS action,
    u.object_name                                  AS object_name,
    u.sql_text                                      AS sql_text,
    u.sql_binds                                     AS sql_binds -- cần cho VW_EMPLOYEE_CHANGE_HISTORY (script 06) trích MaNV
FROM unified_audit_trail u
LEFT JOIN APP_USERS au ON au.ID_User = u.client_identifier
WHERE u.fga_policy_name = 'FGA_HR_EDIT_NHANVIEN';


-- ==============================================================================
-- PHẦN V: KIỂM THỬ (CHẠY BẰNG TÀI KHOẢN 'EMS_ADMIN' VÀO 'FREEPDB1')
-- Giả lập Backend Interceptor: set_context với role HR_STAFF, sau đó UPDATE.
-- ==============================================================================
-- BEGIN
--     pkg_sec_admin.set_context('USR_004', 'HR_STAFF', 'HR');
-- END;
-- /
-- UPDATE NHAN_VIEN SET SDT = '0902222299' WHERE MaNV = 'NV_IT02';
-- COMMIT;
--
-- SELECT log_time, db_user, real_user_name, action, object_name, sql_text
-- FROM VW_AUDIT_HR_EDITS
-- ORDER BY log_time DESC;


-- ==============================================================================
-- GHI CHÚ CHO BACKEND (NestJS - oracledb driver):
-- Cột SQL_TEXT trong UNIFIED_AUDIT_TRAIL có kiểu CLOB. Khi backend SELECT trực
-- tiếp cột này, oracledb trả về một đối tượng Lob (stream), không phải string,
-- và JSON.stringify() đối tượng đó sẽ ném lỗi "Converting circular structure to
-- JSON". Do đó tầng Backend PHẢI ép kiểu khi SELECT, ví dụ:
--   SELECT REPLACE(DBMS_LOB.SUBSTR(sql_text, 4000, 1), CHR(0), '') AS sql_text ...
-- (CHR(0) dùng để loại ký tự NULL đệm cuối chuỗi do Oracle audit buffer để lại).
-- Xem cách dùng thực tế tại backend/src/audit/audit.service.ts.
-- ==============================================================================
