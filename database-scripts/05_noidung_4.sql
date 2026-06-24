-- ==============================================================================
-- SCRIPT TÍCH HỢP NỘI DUNG 4: LOGIC HR, TRIGGER LƯƠNG VÀ OLS
-- LƯU Ý: Chạy bằng tài khoản EMS_ADMIN trên kết nối FREEPDB1
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TÍCH HỢP LOGIC VPD CỦA BẠN BẠN VÀO MASTER POLICY HIỆN TẠI
-- ------------------------------------------------------------------------------
-- Cập nhật hàm SELECT
CREATE OR REPLACE FUNCTION fun_vpd_nhanvien(p_schema IN VARCHAR2, p_object IN VARCHAR2) RETURN VARCHAR2 AS
    v_role VARCHAR2(50) := SYS_CONTEXT('ctx_qlnv', 'ROLE');
    v_mapb VARCHAR2(10) := SYS_CONTEXT('ctx_qlnv', 'MAPB');
BEGIN
    IF v_mapb IS NULL OR v_role IS NULL THEN RETURN '1=2'; END IF;
    IF v_role = 'ACCOUNTANT' THEN RETURN 'MaPB != ''' || v_mapb || ''''; END IF;
    IF v_role IN ('MANAGER', 'STAFF') THEN RETURN 'MaPB = ''' || v_mapb || ''''; END IF;
    
    IF v_role = 'HR_MANAGER' THEN RETURN '1=1'; END IF;
    IF v_role = 'HR_STAFF' THEN RETURN 'MaPB != ''HR'''; END IF;

    RETURN '1=2';
END;
/

-- Cập nhật hàm DML
CREATE OR REPLACE FUNCTION fun_vpd_nhanvien_dml(p_schema IN VARCHAR2, p_object IN VARCHAR2) RETURN VARCHAR2 AS
    v_role VARCHAR2(50) := SYS_CONTEXT('ctx_qlnv', 'ROLE');
BEGIN
    IF v_role IN ('MANAGER', 'STAFF', 'ACCOUNTANT') THEN RETURN '1=2'; END IF;
    
    -- [CODE CỦA BẠN BẠN]
    IF v_role = 'HR_MANAGER' THEN RETURN '1=1'; END IF;
    IF v_role = 'HR_STAFF' THEN RETURN 'MaPB != ''HR'''; END IF;
    
    RETURN '1=2'; 
END;
/

-- ------------------------------------------------------------------------------
-- 2. TRIGGER KIỂM SOÁT LƯƠNG (GIỮ NGUYÊN LOGIC CỦA BẠN BẠN)
-- ------------------------------------------------------------------------------
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
    
    -- Trưởng phòng HR (HR_MANAGER) sửa lương hợp lệ -> Lưu vết tự động
    ELSIF v_role = 'HR_MANAGER' THEN
        IF :OLD.Luong <> :NEW.Luong THEN
            INSERT INTO EMS_ADMIN.LICH_SU_LUONG (MaNV, LuongCu, LuongMoi, NgayDoi, NguoiThucHien)
            VALUES (:OLD.MaNV, :OLD.Luong, :NEW.Luong, SYSTIMESTAMP, SYS_CONTEXT('ctx_qlnv', 'USER_ID'));
        END IF;
    END IF;
END;
/

-- ------------------------------------------------------------------------------
-- 3. BỔ SUNG YÊU CẦU OLS BỊ THIẾU TỪ ĐỀ CƯƠNG
-- ------------------------------------------------------------------------------
BEGIN
    -- Thiết lập tự động gắn nhãn (Row Labeling / LABEL_DEFAULT) cho bảng DU_AN
    BEGIN
        SA_POLICY_ADMIN.REMOVE_TABLE_POLICY('ems_ols_policy', 'EMS_ADMIN', 'DU_AN');
    EXCEPTION WHEN OTHERS THEN NULL; 
    END;

    SA_POLICY_ADMIN.APPLY_TABLE_POLICY(
        policy_name    => 'ems_ols_policy',
        schema_name    => 'EMS_ADMIN',
        table_name     => 'DU_AN',
        table_options  => 'READ_CONTROL, WRITE_CONTROL, CHECK_CONTROL, LABEL_DEFAULT' 
    );
END;
/

-- Gán nhãn SECRET cho User thao tác (Ví dụ: HR_MANAGER map với Database User là EMS_HR_MGR)
-- LƯU Ý: Nếu hệ thống của bạn dùng Connection Pooling qua 1 tài khoản EMS_ADMIN, 
-- lệnh này mang tính biểu diễn logic cấu hình trong CSDL. Thực tế Backend sẽ gọi 
-- SA_SESSION.SET_LABEL('ems_ols_policy', 'SECRET') ở Interceptor.
BEGIN
    BEGIN
        SA_USER_ADMIN.SET_USER_LABELS(
            policy_name => 'ems_ols_policy',
            user_name   => 'EMS_ADMIN', -- Thay bằng User thực tế nếu hệ thống cấp riêng tài khoản DB
            max_read_label => 'SECRET'
        );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END;
/

COMMIT;