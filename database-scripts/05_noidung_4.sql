-- 1. Hiện thực VPD (Chính sách bảo mật mức dòng cho phòng ban HR
-- CHẠY BẰNG USER: EMS_ADMIN
CREATE OR REPLACE FUNCTION fn_policy_hr_dept (
    p_schema IN VARCHAR2,
    p_object IN VARCHAR2
) RETURN VARCHAR2 
IS
    v_role VARCHAR2(50);
BEGIN
    v_role := SYS_CONTEXT('ctx_qlnv', 'ROLE');

    -- Trưởng phòng HR (HR_MANAGER) -> Được xem toàn bộ dữ liệu không lọc
    IF v_role = 'HR_MANAGER' THEN
        RETURN '1=1';
    -- Nhân viên HR (HR_STAFF) -> Áp dụng logic phủ định (Xem toàn công ty trừ chính phòng HR)
    ELSIF v_role = 'HR_STAFF' THEN
        RETURN 'MaPB != ''HR''';
    ELSE
        RETURN NULL;
    END IF;
END;
/

BEGIN
    DBMS_RLS.ADD_POLICY (
        object_schema   => 'EMS_ADMIN',
        object_name     => 'NHAN_VIEN',
        policy_name     => 'plc_hr_restriction',
        function_schema => 'EMS_ADMIN',
        policy_function => 'fn_policy_hr_dept',
        statement_types => 'SELECT, INSERT, UPDATE, DELETE',
        update_check    => TRUE
    );
END;
/

-- 2. Hiện thực Trigger kiểm soát thuộc tính Lương và ghi vết biến động lương
-- CHẠY BẰNG USER: EMS_ADMIN
CREATE OR REPLACE TRIGGER trg_hr_salary_control
BEFORE UPDATE OF Luong ON EMS_ADMIN.NHAN_VIEN
FOR EACH ROW
DECLARE
    v_role VARCHAR2(50);
BEGIN
    v_role := SYS_CONTEXT('ctx_qlnv', 'ROLE');

    -- Chặn đứng nhân viên HR (HR_STAFF) không cho can thiệp sửa cột lương
    IF v_role = 'HR_STAFF' THEN
        RAISE_APPLICATION_ERROR(-20403, 'Lỗi bảo mật (HTTP 403): Nhan vien HR khong co quyen chinh sua cot Luong.');
    
    -- Trưởng phòng HR (HR_MANAGER) sửa lương hợp lệ -> Lưu vết tự động vào bảng LICH_SU_LUONG
    ELSIF v_role = 'HR_MANAGER' THEN
        IF :OLD.Luong <> :NEW.Luong THEN
            INSERT INTO EMS_ADMIN.LICH_SU_LUONG (
                MaNV,
                LuongCu,
                LuongMoi,
                NgayDoi,
                NguoiThucHien
            ) VALUES (
                :OLD.MaNV,
                :OLD.Luong,
                :NEW.Luong,
                SYSTIMESTAMP,
                SYS_CONTEXT('ctx_qlnv', 'USER_ID')
            );
        END IF;
    END IF;
END;
/
