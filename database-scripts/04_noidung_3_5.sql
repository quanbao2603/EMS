-- ==============================================================================
-- SCRIPT 04: LOGIC BẢO MẬT CHO NỘI DUNG 3 (QUẢN LÝ) & NỘI DUNG 5 (KẾ TOÁN)
-- LƯU Ý: Chạy bằng tài khoản EMS_ADMIN trên kết nối FREEPDB1
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HÀM VPD SELECT 
-- Quản lý (MANAGER) xem cùng phòng ban, Kế toán (ACCOUNTANT) xem khác phòng ban
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fun_vpd_nhanvien(
    p_schema IN VARCHAR2,
    p_object IN VARCHAR2
) RETURN VARCHAR2 AS
    v_role VARCHAR2(50);
    v_mapb VARCHAR2(10);
BEGIN
    v_role := SYS_CONTEXT('ctx_qlnv', 'ROLE');
    v_mapb := SYS_CONTEXT('ctx_qlnv', 'MAPB');

    -- Chặn truy cập nếu không tồn tại Application Context
    IF v_mapb IS NULL OR v_role IS NULL THEN
        RETURN '1=2'; 
    END IF;

    --  Bộ phận Kế toán: Chỉ xem dữ liệu của nhân sự KHÁC phòng ban
    IF v_role = 'ACCOUNTANT' THEN
        RETURN 'MaPB != ''' || v_mapb || '''';
    END IF;

    -- Quản lý & Nhân viên thường: Chỉ xem dữ liệu CÙNG phòng ban
    IF v_role IN ('MANAGER', 'STAFF') THEN
        RETURN 'MaPB = ''' || v_mapb || '''';
    END IF;

    -- Chặn mặc định đối với các Role khác (Sẽ mở rộng cho HR ở Phần 4)
    RETURN '1=2';
END;
/



-- ------------------------------------------------------------------------------
-- 2. TẠO HÀM VÀ CHÍNH SÁCH VPD DML
-- Đảm bảo Quản lý, Nhân viên, Kế toán không thể Insert/Update/Delete
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fun_vpd_nhanvien_dml(
    p_schema IN VARCHAR2,
    p_object IN VARCHAR2
) RETURN VARCHAR2 AS
    v_role VARCHAR2(50);
BEGIN
    v_role := SYS_CONTEXT('ctx_qlnv', 'ROLE');
    
    -- Trưởng phòng (MANAGER), Nhân viên (STAFF), Kế toán (ACCOUNTANT) bị chặn DML hoàn toàn
    IF v_role IN ('MANAGER', 'STAFF', 'ACCOUNTANT') THEN
        RETURN '1=2';
    END IF;
    
    -- Mở tạm để chờ cấu hình riêng cho bộ phận HR ở phần 4
    RETURN '1=1'; 
END;
/

-- Áp dụng Policy DML lên bảng NHAN_VIEN
BEGIN
    -- 
    BEGIN
        DBMS_RLS.DROP_POLICY('EMS_ADMIN', 'NHAN_VIEN', 'vpd_policy_nhanvien_dml');
    EXCEPTION WHEN OTHERS THEN NULL; END;

    DBMS_RLS.ADD_POLICY(
        object_schema   => 'EMS_ADMIN',
        object_name     => 'NHAN_VIEN',
        policy_name     => 'vpd_policy_nhanvien_dml',
        function_schema => 'EMS_ADMIN',
        policy_function => 'fun_vpd_nhanvien_dml',
        statement_types => 'INSERT, UPDATE, DELETE',
        update_check    => TRUE
    );
END;
/


-- ------------------------------------------------------------------------------
-- 3. BẢO MẬT MỨC CỘT (DATA REDACTION) CHO BỘ PHẬN KẾ TOÁN (Nội dung 5)
-- Giải quyết: Kế toán chỉ xem được 3 cột: MaNV, Luong, MaSoThue (Che các cột còn lại)
-- ------------------------------------------------------------------------------
BEGIN
    -- Dọn dẹp Policy cũ (nếu có)
    BEGIN 
        DBMS_REDACT.DROP_POLICY('EMS_ADMIN', 'NHAN_VIEN', 'redact_nhanvien_columns'); 
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- Khởi tạo Policy
    DBMS_REDACT.ADD_POLICY(
        object_schema      => 'EMS_ADMIN',
        object_name        => 'NHAN_VIEN',
        policy_name        => 'redact_nhanvien_columns',
        expression         => '1=1' 
    );

    -- Ẩn cột HoTen
    DBMS_REDACT.ALTER_POLICY(
        object_schema => 'EMS_ADMIN', object_name => 'NHAN_VIEN',
        policy_name => 'redact_nhanvien_columns', action => DBMS_REDACT.ADD_COLUMN,
        column_name => 'HoTen', function_type => DBMS_REDACT.FULL,
        expression => 'SYS_CONTEXT(''ctx_qlnv'', ''ROLE'') = ''ACCOUNTANT'''
    );
    
    -- Ẩn cột NgaySinh
    DBMS_REDACT.ALTER_POLICY(
        object_schema => 'EMS_ADMIN', object_name => 'NHAN_VIEN',
        policy_name => 'redact_nhanvien_columns', action => DBMS_REDACT.ADD_COLUMN,
        column_name => 'NgaySinh', function_type => DBMS_REDACT.FULL,
        expression => 'SYS_CONTEXT(''ctx_qlnv'', ''ROLE'') = ''ACCOUNTANT'''
    );
    
    -- Ẩn cột SDT
    DBMS_REDACT.ALTER_POLICY(
        object_schema => 'EMS_ADMIN', object_name => 'NHAN_VIEN',
        policy_name => 'redact_nhanvien_columns', action => DBMS_REDACT.ADD_COLUMN,
        column_name => 'SDT', function_type => DBMS_REDACT.FULL,
        expression => 'SYS_CONTEXT(''ctx_qlnv'', ''ROLE'') = ''ACCOUNTANT'''
    );
    
    -- Ẩn cột MaPB
    DBMS_REDACT.ALTER_POLICY(
        object_schema => 'EMS_ADMIN', object_name => 'NHAN_VIEN',
        policy_name => 'redact_nhanvien_columns', action => DBMS_REDACT.ADD_COLUMN,
        column_name => 'MaPB', function_type => DBMS_REDACT.FULL,
        expression => 'SYS_CONTEXT(''ctx_qlnv'', ''ROLE'') = ''ACCOUNTANT'''
    );
END;
/