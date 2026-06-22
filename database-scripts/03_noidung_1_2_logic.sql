-- ==============================================================================
-- SCRIPT 03: LOGIC BẢO MẬT CHO NỘI DUNG 1 & 2
-- LƯU Ý: Chạy bằng tài khoản EMS_ADMIN trên kết nối FREEPDB1
-- ==============================================================================

-- ==============================================================================
-- NỘI DUNG 1: THIẾT LẬP ĐỊNH DANH (APPLICATION CONTEXT)
-- ==============================================================================
-- Khởi tạo đối tượng Application Context
CREATE OR REPLACE CONTEXT ctx_qlnv USING pkg_sec_admin;

-- Phát triển package pkg_sec_admin
CREATE OR REPLACE PACKAGE pkg_sec_admin AS
    PROCEDURE set_context(p_user_id VARCHAR2, p_role VARCHAR2, p_mapb VARCHAR2);
END;
/

-- Phát triển package pkg_sec_admin (Phần thân)
CREATE OR REPLACE PACKAGE BODY pkg_sec_admin AS
    PROCEDURE set_context(p_user_id VARCHAR2, p_role VARCHAR2, p_mapb VARCHAR2) IS
    BEGIN
        DBMS_SESSION.SET_CONTEXT('ctx_qlnv', 'USER_ID', p_user_id);
        DBMS_SESSION.SET_CONTEXT('ctx_qlnv', 'ROLE', p_role);
        DBMS_SESSION.SET_CONTEXT('ctx_qlnv', 'MAPB', p_mapb);
    END;
END;
/

-- ==============================================================================
-- NỘI DUNG 2: BẢO MẬT MỨC DÒNG (VPD) TRÊN BẢNG NHAN_VIEN
-- ==============================================================================
-- 1. Tạo hàm Policy thiết lập ràng buộc truy cập
CREATE OR REPLACE FUNCTION fun_vpd_nhanvien(
    p_schema IN VARCHAR2,
    p_object IN VARCHAR2
) RETURN VARCHAR2 AS
    v_mapb VARCHAR2(10);
BEGIN
    v_mapb := SYS_CONTEXT('ctx_qlnv', 'MAPB');
    -- Nếu không có Context -> Chặn truy cập
    IF v_mapb IS NULL THEN
        RETURN '1=2'; 
    END IF;
    -- Ràng buộc: MaPB phải trùng khớp với Context
    RETURN 'MaPB = ''' || v_mapb || '''';
END;
/

-- 2. Áp dụng DBMS_RLS.ADD_POLICY vào bảng NHAN_VIEN
BEGIN
    DBMS_RLS.ADD_POLICY(
        object_schema   => 'EMS_ADMIN',
        object_name     => 'NHAN_VIEN',
        policy_name     => 'vpd_policy_nhanvien',
        function_schema => 'EMS_ADMIN',
        policy_function => 'fun_vpd_nhanvien',
        statement_types => 'SELECT'
    );
END;
/

-- 3. Thu hồi đặc quyền INSERT, UPDATE, DELETE ON NHAN_VIEN
REVOKE INSERT, UPDATE, DELETE ON NHAN_VIEN FROM PUBLIC;


-- ==============================================================================
-- KHỞI TẠO ORACLE LABEL SECURITY (OLS) TRÊN BẢNG DU_AN
-- ==============================================================================
BEGIN
    -- 1. DỌN DẸP CẤU HÌNH CŨ
    BEGIN
        SA_POLICY_ADMIN.REMOVE_TABLE_POLICY('ems_ols_policy', 'EMS_ADMIN', 'DU_AN');
        SA_SYSDBA.DROP_POLICY('ems_ols_policy', TRUE);
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;

    -- 2. ĐỊNH NGHĨA LẠI CHÍNH SÁCH
    SA_SYSDBA.CREATE_POLICY(
        policy_name => 'ems_ols_policy',
        column_name => 'ols_label',
        default_options => 'READ_CONTROL,WRITE_CONTROL'
    );

    -- 3. THIẾT LẬP CẤP ĐỘ NHÃN
    SA_COMPONENTS.CREATE_LEVEL('ems_ols_policy', 10, 'PUB', 'PUBLIC');
    SA_COMPONENTS.CREATE_LEVEL('ems_ols_policy', 20, 'CONF', 'CONFIDENTIAL');
    SA_COMPONENTS.CREATE_LEVEL('ems_ols_policy', 30, 'SEC', 'SECRET');

    -- 4. KHỞI TẠO NHÃN THỰC TẾ
    SA_LABEL_ADMIN.CREATE_LABEL('ems_ols_policy', 10, 'PUB');
    SA_LABEL_ADMIN.CREATE_LABEL('ems_ols_policy', 20, 'CONF');
    SA_LABEL_ADMIN.CREATE_LABEL('ems_ols_policy', 30, 'SEC');

    -- 5. GẮN CHÍNH SÁCH VÀO BẢNG DU_AN
    SA_POLICY_ADMIN.APPLY_TABLE_POLICY(
        policy_name    => 'ems_ols_policy',
        schema_name    => 'EMS_ADMIN',
        table_name     => 'DU_AN',
        table_options  => 'NO_CONTROL' 
    );
END;
/