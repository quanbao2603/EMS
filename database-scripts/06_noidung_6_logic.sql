-- ==============================================================================
-- ĐỒ ÁN: HỆ THỐNG QUẢN LÝ NHÂN SỰ (EMS) - BẢO MẬT CƠ SỞ DỮ LIỆU
-- SCRIPT 06 TỔNG HỢP: CƠ CHẾ GIÁM SÁT, LƯU VẾT VÀ KIỂM TOÁN (FGA & UNIFIED AUDIT)
--
-- HƯỚNG DẪN THỰC THI:
-- File này áp dụng chiến thuật Schema Shift để tránh lỗi ORA-01720. 
-- Vui lòng chuyển đổi đúng tài khoản kết nối (Connection) trước khi chạy từng phần.
-- ==============================================================================


-- ******************************************************************************
-- ⚠️ PHẦN 1: CHẠY BẰNG TÀI KHOẢN "SYS AS SYSDBA" (KẾT NỐI VÀO FREEPDB1) ⚠️
-- Mục tiêu: Mở cổng dữ liệu Kiểm toán hệ thống (Unified Auditing) cho các User
-- ******************************************************************************
GRANT SELECT ON UNIFIED_AUDIT_TRAIL TO EMS_ADMIN;
GRANT SELECT ON UNIFIED_AUDIT_TRAIL TO EMS_APP_USER;


-- ******************************************************************************
-- ⚠️ PHẦN 2: CHẠY BẰNG TÀI KHOẢN "EMS_ADMIN" (KẾT NỐI VÀO FREEPDB1) ⚠️
-- Mục tiêu: Thiết lập FGA, Audit Policy, Trigger và cấp quyền cơ bản
-- ******************************************************************************

-- 1. Cập nhật Package định danh (Ghi nhận User ID cho hệ thống Unified Audit)
CREATE OR REPLACE PACKAGE BODY pkg_sec_admin AS
    PROCEDURE set_context(p_user_id VARCHAR2, p_role VARCHAR2, p_mapb VARCHAR2) IS
    BEGIN
        DBMS_SESSION.SET_CONTEXT('ctx_qlnv', 'USER_ID', p_user_id);
        DBMS_SESSION.SET_CONTEXT('ctx_qlnv', 'ROLE', p_role);
        DBMS_SESSION.SET_CONTEXT('ctx_qlnv', 'MAPB', p_mapb);
        -- Đẩy ID cho Unified Audit ghi nhận vào cột CLIENT_IDENTIFIER
        DBMS_SESSION.SET_IDENTIFIER(p_user_id); 
    END;
END;
/

-- 2. Thiết lập FGA Policy (Giám sát phòng HR & Giám sát bảng Phân công)
BEGIN
    BEGIN DBMS_FGA.DROP_POLICY('EMS_ADMIN', 'NHAN_VIEN', 'FGA_HR_EDIT_NHANVIEN'); EXCEPTION WHEN OTHERS THEN NULL; END;
    DBMS_FGA.ADD_POLICY(
        object_schema   => 'EMS_ADMIN', object_name => 'NHAN_VIEN', policy_name => 'FGA_HR_EDIT_NHANVIEN',
        audit_condition => q'[SYS_CONTEXT('ctx_qlnv','ROLE') IN ('HR_STAFF','HR_MANAGER')]',
        statement_types => 'UPDATE', enable => TRUE
    );

    BEGIN DBMS_FGA.DROP_POLICY('EMS_ADMIN', 'PHAN_CONG', 'FGA_AUDIT_PHANCONG'); EXCEPTION WHEN OTHERS THEN NULL; END;
    DBMS_FGA.ADD_POLICY(
        object_schema   => 'EMS_ADMIN', object_name => 'PHAN_CONG', policy_name => 'FGA_AUDIT_PHANCONG',
        audit_condition => '1=1', statement_types => 'INSERT, UPDATE, DELETE', enable => TRUE
    );
END;
/

-- 3. Kiểm toán OLS bằng Unified Auditing (Bắt lỗi truy cập tài liệu/dự án mật)
BEGIN
    BEGIN EXECUTE IMMEDIATE 'NOAUDIT POLICY OLS_AUDIT_DUAN_FAILURES'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE IMMEDIATE 'DROP AUDIT POLICY OLS_AUDIT_DUAN_FAILURES'; EXCEPTION WHEN OTHERS THEN NULL; END;
END;
/
CREATE AUDIT POLICY OLS_AUDIT_DUAN_FAILURES
    ACTIONS SELECT ON EMS_ADMIN.DU_AN, INSERT ON EMS_ADMIN.DU_AN, UPDATE ON EMS_ADMIN.DU_AN, DELETE ON EMS_ADMIN.DU_AN;
-- Chỉ ghi log cảnh báo khi truy cập THẤT BẠI
AUDIT POLICY OLS_AUDIT_DUAN_FAILURES WHENEVER NOT SUCCESSFUL; 

-- 4. Trigger Nghiệp vụ: Lưu vết biến động lương
CREATE OR REPLACE TRIGGER trg_lich_su_luong
AFTER UPDATE OF Luong ON EMS_ADMIN.NHAN_VIEN
FOR EACH ROW
WHEN (NVL(OLD.Luong, -1) != NVL(NEW.Luong, -1))
BEGIN
    INSERT INTO LICH_SU_LUONG (MaNV, LuongCu, LuongMoi, NgayDoi, NguoiThucHien)
    VALUES (:OLD.MaNV, :OLD.Luong, :NEW.Luong, SYSTIMESTAMP, SYS_CONTEXT('ctx_qlnv', 'USER_ID'));
END;
/

-- 5. Cấp quyền cho Backend đọc các bảng cần thiết để join dữ liệu
GRANT SELECT ON EMS_ADMIN.APP_USERS TO EMS_APP_USER;
GRANT SELECT ON EMS_ADMIN.LICH_SU_LUONG TO EMS_APP_USER;


-- ******************************************************************************
-- ⚠️ PHẦN 3: CHẠY BẰNG TÀI KHOẢN "EMS_APP_USER" (KẾT NỐI VÀO FREEPDB1) ⚠️
-- Mục tiêu: Backend tự tạo View báo cáo giám sát để né lỗi ORA-01720
-- ******************************************************************************

-- 1. View trích xuất log của HR
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
LEFT JOIN EMS_ADMIN.APP_USERS au ON au.ID_User = u.client_identifier
WHERE u.fga_policy_name = 'FGA_HR_EDIT_NHANVIEN';

-- 2. View gộp log (FGA và Trigger Lương) thành Timeline
CREATE OR REPLACE VIEW VW_EMPLOYEE_CHANGE_HISTORY AS
SELECT
    f.log_time AS event_time, f.real_user_name AS performed_by, NULL AS ma_nv,
    'EDIT_INFO' AS event_type, REPLACE(DBMS_LOB.SUBSTR(f.sql_text, 4000, 1), CHR(0), '') AS detail_sql,
    f.sql_binds AS detail_binds, NULL AS old_value, NULL AS new_value
FROM VW_AUDIT_HR_EDITS f
UNION ALL
SELECT
    l.NgayDoi AS event_time, NVL(au.username, l.NguoiThucHien) AS performed_by, l.MaNV AS ma_nv,
    'EDIT_SALARY' AS event_type, NULL AS detail_sql, NULL AS detail_binds,
    TO_CHAR(l.LuongCu) AS old_value, TO_CHAR(l.LuongMoi) AS new_value
FROM EMS_ADMIN.LICH_SU_LUONG l
LEFT JOIN EMS_ADMIN.APP_USERS au ON au.ID_User = l.NguoiThucHien;

-- 3. View Tổng hợp Dashboard Kiểm toán Hệ thống
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

COMMIT;