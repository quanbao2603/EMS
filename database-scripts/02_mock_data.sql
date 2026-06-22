-- ==============================================================================
-- SCRIPT CHÈN DỮ LIỆU GIẢ LẬP (MOCK DATA)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. BẢNG PHÒNG BAN
-- ------------------------------------------------------------------------------
INSERT INTO PHONG_BAN (MaPB, TenPB) VALUES ('BOD', 'Ban Giam Doc');
INSERT INTO PHONG_BAN (MaPB, TenPB) VALUES ('HR', 'Phong Nhan Su');
INSERT INTO PHONG_BAN (MaPB, TenPB) VALUES ('IT', 'Phong Cong Nghe Thong Tin');
INSERT INTO PHONG_BAN (MaPB, TenPB) VALUES ('ACC', 'Phong Ke Toan');
INSERT INTO PHONG_BAN (MaPB, TenPB) VALUES ('MKT', 'Phong Marketing');

-- ------------------------------------------------------------------------------
-- 2. BẢNG NHÓM QUYỀN
-- ------------------------------------------------------------------------------
INSERT INTO APP_ROLES (Role_Name, Description) VALUES ('HR_MANAGER', 'Truong phong Nhan su (Full Access HR)');
INSERT INTO APP_ROLES (Role_Name, Description) VALUES ('HR_STAFF', 'Nhan vien Nhan su (View HR, No Update Salary)');
INSERT INTO APP_ROLES (Role_Name, Description) VALUES ('MANAGER', 'Quan ly chuyen mon (View Salary)');
INSERT INTO APP_ROLES (Role_Name, Description) VALUES ('ACCOUNTANT', 'Ke toan (Data Redaction Applied)');
INSERT INTO APP_ROLES (Role_Name, Description) VALUES ('STAFF', 'Nhan vien tieu chuan (No Salary View)');

-- ------------------------------------------------------------------------------
-- 3. BẢNG NHÂN VIÊN
-- ------------------------------------------------------------------------------
-- Khối BOD
INSERT INTO NHAN_VIEN VALUES ('NV_BOD01', 'Tran Van Giam Doc', TO_DATE('1980-05-15', 'YYYY-MM-DD'), '0901111111', 80000000, 'MST00001', 'BOD');
INSERT INTO NHAN_VIEN VALUES ('NV_BOD02', 'Le Thi Pho Giam Doc', TO_DATE('1982-10-20', 'YYYY-MM-DD'), '0901111112', 70000000, 'MST00002', 'BOD');

-- Khối HR
INSERT INTO NHAN_VIEN VALUES ('NV_HR01', 'Nguyen Truong Nhan Su', TO_DATE('1985-08-20', 'YYYY-MM-DD'), '0902222221', 45000000, 'MST00003', 'HR');
INSERT INTO NHAN_VIEN VALUES ('NV_HR02', 'Le Thi Tuyen Dung', TO_DATE('1995-02-10', 'YYYY-MM-DD'), '0902222222', 15000000, 'MST00004', 'HR');
INSERT INTO NHAN_VIEN VALUES ('NV_HR03', 'Pham Van Dao Tao', TO_DATE('1996-11-25', 'YYYY-MM-DD'), '0902222223', 14500000, 'MST00005', 'HR');
INSERT INTO NHAN_VIEN VALUES ('NV_HR04', 'Tran Thi Phuc Loi', TO_DATE('1997-05-12', 'YYYY-MM-DD'), '0902222224', 16000000, 'MST00006', 'HR');
INSERT INTO NHAN_VIEN VALUES ('NV_HR05', 'Hoang Van Tien Luong', TO_DATE('1994-09-09', 'YYYY-MM-DD'), '0902222225', 18000000, 'MST00007', 'HR');

-- Khối ACC (Kế toán)
INSERT INTO NHAN_VIEN VALUES ('NV_ACC01', 'Hoang Truong Ke Toan', TO_DATE('1988-12-05', 'YYYY-MM-DD'), '0905555551', 40000000, 'MST00008', 'ACC');
INSERT INTO NHAN_VIEN VALUES ('NV_ACC02', 'Dinh Thi Tinh Luong', TO_DATE('1998-03-18', 'YYYY-MM-DD'), '0905555552', 16000000, 'MST00009', 'ACC');
INSERT INTO NHAN_VIEN VALUES ('NV_ACC03', 'Ngo Van Thue', TO_DATE('1995-07-22', 'YYYY-MM-DD'), '0905555553', 17000000, 'MST00010', 'ACC');
INSERT INTO NHAN_VIEN VALUES ('NV_ACC04', 'Bui Thi Cong No', TO_DATE('1999-01-15', 'YYYY-MM-DD'), '0905555554', 15500000, 'MST00011', 'ACC');

-- Khối IT
INSERT INTO NHAN_VIEN VALUES ('NV_IT01', 'Vo Truong IT', TO_DATE('1990-07-22', 'YYYY-MM-DD'), '0907777771', 50000000, 'MST00012', 'IT');
INSERT INTO NHAN_VIEN VALUES ('NV_IT02', 'Ngo Van Code', TO_DATE('1999-09-09', 'YYYY-MM-DD'), '0907777772', 25000000, 'MST00013', 'IT');
INSERT INTO NHAN_VIEN VALUES ('NV_IT03', 'Bui Thi Test', TO_DATE('2000-01-01', 'YYYY-MM-DD'), '0907777773', 20000000, 'MST00014', 'IT');
INSERT INTO NHAN_VIEN VALUES ('NV_IT04', 'Dang Van DevOps', TO_DATE('1996-03-15', 'YYYY-MM-DD'), '0907777774', 35000000, 'MST00015', 'IT');
INSERT INTO NHAN_VIEN VALUES ('NV_IT05', 'Phan Thi Data', TO_DATE('1998-11-11', 'YYYY-MM-DD'), '0907777775', 28000000, 'MST00016', 'IT');
INSERT INTO NHAN_VIEN VALUES ('NV_IT06', 'Lam Van Cloud', TO_DATE('1997-06-06', 'YYYY-MM-DD'), '0907777776', 32000000, 'MST00017', 'IT');
INSERT INTO NHAN_VIEN VALUES ('NV_IT07', 'Vu Thi Design', TO_DATE('2001-08-08', 'YYYY-MM-DD'), '0907777777', 18000000, 'MST00018', 'IT');
INSERT INTO NHAN_VIEN VALUES ('NV_IT08', 'Truong Van System', TO_DATE('1995-12-12', 'YYYY-MM-DD'), '0907777778', 29000000, 'MST00019', 'IT');

-- Khối MKT
INSERT INTO NHAN_VIEN VALUES ('NV_MKT01', 'Do Truong MKT', TO_DATE('1992-02-28', 'YYYY-MM-DD'), '0908888881', 38000000, 'MST00020', 'MKT');
INSERT INTO NHAN_VIEN VALUES ('NV_MKT02', 'Ma Thi Content', TO_DATE('1999-04-04', 'YYYY-MM-DD'), '0908888882', 15000000, 'MST00021', 'MKT');
INSERT INTO NHAN_VIEN VALUES ('NV_MKT03', 'Phung Van Ads', TO_DATE('1998-05-05', 'YYYY-MM-DD'), '0908888883', 18000000, 'MST00022', 'MKT');
INSERT INTO NHAN_VIEN VALUES ('NV_MKT04', 'Kieu Thi Event', TO_DATE('1997-10-10', 'YYYY-MM-DD'), '0908888884', 16000000, 'MST00023', 'MKT');

-- ------------------------------------------------------------------------------
-- 4. BẢNG USERS
-- ------------------------------------------------------------------------------
INSERT INTO APP_USERS VALUES ('USR_001', 'bod.tran', 'hashed_pw', 'MANAGER', 'NV_BOD01');
INSERT INTO APP_USERS VALUES ('USR_002', 'bod.le', 'hashed_pw', 'MANAGER', 'NV_BOD02');
INSERT INTO APP_USERS VALUES ('USR_003', 'hr.nguyen', 'hashed_pw', 'HR_MANAGER', 'NV_HR01');
INSERT INTO APP_USERS VALUES ('USR_004', 'hr.le', 'hashed_pw', 'HR_STAFF', 'NV_HR02');
INSERT INTO APP_USERS VALUES ('USR_005', 'hr.pham', 'hashed_pw', 'HR_STAFF', 'NV_HR03');
INSERT INTO APP_USERS VALUES ('USR_006', 'hr.tran', 'hashed_pw', 'HR_STAFF', 'NV_HR04');
INSERT INTO APP_USERS VALUES ('USR_007', 'hr.hoang', 'hashed_pw', 'HR_STAFF', 'NV_HR05');
INSERT INTO APP_USERS VALUES ('USR_008', 'acc.hoang', 'hashed_pw', 'MANAGER', 'NV_ACC01');
INSERT INTO APP_USERS VALUES ('USR_009', 'acc.dinh', 'hashed_pw', 'ACCOUNTANT', 'NV_ACC02');
INSERT INTO APP_USERS VALUES ('USR_010', 'acc.ngo', 'hashed_pw', 'ACCOUNTANT', 'NV_ACC03');
INSERT INTO APP_USERS VALUES ('USR_011', 'acc.bui', 'hashed_pw', 'ACCOUNTANT', 'NV_ACC04');
INSERT INTO APP_USERS VALUES ('USR_012', 'it.vo', 'hashed_pw', 'MANAGER', 'NV_IT01');
INSERT INTO APP_USERS VALUES ('USR_013', 'it.ngo', 'hashed_pw', 'STAFF', 'NV_IT02');
INSERT INTO APP_USERS VALUES ('USR_014', 'it.bui', 'hashed_pw', 'STAFF', 'NV_IT03');
INSERT INTO APP_USERS VALUES ('USR_015', 'it.dang', 'hashed_pw', 'STAFF', 'NV_IT04');
INSERT INTO APP_USERS VALUES ('USR_016', 'it.phan', 'hashed_pw', 'STAFF', 'NV_IT05');
INSERT INTO APP_USERS VALUES ('USR_017', 'it.lam', 'hashed_pw', 'STAFF', 'NV_IT06');
INSERT INTO APP_USERS VALUES ('USR_018', 'it.vu', 'hashed_pw', 'STAFF', 'NV_IT07');
INSERT INTO APP_USERS VALUES ('USR_019', 'it.truong', 'hashed_pw', 'STAFF', 'NV_IT08');
INSERT INTO APP_USERS VALUES ('USR_020', 'mkt.do', 'hashed_pw', 'MANAGER', 'NV_MKT01');
INSERT INTO APP_USERS VALUES ('USR_021', 'mkt.ma', 'hashed_pw', 'STAFF', 'NV_MKT02');
INSERT INTO APP_USERS VALUES ('USR_022', 'mkt.phung', 'hashed_pw', 'STAFF', 'NV_MKT03');
INSERT INTO APP_USERS VALUES ('USR_023', 'mkt.kieu', 'hashed_pw', 'STAFF', 'NV_MKT04');

-- ------------------------------------------------------------------------------
-- 5. BẢNG DỰ ÁN
-- ------------------------------------------------------------------------------
INSERT INTO DU_AN (MaDA, TenDA, NganSach, NgayBatDau, TrangThai) VALUES ('DA_PUB_01', 'Bao tri he thong mang noi bo', 50000000, TO_DATE('2026-01-01', 'YYYY-MM-DD'), 'In Progress');
INSERT INTO DU_AN (MaDA, TenDA, NganSach, NgayBatDau, TrangThai) VALUES ('DA_PUB_02', 'Nang cap may tinh nhan vien', 150000000, TO_DATE('2026-03-10', 'YYYY-MM-DD'), 'Completed');
INSERT INTO DU_AN (MaDA, TenDA, NganSach, NgayBatDau, TrangThai) VALUES ('DA_CON_01', 'Chuyen doi so Nhan su EMS', 300000000, TO_DATE('2026-02-15', 'YYYY-MM-DD'), 'Planning');
INSERT INTO DU_AN (MaDA, TenDA, NganSach, NgayBatDau, TrangThai) VALUES ('DA_CON_02', 'Chien dich Marketing cuoi nam', 800000000, TO_DATE('2026-08-01', 'YYYY-MM-DD'), 'Planning');
INSERT INTO DU_AN (MaDA, TenDA, NganSach, NgayBatDau, TrangThai) VALUES ('DA_SEC_01', 'Thu mua co phan cong ty X', 5000000000, TO_DATE('2026-05-10', 'YYYY-MM-DD'), 'Secret');
INSERT INTO DU_AN (MaDA, TenDA, NganSach, NgayBatDau, TrangThai) VALUES ('DA_SEC_02', 'Phat trien san pham AI doc quyen', 8000000000, TO_DATE('2026-07-01', 'YYYY-MM-DD'), 'Secret');

-- ------------------------------------------------------------------------------
-- 6. BẢNG PHÂN CÔNG
-- ------------------------------------------------------------------------------
INSERT INTO PHAN_CONG VALUES ('NV_IT01', 'DA_PUB_01', 'Team Lead', 120);
INSERT INTO PHAN_CONG VALUES ('NV_IT02', 'DA_PUB_01', 'Developer', 200);
INSERT INTO PHAN_CONG VALUES ('NV_IT08', 'DA_PUB_02', 'System Admin', 80);
INSERT INTO PHAN_CONG VALUES ('NV_HR01', 'DA_CON_01', 'Project Manager', 80);
INSERT INTO PHAN_CONG VALUES ('NV_IT01', 'DA_CON_01', 'Tech Lead', 100);
INSERT INTO PHAN_CONG VALUES ('NV_IT04', 'DA_CON_01', 'DevOps Engineer', 50);
INSERT INTO PHAN_CONG VALUES ('NV_MKT01', 'DA_CON_02', 'Marketing Director', 40);
INSERT INTO PHAN_CONG VALUES ('NV_MKT03', 'DA_CON_02', 'Ads Specialist', 150);
INSERT INTO PHAN_CONG VALUES ('NV_MKT04', 'DA_CON_02', 'Event Coordinator', 180);
INSERT INTO PHAN_CONG VALUES ('NV_BOD01', 'DA_SEC_01', 'Sponsor', 50);
INSERT INTO PHAN_CONG VALUES ('NV_ACC01', 'DA_SEC_01', 'Financial Advisor', 100);
INSERT INTO PHAN_CONG VALUES ('NV_BOD02', 'DA_SEC_02', 'Sponsor', 60);
INSERT INTO PHAN_CONG VALUES ('NV_IT05', 'DA_SEC_02', 'Data Scientist', 300);
INSERT INTO PHAN_CONG VALUES ('NV_IT06', 'DA_SEC_02', 'Cloud Architect', 200);

-- ------------------------------------------------------------------------------
-- 7. BẢNG CHẤM CÔNG
-- ------------------------------------------------------------------------------
INSERT INTO CHAM_CONG VALUES ('CC001', 'NV_IT02', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC002', 'NV_IT02', TO_DATE('2026-06-21', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC003', 'NV_HR02', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Tre');
INSERT INTO CHAM_CONG VALUES ('CC004', 'NV_ACC02', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC005', 'NV_IT01', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC006', 'NV_IT01', TO_DATE('2026-06-21', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC007', 'NV_MKT01', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Vang co phep');
INSERT INTO CHAM_CONG VALUES ('CC008', 'NV_MKT02', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC009', 'NV_HR01', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC010', 'NV_ACC01', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC011', 'NV_BOD01', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC012', 'NV_IT03', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC013', 'NV_IT04', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Tre');
INSERT INTO CHAM_CONG VALUES ('CC014', 'NV_IT05', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC015', 'NV_IT06', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC016', 'NV_IT07', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Vang khong phep');
INSERT INTO CHAM_CONG VALUES ('CC017', 'NV_IT08', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC018', 'NV_HR03', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC019', 'NV_HR04', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');
INSERT INTO CHAM_CONG VALUES ('CC020', 'NV_HR05', TO_DATE('2026-06-20', 'YYYY-MM-DD'), 'Co mat');

-- ------------------------------------------------------------------------------
-- 8. BẢNG LỊCH SỬ LƯƠNG
-- ------------------------------------------------------------------------------
INSERT INTO LICH_SU_LUONG (MaNV, LuongCu, LuongMoi, NgayDoi, NguoiThucHien) VALUES ('NV_IT02', 20000000, 25000000, SYSTIMESTAMP - 30, 'USR_003');
INSERT INTO LICH_SU_LUONG (MaNV, LuongCu, LuongMoi, NgayDoi, NguoiThucHien) VALUES ('NV_HR02', 12000000, 15000000, SYSTIMESTAMP - 60, 'USR_003');
INSERT INTO LICH_SU_LUONG (MaNV, LuongCu, LuongMoi, NgayDoi, NguoiThucHien) VALUES ('NV_MKT02', 13000000, 15000000, SYSTIMESTAMP - 15, 'USR_003');
INSERT INTO LICH_SU_LUONG (MaNV, LuongCu, LuongMoi, NgayDoi, NguoiThucHien) VALUES ('NV_ACC02', 14000000, 16000000, SYSTIMESTAMP - 45, 'USR_003');

-- ==============================================================================
-- CHỐT HẠ DỮ LIỆU XUỐNG Ổ CỨNG (BẮT BUỘC)
-- ==============================================================================
COMMIT;