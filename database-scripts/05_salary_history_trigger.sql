-- ==============================================================================
-- ĐỒ ÁN: HỆ THỐNG QUẢN LÝ NHÂN SỰ (EMS) - BẢO MẬT CƠ SỞ DỮ LIỆU
-- SCRIPT 05: TRIGGER NGHIỆP VỤ - LƯU LỊCH SỬ BIẾN ĐỘNG LƯƠNG
-- CHẠY BẰNG TÀI KHOẢN 'EMS_ADMIN' VÀO 'FREEPDB1'
--
-- Mục tiêu: Mỗi khi cột Luong trong NHAN_VIEN bị UPDATE (giá trị thực sự thay
-- đổi), tự động chèn 1 dòng vào LICH_SU_LUONG ghi lại Lương cũ/mới và người
-- thực hiện (lấy từ Application Context ctx_qlnv.USER_ID do
-- pkg_sec_admin.set_context thiết lập - xem 03_noidung_1_2_logic.sql).
-- ==============================================================================

CREATE OR REPLACE TRIGGER trg_lich_su_luong
AFTER UPDATE OF Luong ON NHAN_VIEN
FOR EACH ROW
WHEN (NVL(OLD.Luong, -1) != NVL(NEW.Luong, -1))
BEGIN
    INSERT INTO LICH_SU_LUONG (MaNV, LuongCu, LuongMoi, NgayDoi, NguoiThucHien)
    VALUES (:OLD.MaNV, :OLD.Luong, :NEW.Luong, SYSTIMESTAMP, SYS_CONTEXT('ctx_qlnv', 'USER_ID'));
END;
/


-- ==============================================================================
-- KIỂM THỬ (CHẠY BẰNG TÀI KHOẢN 'EMS_ADMIN' VÀO 'FREEPDB1')
-- ==============================================================================
-- BEGIN
--     pkg_sec_admin.set_context('USR_003', 'HR_MANAGER', 'HR');
-- END;
-- /
-- UPDATE NHAN_VIEN SET Luong = Luong + 1000000 WHERE MaNV = 'NV_IT02';
-- COMMIT;
--
-- SELECT * FROM LICH_SU_LUONG WHERE MaNV = 'NV_IT02' ORDER BY NgayDoi DESC;
