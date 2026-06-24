GRANT SELECT ON UNIFIED_AUDIT_TRAIL TO EMS_ADMIN;

-- ==============================================================================
-- ĐỒ ÁN: HỆ THỐNG QUẢN LÝ NHÂN SỰ (EMS) - BẢO MẬT CƠ SỞ DỮ LIỆU
-- SCRIPT 06: CƠ CHẾ GIÁM SÁT, LƯU VẾT VÀ KIỂM TOÁN (FGA & UNIFIED AUDIT)
-- SERVICE NAME: FREEPDB1
--
-- GHI CHÚ KIẾN TRÚC:
-- Database này dùng UNIFIED AUDITING (mặc định từ Oracle 12c+, bắt buộc ở 21c/23ai).
-- Khi Unified Auditing ON, DBMS_FGA.ADD_POLICY vẫn dùng API như cũ, nhưng dữ liệu
-- log được ghi vào UNIFIED_AUDIT_TRAIL thay vì DBA_FGA_AUDIT_TRAIL.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PHẦN I: CẬP NHẬT PACKAGE ĐỊNH DANH 
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
-- PHẦN II: THIẾT LẬP FGA POLICY (TỪ ĐỀ CƯƠNG & FILE 04 GỐC)
-- ------------------------------------------------------------------------------
BEGIN
    -- 1. FGA Bảng NHAN_VIEN: Ghi log mọi hành động UPDATE từ phòng HR
    BEGIN DBMS_FGA.DROP_POLICY('EMS_ADMIN', 'NHAN_VIEN', 'FGA_HR_EDIT_NHANVIEN'); EXCEPTION WHEN OTHERS THEN NULL; END;
    DBMS_FGA.ADD_POLICY(
        object_schema   => 'EMS_ADMIN',
        object_name     => 'NHAN_VIEN',
        policy_name     => 'FGA_HR_EDIT_NHANVIEN',
        audit_condition => q'[SYS_CONTEXT('ctx_qlnv','ROLE') IN ('HR_STAFF','HR_MANAGER')]',
        statement_types => 'UPDATE',
        enable          => TRUE
    );

    -- 2. FGA Bảng PHAN_CONG (Bổ sung theo Đề cương): Giám sát gán nhân sự
    BEGIN DBMS_FGA.DROP_POLICY('EMS_ADMIN', 'PHAN_CONG', 'FGA_AUDIT_PHANCONG'); EXCEPTION WHEN OTHERS THEN NULL; END;
    DBMS_FGA.ADD_POLICY(
        object_schema   => 'EMS_ADMIN',
        object_name     => 'PHAN_CONG',
        policy_name     => 'FGA_AUDIT_PHANCONG',
        audit_condition => '1=1', -- Giám sát mọi hành vi
        statement_types => 'INSERT, UPDATE, DELETE',
        enable          => TRUE
    );
END;
/

-- ------------------------------------------------------------------------------
-- PHẦN III: KIỂM TOÁN OLS BẰNG UNIFIED AUDITING (Bổ sung theo Đề cương)
-- Giám sát hành vi vi phạm chính sách nhãn dán trên bảng DU_AN
-- ------------------------------------------------------------------------------
BEGIN
    BEGIN EXECUTE IMMEDIATE 'NOAUDIT POLICY OLS_AUDIT_DUAN_FAILURES'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE IMMEDIATE 'DROP AUDIT POLICY OLS_AUDIT_DUAN_FAILURES'; EXCEPTION WHEN OTHERS THEN NULL; END;
END;
/

-- Tạo Policy bắt các hành động tương tác với dự án
CREATE AUDIT POLICY OLS_AUDIT_DUAN_FAILURES
    ACTIONS SELECT ON EMS_ADMIN.DU_AN,
            INSERT ON EMS_ADMIN.DU_AN,
            UPDATE ON EMS_ADMIN.DU_AN,
            DELETE ON EMS_ADMIN.DU_AN;

-- Chỉ kích hoạt ghi log khi hành động THẤT BẠI (do vi phạm nhãn bảo mật)
AUDIT POLICY OLS_AUDIT_DUAN_FAILURES WHENEVER NOT SUCCESSFUL;

-- ------------------------------------------------------------------------------
-- PHẦN IV: TRIGGER NGHIỆP VỤ - LƯU LỊCH SỬ BIẾN ĐỘNG LƯƠNG (FILE 05 GỐC)
-- Chặn HR_STAFF tự ý sửa lương, đồng thời lưu vết nếu HR_MANAGER thao tác hợp lệ.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_lich_su_luong
BEFORE UPDATE OF Luong ON NHAN_VIEN
FOR EACH ROW
WHEN (NVL(OLD.Luong, -1) != NVL(NEW.Luong, -1))
DECLARE
    v_role VARCHAR2(50) := SYS_CONTEXT('ctx_qlnv', 'ROLE');
BEGIN
    -- Kiểm soát bảo mật kép (Nội dung 4 + 6): Chặn HR_STAFF
    IF v_role = 'HR_STAFF' THEN
        RAISE_APPLICATION_ERROR(-20001, 'Nhân viên sự (HR_STAFF) không có đặc quyền thay đổi mức lương!');
    END IF;

    -- Lưu vết lịch sử
    INSERT INTO LICH_SU_LUONG (MaNV, LuongCu, LuongMoi, NgayDoi, NguoiThucHien)
    VALUES (:OLD.MaNV, :OLD.Luong, :NEW.Luong, SYSTIMESTAMP, SYS_CONTEXT('ctx_qlnv', 'USER_ID'));
END;
/

-- ------------------------------------------------------------------------------
-- PHẦN V: XÂY DỰNG CÁC VIEW BÁO CÁO (FILE 04 & 06 GỐC + ĐỀ CƯƠNG)
-- ------------------------------------------------------------------------------

-- VIEW 1: Trích xuất dữ liệu Unified Audit cho các hành vi Edit của bộ phận HR
CREATE OR REPLACE VIEW VW_AUDIT_HR_EDITS AS
SELECT
    u.event_timestamp                              AS log_time,
    u.client_identifier                            AS db_user,
    NVL(au.username, u.client_identifier)          AS real_user_name,
    u.action_name                                  AS action,
    u.object_name                                  AS object_name,
    u.sql_text                                     AS sql_text,
    u.sql_binds                                    AS sql_binds 
FROM unified_audit_trail u
LEFT JOIN APP_USERS au ON au.ID_User = u.client_identifier
WHERE u.fga_policy_name = 'FGA_HR_EDIT_NHANVIEN';

-- VIEW 2: Gộp 2 nguồn log (FGA và Trigger Lương) thành 1 timeline (Cho API /employees/history)
CREATE OR REPLACE VIEW VW_EMPLOYEE_CHANGE_HISTORY AS
SELECT
    f.log_time                                                                  AS event_time,
    f.real_user_name                                                            AS performed_by,
    NULL                                                                        AS ma_nv,
    'EDIT_INFO'                                                                 AS event_type,
    REPLACE(DBMS_LOB.SUBSTR(f.sql_text, 4000, 1), CHR(0), '')                   AS detail_sql,
    f.sql_binds                                                                 AS detail_binds,
    NULL                                                                        AS old_value,
    NULL                                                                        AS new_value
FROM VW_AUDIT_HR_EDITS f
UNION ALL
SELECT
    l.NgayDoi                                                                   AS event_time,
    NVL(au.username, l.NguoiThucHien)                                           AS performed_by,
    l.MaNV                                                                      AS ma_nv,
    'EDIT_SALARY'                                                               AS event_type,
    NULL                                                                        AS detail_sql,
    NULL                                                                        AS detail_binds,
    TO_CHAR(l.LuongCu)                                                          AS old_value,
    TO_CHAR(l.LuongMoi)                                                         AS new_value
FROM LICH_SU_LUONG l
LEFT JOIN APP_USERS au ON au.ID_User = l.NguoiThucHien;

-- VIEW 3: Dashboard Kiểm toán Hệ thống (Cho API /audit-logs - Bổ sung theo Đề cương)
CREATE OR REPLACE VIEW VW_HR_AUDIT_LOG AS
SELECT
    u.event_timestamp                              AS thoi_gian_thuc_hien,
    NVL(au.username, u.client_identifier)          AS nguoi_thuc_hien,
    u.object_name                                  AS bang_tac_dong,
    u.action_name                                  AS loai_hanh_dong,
    REPLACE(DBMS_LOB.SUBSTR(u.sql_text, 4000, 1), CHR(0), '') AS cau_lenh_sql,
    u.sql_binds                                    AS du_lieu_thay_doi,
    u.fga_policy_name                              AS ten_chinh_sach,
    CASE 
        WHEN u.return_code != 0 THEN 'THẤT BẠI (CẢNH BÁO VI PHẠM)'
        ELSE 'THÀNH CÔNG'
    END                                            AS trang_thai
FROM unified_audit_trail u
LEFT JOIN EMS_ADMIN.APP_USERS au ON au.ID_User = u.client_identifier
WHERE 
    u.fga_policy_name IN ('FGA_HR_EDIT_NHANVIEN', 'FGA_AUDIT_PHANCONG')
    OR (u.object_name = 'DU_AN' AND u.return_code != 0);

-- Xác nhận toàn bộ thay đổi
COMMIT;