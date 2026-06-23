-- ==============================================================================
-- ĐỒ ÁN: HỆ THỐNG QUẢN LÝ NHÂN SỰ (EMS) - BẢO MẬT CƠ SỞ DỮ LIỆU
-- SCRIPT 06: VIEW LỊCH SỬ THAY ĐỔI THÔNG TIN NHÂN VIÊN (HỢP NHẤT)
-- CHẠY BẰNG TÀI KHOẢN 'EMS_ADMIN' VÀO 'FREEPDB1'
--
-- Mục tiêu: Gộp 2 nguồn log khác nhau thành 1 danh sách duy nhất cho route
-- Frontend /employees/history:
--   1. FGA Audit (VW_AUDIT_HR_EDITS - script 04) - sửa thông tin cá nhân (Tên,
--      SĐT, Phòng ban...) do HR_STAFF thực hiện.
--   2. Trigger Lương (LICH_SU_LUONG - script 05) - mọi lần đổi Lương.
--
-- Ghi chú: SQL_TEXT của FGA chỉ chứa placeholder bind (:hoTen, :maNV...), KHÔNG
-- chứa giá trị thật (vì Backend dùng bind variable để chống SQL Injection).
-- Giá trị thật nằm trong SQL_BINDS dạng "#1(20):value1 #2(10):value2...".
-- Câu UPDATE trong employees.service.ts:
--   HR_STAFF: ... SET HoTen, SDT, MaPB WHERE MaNV  -> MaNV là bind CUỐI (#4)
--   HR_MANAGER: ... SET HoTen, SDT, MaPB, Luong WHERE MaNV -> MaNV là bind CUỐI (#5)
-- MaNV được trích từ bind cuối cùng trong sql_binds ở tầng Backend
-- (audit-change-formatter.ts), tránh dùng REGEXP Oracle gây lỗi ORA-12725.
-- ==============================================================================

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


-- ==============================================================================
-- KIỂM THỬ (CHẠY BẰNG TÀI KHOẢN 'EMS_ADMIN' VÀO 'FREEPDB1')
-- ==============================================================================
-- SELECT event_time, performed_by, ma_nv, event_type, detail_sql, old_value, new_value
-- FROM VW_EMPLOYEE_CHANGE_HISTORY
-- ORDER BY event_time DESC;
