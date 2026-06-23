-- CHẠY SCRIPT NÀY BẰNG TÀI KHOẢN EMS_ADMIN HOẶC SYS AS SYSDBA
GRANT SELECT ON EMS_ADMIN.APP_USERS TO ems_app_user;
GRANT SELECT ON EMS_ADMIN.DU_AN TO ems_app_user;
-- Tuỳ chọn, nếu ứng dụng cần Update/Insert thì cấp thêm quyền:
GRANT UPDATE ON EMS_ADMIN.NHAN_VIEN TO ems_app_user;
GRANT UPDATE ON EMS_ADMIN.DU_AN TO ems_app_user;
