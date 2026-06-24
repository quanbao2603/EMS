-- ==============================================================================
-- BƯỚC 1: KHỞI TẠO VÀ CẤP QUYỀN HỆ THỐNG CƠ BẢN
-- CHẠY BẰNG TÀI KHOẢN: SYSTEM hoặc SYS
-- ==============================================================================

-- 1. Xóa user cũ nếu đã tồn tại để làm sạch môi trường
BEGIN
    EXECUTE IMMEDIATE 'DROP USER ems_app_user CASCADE';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- 2. Tạo user mới chuyên dùng cho Backend kết nối
CREATE USER ems_app_user IDENTIFIED BY "EmsPassword2026";

-- 3. Cấp quyền kết nối và khởi tạo tài nguyên cơ bản
GRANT CONNECT, RESOURCE TO ems_app_user;

-- 4. Cấp quyền gọi Package thiết lập Context của EMS_ADMIN
GRANT EXECUTE ON EMS_ADMIN.pkg_sec_admin TO ems_app_user;

-- 5. Cấp đầy đủ quyền Thao tác dữ liệu (DML) trên bảng NHAN_VIEN
-- (User này sẽ tự động bị áp dụng chính sách VPD lọc dòng và Redaction che lương)
GRANT SELECT, INSERT, UPDATE, DELETE ON EMS_ADMIN.NHAN_VIEN TO ems_app_user;

-- 6. Cấp đầy đủ quyền Thao tác dữ liệu trên bảng DU_AN (Phục vụ cho OLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON EMS_ADMIN.DU_AN TO ems_app_user;

-- CHẠY SCRIPT NÀY BẰNG TÀI KHOẢN EMS_ADMIN HOẶC SYS AS SYSDBA
GRANT SELECT ON EMS_ADMIN.APP_USERS TO ems_app_user;
GRANT SELECT ON EMS_ADMIN.DU_AN TO ems_app_user;

-- Tuỳ chọn, nếu ứng dụng cần Update/Insert thì cấp thêm quyền:
GRANT UPDATE ON EMS_ADMIN.NHAN_VIEN TO ems_app_user;
GRANT UPDATE ON EMS_ADMIN.DU_AN TO ems_app_user;