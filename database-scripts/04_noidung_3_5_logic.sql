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

    -- [Bổ sung để đồng bộ Nội dung 1 & 4]: Đảm bảo bộ phận HR không bị mù dữ liệu
    IF v_role IN ('HR_MANAGER', 'HR_STAFF') THEN
        RETURN '1=1';
    END IF;

    -- Chặn mặc định đối với các Role khác (Sẽ mở rộng cho HR ở Phần 4)
    RETURN '1=2';
END;
/

-- Áp dụng Policy SELECT lên bảng NHAN_VIEN (Cập nhật lại policy cũ nếu có)
BEGIN
    BEGIN 
        DBMS_RLS.DROP_POLICY('EMS_ADMIN', 'NHAN_VIEN', 'vpd_policy_nhanvien'); 
    EXCEPTION WHEN OTHERS THEN NULL; END;

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

-- Bước 3.1: Dọn dẹp tự động mọi chính sách Redaction cũ (tránh lỗi bóng ma ORA-28069)
DECLARE
    CURSOR c_policies IS
        SELECT policy_name 
        FROM redaction_policies 
        WHERE object_owner = 'EMS_ADMIN' AND object_name = 'NHAN_VIEN';
BEGIN
    FOR rec IN c_policies LOOP
        DBMS_REDACT.DROP_POLICY(
            object_schema => 'EMS_ADMIN',
            object_name   => 'NHAN_VIEN',
            policy_name   => rec.policy_name
        );
    END LOOP;
END;
/

-- Bước 3.2: Khôi phục bảo mật Lương cho STAFF bằng Data Hiding (VPD Mức Cột)
CREATE OR REPLACE FUNCTION fun_hide_luong(p_schema IN VARCHAR2, p_object IN VARCHAR2) RETURN VARCHAR2 AS
    v_role VARCHAR2(50) := SYS_CONTEXT('ctx_qlnv', 'ROLE');
BEGIN
    -- STAFF và HR_STAFF bị biến cột LUONG thành NULL
    IF v_role IN ('STAFF', 'HR_STAFF') THEN
        RETURN '1=2';
    END IF;
    RETURN '1=1';
END;
/

BEGIN
    BEGIN DBMS_RLS.DROP_POLICY('EMS_ADMIN', 'NHAN_VIEN', 'vpd_hide_luong'); EXCEPTION WHEN OTHERS THEN NULL; END;
    DBMS_RLS.ADD_POLICY(
        object_schema         => 'EMS_ADMIN',
        object_name           => 'NHAN_VIEN',
        policy_name           => 'vpd_hide_luong',
        function_schema       => 'EMS_ADMIN',
        policy_function       => 'fun_hide_luong',
        statement_types       => 'SELECT',
        sec_relevant_cols     => 'LUONG',
        sec_relevant_cols_opt => DBMS_RLS.ALL_ROWS
    );
END;
/

-- Bước 3.3: Khởi tạo Policy Data Redaction chuẩn xác cho Kế toán
BEGIN
    -- Khởi tạo Policy gắn luôn điều kiện
    DBMS_REDACT.ADD_POLICY(
        object_schema => 'EMS_ADMIN',
        object_name   => 'NHAN_VIEN',
        column_name   => 'HoTen',
        policy_name   => 'redact_accountant_nhanvien',
        function_type => DBMS_REDACT.FULL,
        expression    => 'SYS_CONTEXT(''ctx_qlnv'', ''ROLE'') = ''ACCOUNTANT''' 
    );

    -- Ẩn các cột còn lại (Tuyệt đối không dùng lại expression để tránh ORA-28095)
    DBMS_REDACT.ALTER_POLICY('EMS_ADMIN', 'NHAN_VIEN', 'redact_accountant_nhanvien', DBMS_REDACT.ADD_COLUMN, 'NgaySinh');
    DBMS_REDACT.ALTER_POLICY('EMS_ADMIN', 'NHAN_VIEN', 'redact_accountant_nhanvien', DBMS_REDACT.ADD_COLUMN, 'SDT');
    DBMS_REDACT.ALTER_POLICY('EMS_ADMIN', 'NHAN_VIEN', 'redact_accountant_nhanvien', DBMS_REDACT.ADD_COLUMN, 'MaPB');
END;
/


-- ------------------------------------------------------------------------------
-- 4. VPD MỞ RỘNG TRÊN BẢNG CHAM_CONG
-- Giải quyết: Nhân viên xem ngày công của mình, Kế toán (và Quản lý) xem toàn bộ
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fun_vpd_chamcong(
    p_schema IN VARCHAR2,
    p_object IN VARCHAR2
) RETURN VARCHAR2 AS
    v_role VARCHAR2(50);
    v_userid VARCHAR2(20);
BEGIN
    v_role := SYS_CONTEXT('ctx_qlnv', 'ROLE');
    v_userid := SYS_CONTEXT('ctx_qlnv', 'USER_ID');

    -- Nhân viên thường chỉ xem được ngày công của chính mình
    IF v_role = 'STAFF' THEN
        RETURN 'MaNV = ''' || v_userid || '''';
    END IF;

    -- Kế toán, Quản lý, HR xem toàn bộ công ty
    IF v_role IN ('ACCOUNTANT', 'MANAGER', 'HR_MANAGER', 'HR_STAFF') THEN
        RETURN '1=1';
    END IF;

    -- Chặn mặc định
    RETURN '1=2';
END;
/

-- Áp dụng Policy lên bảng CHAM_CONG
BEGIN
    BEGIN 
        DBMS_RLS.DROP_POLICY('EMS_ADMIN', 'CHAM_CONG', 'vpd_policy_chamcong'); 
    EXCEPTION WHEN OTHERS THEN NULL; END;

    DBMS_RLS.ADD_POLICY(
        object_schema   => 'EMS_ADMIN',
        object_name     => 'CHAM_CONG',
        policy_name     => 'vpd_policy_chamcong',
        function_schema => 'EMS_ADMIN',
        policy_function => 'fun_vpd_chamcong',
        statement_types => 'SELECT'
    );
END;
/

-- Xác nhận thay đổi
COMMIT;