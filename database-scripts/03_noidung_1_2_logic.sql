-- ==============================================================================
-- SCRIPT 03: LOGIC BẢO MẬT CHO NỘI DUNG 1 & 2
-- LƯU Ý: Chạy bằng tài khoản EMS_ADMIN trên kết nối FREEPDB1
-- ==============================================================================

-- ==============================================================================
-- NỘI DUNG 1: THIẾT LẬP ĐỊNH DANH (APPLICATION CONTEXT)
-- ==============================================================================
CREATE OR REPLACE CONTEXT ctx_qlnv USING pkg_sec_admin;
/

CREATE OR REPLACE PACKAGE pkg_sec_admin AS
    PROCEDURE set_context(p_user_id VARCHAR2, p_role VARCHAR2, p_mapb VARCHAR2);
END;
/

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
-- NỘI DUNG 2: BẢO MẬT MỨC DÒNG (VPD CÔ LẬP PHÒNG BAN NGHIÊM NGẶT)
-- ==============================================================================
CREATE OR REPLACE FUNCTION fun_vpd_nhanvien(
    p_schema IN VARCHAR2,
    p_object IN VARCHAR2
) RETURN VARCHAR2 AS
    v_mapb VARCHAR2(10);
BEGIN
    v_mapb := SYS_CONTEXT('ctx_qlnv', 'MAPB');
    IF v_mapb IS NULL THEN
        RETURN '1=2'; 
    END IF;
    IF v_mapb = 'ALL' THEN
        RETURN '1=1';
    END IF;
    RETURN 'MaPB = ''' || v_mapb || '''';
END;
/

BEGIN
    DBMS_RLS.ADD_POLICY(
        object_schema         => 'EMS_ADMIN',
        object_name           => 'NHAN_VIEN',
        policy_name           => 'vpd_policy_nhanvien',
        function_schema       => 'EMS_ADMIN',
        policy_function       => 'fun_vpd_nhanvien',
        statement_types       => 'SELECT'
    );
END;
/

-- ==============================================================================
-- NỘI DUNG MỞ RỘNG: KHỞI TẠO ORACLE LABEL SECURITY (OLS) VÀ DÁN NHÃN DỮ LIỆU
-- ==============================================================================
BEGIN
    -- 0. Dọn dẹp cấu hình cũ để Oracle nhận cấu hình mới (Tránh bị kẹt ở NO_CONTROL cũ)
    BEGIN
        SA_POLICY_ADMIN.REMOVE_TABLE_POLICY('ems_ols_policy', 'EMS_ADMIN', 'DU_AN');
        SA_SYSDBA.DROP_POLICY('ems_ols_policy', TRUE);
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;

    -- 1. Tạo mới chính sách OLS
    SA_SYSDBA.CREATE_POLICY(
        policy_name     => 'ems_ols_policy',
        column_name     => 'ols_label',
        default_options => 'READ_CONTROL,WRITE_CONTROL'
    );

    -- 2. Định nghĩa các cấp độ Level
    SA_COMPONENTS.CREATE_LEVEL('ems_ols_policy', 100, 'PUB', 'PUBLIC');
    SA_COMPONENTS.CREATE_LEVEL('ems_ols_policy', 200, 'CONF', 'CONFIDENTIAL');
    SA_COMPONENTS.CREATE_LEVEL('ems_ols_policy', 300, 'SEC', 'SECRET');

    -- 3. Khởi tạo các chuỗi nhãn
    SA_LABEL_ADMIN.CREATE_LABEL('ems_ols_policy', 100, 'PUB');
    SA_LABEL_ADMIN.CREATE_LABEL('ems_ols_policy', 200, 'CONF');
    SA_LABEL_ADMIN.CREATE_LABEL('ems_ols_policy', 300, 'SEC');

    -- 4. Cấp hạn mức và phân quyền nhãn cho chính User quản trị EMS_ADMIN
    SA_USER_ADMIN.SET_LEVELS(
        policy_name  => 'ems_ols_policy',
        user_name    => 'EMS_ADMIN',
        max_level    => 'SEC',
        min_level    => 'PUB',
        def_level    => 'SEC',
        row_level    => 'SEC'
    );

    -- 5. Áp dụng chính sách kiểm soát an toàn lên bảng DU_AN
    SA_POLICY_ADMIN.APPLY_TABLE_POLICY(
        policy_name    => 'ems_ols_policy',
        schema_name    => 'EMS_ADMIN',
        table_name     => 'DU_AN',
        table_options  => 'READ_CONTROL,WRITE_CONTROL'
    );
END;
/

-- 6. ĐỒNG BỘ DÁN NHÃN VẬT LÝ CHO DỮ LIỆU CŨ ĐỂ KHÔNG BỊ TRỐNG BẢNG
UPDATE EMS_ADMIN.DU_AN SET ols_label = CHAR_TO_LABEL('ems_ols_policy', 'PUB') WHERE MaDA IN ('DA_PUB_01', 'DA_PUB_02');
UPDATE EMS_ADMIN.DU_AN SET ols_label = CHAR_TO_LABEL('ems_ols_policy', 'CONF') WHERE MaDA IN ('DA_CON_01', 'DA_CON_02');
UPDATE EMS_ADMIN.DU_AN SET ols_label = CHAR_TO_LABEL('ems_ols_policy', 'SEC') WHERE MaDA IN ('DA_SEC_01', 'DA_SEC_02');

COMMIT;