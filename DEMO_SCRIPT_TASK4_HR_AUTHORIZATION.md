PHẦN 1: KỊCH BẢN TEST TẦNG CSDL (ORACLE SQL)

Test Case 4.1: Kiểm tra Nhân viên HR (HR_STAFF) xem được dữ liệu TOÀN CÔNG TY
Mục tiêu: Xác minh VPD Policy SELECT mở quyền xem cho HR_STAFF vượt ra ngoài phòng ban của họ (khác với STAFF/MANAGER chỉ xem cùng phòng).
Tài khoản thực hiện: EMS_ADMIN
Các bước thực hiện:
EXEC EMS_ADMIN.pkg_sec_admin.set_context('USR_004', 'HR_STAFF', 'HR');
SELECT MaPB, COUNT(*) FROM EMS_ADMIN.NHAN_VIEN GROUP BY MaPB ORDER BY MaPB;
Kết quả kỳ vọng: Trả về đầy đủ TẤT CẢ phòng ban (ACC, BOD, HR, IT, MKT), không chỉ riêng phòng HR.
================================================

Test Case 4.2: Kiểm tra HR_STAFF SỬA được nhân viên NGOÀI phòng HR
Mục tiêu: Xác minh VPD Policy DML (INSERT/UPDATE/DELETE) cho phép HR_STAFF chỉnh sửa nhân sự toàn công ty.
Tài khoản thực hiện: EMS_ADMIN
Các bước thực hiện:
EXEC EMS_ADMIN.pkg_sec_admin.set_context('USR_004', 'HR_STAFF', 'HR');
UPDATE EMS_ADMIN.NHAN_VIEN SET SDT = '0900000001' WHERE MaNV = 'NV_IT02';
Kết quả kỳ vọng: 1 row updated (thành công, vì NV_IT02 thuộc phòng IT, không phải HR).
================================================

Test Case 4.3: Kiểm tra "Chính sách phủ định" - HR_STAFF KHÔNG sửa được người trong phòng HR
Mục tiêu: Xác minh khi đối tượng bị sửa thuộc phòng HR (phòng của chính HR_STAFF), quyền của họ tự động "quay về" như Nhân viên thường (không Insert/Update/Delete được, kể cả với đồng nghiệp cùng phòng).
Tài khoản thực hiện: EMS_ADMIN
Các bước thực hiện:
EXEC EMS_ADMIN.pkg_sec_admin.set_context('USR_004', 'HR_STAFF', 'HR');
UPDATE EMS_ADMIN.NHAN_VIEN SET SDT = '0900000002' WHERE MaNV = 'NV_HR02';
Kết quả kỳ vọng: 0 rows updated. (VPD lặng lẽ loại dòng này khỏi phạm vi UPDATE - không báo lỗi, không có dòng nào bị đổi, đúng cơ chế Oracle VPD).
================================================

Test Case 4.4: Kiểm tra HR_STAFF KHÔNG được sửa cột Lương (dù là người ngoài phòng HR)
Mục tiêu: Xác minh giới hạn mức CỘT (column-level) độc lập với giới hạn mức DÒNG (row-level) ở Test Case 4.2 - HR_STAFF được sửa thông tin cá nhân của người khác phòng, nhưng KHÔNG được đụng vào cột Lương của bất kỳ ai.
Tài khoản thực hiện: EMS_ADMIN
Các bước thực hiện:
EXEC EMS_ADMIN.pkg_sec_admin.set_context('USR_004', 'HR_STAFF', 'HR');
UPDATE EMS_ADMIN.NHAN_VIEN SET Luong = 99999999 WHERE MaNV = 'NV_IT02';
Kết quả kỳ vọng: Lỗi ORA-20403: Loi bao mat (HTTP 403): Chi HR_MANAGER duoc phep sua muc Luong.
================================================

Test Case 4.5: Kiểm tra Trưởng phòng HR (HR_MANAGER) có quyền tối cao - KHÔNG ngoại lệ
Mục tiêu: Xác minh HR_MANAGER sửa được Lương của BẤT KỲ ai, kể cả người trong phòng HR (khác với HR_STAFF ở Test Case 4.3 và 4.4).
Tài khoản thực hiện: EMS_ADMIN
Các bước thực hiện:
EXEC EMS_ADMIN.pkg_sec_admin.set_context('USR_003', 'HR_MANAGER', 'HR');
UPDATE EMS_ADMIN.NHAN_VIEN SET Luong = Luong + 100000 WHERE MaNV = 'NV_HR02';
COMMIT;
SELECT MaNV, LuongCu, LuongMoi, NguoiThucHien FROM EMS_ADMIN.LICH_SU_LUONG WHERE MaNV = 'NV_HR02' ORDER BY NgayDoi DESC FETCH FIRST 1 ROWS ONLY;
Kết quả kỳ vọng: UPDATE thành công (1 row updated), đồng thời Trigger tự động chèn 1 dòng vào LICH_SU_LUONG ghi nhận NguoiThucHien = 'USR_003'.
================================================

Test Case 4.6: Kiểm tra Nhân viên thường (STAFF) - không thể Insert/Update/Delete kể cả dữ liệu của chính mình
Mục tiêu: Đảm bảo VPD Policy DML chặn hoàn toàn vai trò STAFF (và MANAGER, ACCOUNTANT) - không có ngoại lệ "tự sửa thông tin của mình", khác hẳn với cơ chế "phủ định" riêng cho HR_STAFF.
Tài khoản thực hiện: EMS_ADMIN
Các bước thực hiện:
EXEC EMS_ADMIN.pkg_sec_admin.set_context('USR_013', 'STAFF', 'IT');
UPDATE EMS_ADMIN.NHAN_VIEN SET SDT = '0911111111' WHERE MaNV = 'NV_IT02'; -- NV_IT02 chính là tài khoản it.ngo (USR_013)
Kết quả kỳ vọng: 0 rows updated (VPD Policy DML trả '1=2' cho role STAFF, chặn tuyệt đối, không phân biệt là dữ liệu của ai).


PHẦN 2: KỊCH BẢN TEST TẦNG BACKEND (NESTJS - POSTMAN)

Bước 1: Đăng nhập 3 vai trò cần test
URL: http://localhost:3001/auth/login (Method: POST)
Body mẫu:
{ "username": "hr.le", "password": "hashed_pw" }       -> HR_STAFF
{ "username": "hr.nguyen", "password": "hashed_pw" }    -> HR_MANAGER
{ "username": "it.ngo", "password": "hashed_pw" }       -> STAFF
Kết quả kỳ vọng: mỗi lần trả về access_token tương ứng đúng role. Lưu lại 3 token để dùng cho các bước sau.
================================================

Bước 2: HR_STAFF sửa nhân viên NGOÀI phòng HR (chỉ đổi thông tin cá nhân, KHÔNG đổi lương)
URL: http://localhost:3001/employees/NV_IT02
Method: PUT
Headers: Authorization: Bearer <Token HR_STAFF>
Body (JSON) - lưu ý phải gửi đúng giá trị Lương HIỆN TẠI (không đổi) để mô phỏng đúng luồng thật của Form (Form luôn gửi nguyên object, kể cả ô Lương bị khoá):
{
    "hoTen": "Ngo Van Code",
    "sdt": "0907777772",
    "maPB": "IT",
    "luong": 26000000
}
Kết quả kỳ vọng (HTTP Status 200): {"message": "Cập nhật thành công"}
Ý nghĩa: Chứng minh hệ thống phân biệt được "có gửi field luong" và "có THỰC SỰ đổi giá trị Lương" - không chặn nhầm các thao tác sửa thông tin cá nhân thông thường.
================================================

Bước 3: HR_STAFF cố tình đổi Lương thật (đổi giá trị)
URL: http://localhost:3001/employees/NV_IT02
Method: PUT
Headers: Authorization: Bearer <Token HR_STAFF>
Body (JSON):
{
    "hoTen": "Ngo Van Code",
    "sdt": "0907777772",
    "maPB": "IT",
    "luong": 1
}
Kết quả kỳ vọng (HTTP Status 403):
{
    "statusCode": 403,
    "message": "Chỉ HR_MANAGER được phép sửa mức lương."
}
Ý nghĩa: Backend bắt được lỗi ORA-20403 từ Trigger và dịch thành thông báo 403 thân thiện cho người dùng cuối (đúng đặc tả: "nếu Backend trả về lỗi HTTP 403 (Oracle Trigger chặn)").
================================================

Bước 4: HR_STAFF cố sửa nhân viên TRONG phòng HR (vùng bị "phủ định")
URL: http://localhost:3001/employees/NV_HR02
Method: PUT
Headers: Authorization: Bearer <Token HR_STAFF>
Body (JSON):
{
    "hoTen": "Le Thi Tuyen Dung",
    "sdt": "0902222222",
    "maPB": "HR",
    "luong": 15500000
}
Kết quả kỳ vọng (HTTP Status 403):
{
    "statusCode": 403,
    "message": "Bạn không có quyền chỉnh sửa nhân viên này (ngoài phạm vi VPD cho phép)."
}
Ý nghĩa: Backend phát hiện rowsAffected = 0 (do VPD Policy DML lọc mất dòng này) và chủ động trả lỗi rõ ràng cho người dùng, thay vì báo "thành công" giả.
================================================

Bước 5: HR_MANAGER sửa Lương nhân viên phòng HR (quyền tối cao, không ngoại lệ)
URL: http://localhost:3001/employees/NV_HR02
Method: PUT
Headers: Authorization: Bearer <Token HR_MANAGER>
Body (JSON):
{
    "hoTen": "Le Thi Tuyen Dung",
    "sdt": "0902222222",
    "maPB": "HR",
    "luong": 15700000
}
Kết quả kỳ vọng (HTTP Status 200): {"message": "Cập nhật thành công"}
Ý nghĩa: Chứng minh HR_MANAGER không bị giới hạn nào (khác hẳn HR_STAFF ở Bước 3 và 4) - kể cả sửa Lương, kể cả người trong phòng HR.
================================================

Bước 6: STAFF cố gọi API sửa nhân viên (kiểm tra RolesGuard tầng Backend)
URL: http://localhost:3001/employees/NV_IT02
Method: PUT
Headers: Authorization: Bearer <Token STAFF>
Body (JSON): { "hoTen": "x", "sdt": "x", "maPB": "IT" }
Kết quả kỳ vọng (HTTP Status 403):
{
    "statusCode": 403,
    "message": "Bạn không có quyền truy cập tài nguyên này."
}
Ý nghĩa: RolesGuard ở Backend (@Roles('HR_STAFF','HR_MANAGER')) chặn ngay từ tầng Controller, không cần đụng tới Database - một lớp phòng thủ bổ sung trước khi VPD/Trigger phải xử lý.


PHẦN 3: KỊCH BẢN TEST TRÊN GIAO DIỆN WEB

Bước 1: Đăng nhập http://localhost:3000 bằng hr.le / hashed_pw (HR_STAFF).
Bước 2: Vào "Nhân sự" -> bấm Sửa một nhân viên KHÔNG thuộc phòng HR (ví dụ NV_IT02) -> đổi Số Điện Thoại -> Lưu.
Kết quả kỳ vọng: Toast báo thành công, danh sách cập nhật SĐT mới. Ô "Mức Lương" trên Form vẫn hiển thị giá trị cũ (không đổi) nên không bị Trigger chặn.
Bước 3: Trên cùng Form, gõ số khác vào ô "Mức Lương" rồi Lưu.
Kết quả kỳ vọng: Toast đỏ "Lỗi bảo mật" hiển thị đúng thông báo "Chỉ HR_MANAGER được phép sửa mức lương." (xem chú thích "(Test Database Block)" cạnh ô Lương trong Form - đây là khu vực cố ý để demo tính năng này).
Bước 4: Vào "Nhân sự", thử bấm Sửa một nhân viên thuộc phòng HR (ví dụ NV_HR02) -> đổi SĐT -> Lưu.
Kết quả kỳ vọng: Toast đỏ báo không có quyền (chính sách phủ định - HR_STAFF không sửa được người cùng phòng HR).
Bước 5: Đăng xuất -> đăng nhập hr.nguyen / hashed_pw (HR_MANAGER) -> lặp lại Bước 4 với cùng nhân viên NV_HR02, đổi cả Lương.
Kết quả kỳ vọng: Thành công - chứng minh HR_MANAGER không bị giới hạn như HR_STAFF.
