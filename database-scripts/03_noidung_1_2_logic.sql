-- ==============================================================================
-- SCRIPT 03: LOGIC BẢO MẬT HOÀN CHỈNH (VPD & OLS & REDACTION)
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
-- NỘI DUNG 2: BẢO MẬT MỨC DÒNG (VPD CÔ LẬP PHÒNG BAN)
-- ==============================================================================
CREATE OR REPLACE FUNCTION fun_vpd_nhanvien(p_schema IN VARCHAR2, p_object IN VARCHAR2) RETURN VARCHAR2 AS
    v_mapb VARCHAR2(10);
    v_role VARCHAR2(50);
BEGIN
    v_mapb := SYS_CONTEXT('ctx_qlnv', 'MAPB');
    v_role := SYS_CONTEXT('ctx_qlnv', 'ROLE');
    IF v_role IN ('HR_MANAGER', 'HR_STAFF') THEN RETURN '1=1'; END IF;
    IF v_mapb IS NOT NULL AND v_mapb != 'ALL' THEN RETURN 'MaPB = ''' || v_mapb || ''''; END IF;
    RETURN '1=2';
END;
/

BEGIN
    DBMS_RLS.DROP_POLICY('EMS_ADMIN', 'NHAN_VIEN', 'vpd_policy_nhanvien');
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    DBMS_RLS.ADD_POLICY(
        object_schema    => 'EMS_ADMIN',
        object_name      => 'NHAN_VIEN',
        policy_name      => 'vpd_policy_nhanvien',
        function_schema  => 'EMS_ADMIN',
        policy_function  => 'fun_vpd_nhanvien',
        statement_types  => 'SELECT, INSERT, UPDATE, DELETE',
        update_check     => TRUE
    );
END;
/

-- ==============================================================================
-- NỘI DUNG 3: BẢO MẬT CỘT DỮ LIỆU (DATA REDACTION CHO LƯƠNG)
-- ==============================================================================
BEGIN
    DBMS_REDACT.DROP_POLICY('EMS_ADMIN', 'NHAN_VIEN', 'redact_salary_policy');
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    DBMS_REDACT.ADD_POLICY(
        object_schema => 'EMS_ADMIN',
        object_name   => 'NHAN_VIEN',
        column_name   => 'LUONG',
        policy_name   => 'redact_salary_policy',
        function_type => DBMS_REDACT.FULL,
        expression    => 'SYS_CONTEXT(''ctx_qlnv'', ''ROLE'') IN (''HR_STAFF'', ''STAFF'')'
    );
END;
/

-- ==============================================================================
-- NỘI DUNG MỞ RỘNG: KHỞI TẠO ORACLE LABEL SECURITY (OLS)
-- ==============================================================================
BEGIN
    BEGIN
        SA_POLICY_ADMIN.REMOVE_TABLE_POLICY('ems_ols_policy', 'EMS_ADMIN', 'DU_AN');
        SA_SYSDBA.DROP_POLICY('ems_ols_policy', TRUE);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    SA_SYSDBA.CREATE_POLICY('ems_ols_policy', 'ols_label', 'READ_CONTROL,WRITE_CONTROL');
    SA_COMPONENTS.CREATE_LEVEL('ems_ols_policy', 100, 'PUB', 'PUBLIC');
    SA_COMPONENTS.CREATE_LEVEL('ems_ols_policy', 200, 'CONF', 'CONFIDENTIAL');
    SA_COMPONENTS.CREATE_LEVEL('ems_ols_policy', 300, 'SEC', 'SECRET');
    SA_LABEL_ADMIN.CREATE_LABEL('ems_ols_policy', 100, 'PUB');
    SA_LABEL_ADMIN.CREATE_LABEL('ems_ols_policy', 200, 'CONF');
    SA_LABEL_ADMIN.CREATE_LABEL('ems_ols_policy', 300, 'SEC');
    SA_USER_ADMIN.SET_LEVELS('ems_ols_policy', 'EMS_ADMIN', 'SEC', 'PUB', 'SEC', 'SEC');
    SA_POLICY_ADMIN.APPLY_TABLE_POLICY('ems_ols_policy', 'EMS_ADMIN', 'DU_AN', 'READ_CONTROL,WRITE_CONTROL');
END;
/

UPDATE EMS_ADMIN.DU_AN SET ols_label = CHAR_TO_LABEL('ems_ols_policy', 'PUB') WHERE MaDA IN ('DA_PUB_01', 'DA_PUB_02');
UPDATE EMS_ADMIN.DU_AN SET ols_label = CHAR_TO_LABEL('ems_ols_policy', 'CONF') WHERE MaDA IN ('DA_CON_01', 'DA_CON_02');
UPDATE EMS_ADMIN.DU_AN SET ols_label = CHAR_TO_LABEL('ems_ols_policy', 'SEC') WHERE MaDA IN ('DA_SEC_01', 'DA_SEC_02');

COMMIT;