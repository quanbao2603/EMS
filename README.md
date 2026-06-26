# 🛡️ HỆ THỐNG QUẢN LÝ NHÂN SỰ AN TOÀN (EMS)
### Đồ án Chuyên sâu: Bảo mật Cơ sở dữ liệu Oracle từ trong Lõi (Database-Centric Security)

![Oracle Database](https://img.shields.io/badge/Oracle_Database-21c%2F23ai-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## I. GIỚI THIỆU DỰ ÁN

**EMS (Employee Management System)** là một ứng dụng quản lý nhân sự cấp doanh nghiệp được thiết kế theo kiến trúc 3 lớp hiện đại. Điểm khác biệt lớn nhất của EMS so với các hệ thống truyền thống là **không phụ thuộc hoàn toàn vào code kiểm tra của lập trình viên ở tầng Application**, mà đưa toàn bộ logic kiểm soát quyền hạn xuống tận lõi vật lý của **Oracle Database**.

Mọi hành vi xâm nhập, bypass mã nguồn Backend hay SQL Injection đều sẽ bị vấp phải bức tường lửa bảo mật đa tầng của Oracle ngay tại thời điểm thực thi lệnh cơ sở dữ liệu.

---

## II. 6 NỘI DUNG BẢO MẬT CƠ SỞ DỮ LIỆU ĐÃ TRIỂN KHAI

| Nội dung | Công nghệ Oracle | Cơ chế hoạt động & Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- |
| **1. Định danh Ngữ cảnh** | `VPD Context & pkg_sec_admin` | Khắc phục điểm yếu chung của Connection Pool. Truyền JWT Token xuống DB để gán định danh `USER_ID`, `ROLE`, `MAPB` vào phiên làm việc (`SYS_CONTEXT`). |
| **2. Bảo mật Mức Dòng** | `Virtual Private Database (VPD)` | Tự động chèn mệnh đề `WHERE` vào các lệnh `SELECT/UPDATE` trên bảng `NHAN_VIEN` & `CHAM_CONG`. Nhân viên phòng nào chỉ được xem dữ liệu phòng đó. |
| **3. Kiểm soát Cấp Quản lý** | `VPD Hàm Chính sách mở rộng` | Trưởng phòng (`MANAGER`) được mở rộng tầm nhìn toàn bộ phòng ban. Trưởng phòng Nhân sự (`HR_MANAGER`) được cấp đặc quyền nhìn toàn bộ công ty. |
| **4. Ràng buộc Chức năng** | `Database Trigger & Lịch sử` | Chặn đứng hành vi tự ý sửa Mức lương từ `HR_STAFF` (ném lỗi `ORA-20403`). Khi `HR_MANAGER` thao tác hợp lệ, Trigger tự động lưu vết bảng `LICH_SU_LUONG`. |
| **5. Che giấu Dữ liệu** | `Oracle Data Redaction` | Kế toán (`ACCOUNTANT`) được xem lương toàn công ty để tính toán, nhưng các thuộc tính định danh cá nhân (Họ tên, Ngày sinh, SĐT) tự động biến thành `***`. |
| **6. Kiểm toán & Giám sát** | `Fine-Grained Auditing & OLS` | Giám sát mọi DML từ phòng HR lên bảng `NHAN_VIEN` và `PHAN_CONG`. Phân chia nhãn dữ liệu `DU_AN` (`PUB`, `CONF`, `SEC`) và lưu vết các truy cập thất bại. |

---

## III. DANH SÁCH TÀI KHOẢN DEMO KIỂM CHỨNG

Tất cả các tài khoản dưới đây đều sử dụng chung mật khẩu: **`123456`**

```
┌──────────────────┬──────────────┬─────────────┬──────────────────────────────────────────────────────────────┐
│ Tên đăng nhập    │ Vai trò      │ Phòng ban   │ Đặc quyền & Hiện tượng quan sát trên Web                     │
├──────────────────┼──────────────┼─────────────┼──────────────────────────────────────────────────────────────┤
│ hr.le            │ HR_MANAGER   │ HR          │ Thấy toàn bộ NV, sửa được lương, xem dự án Tuyệt mật (SEC),  │
│                  │              │             │ xem Timeline biến động lương và Dashboard Giám sát FGA.      │
├──────────────────┼──────────────┼─────────────┼──────────────────────────────────────────────────────────────┤
│ hr_staff.nguyen  │ HR_STAFF     │ HR          │ Thấy nhân viên công ty (trừ phòng HR). Cố tình sửa Mức Lương │
│                  │              │             │ bấm Lưu sẽ bị văng Toast đỏ báo lỗi 403 từ DB Trigger.       │
├──────────────────┼──────────────┼─────────────┼──────────────────────────────────────────────────────────────┤
│ it.vo            │ MANAGER      │ IT          │ Chỉ nhìn thấy nhân viên phòng IT. Xem các dự án Nội bộ (CONF)│
│                  │              │             │ Các dự án Tuyệt mật (SEC) tự động bị ẩn khỏi danh sách.      │
├──────────────────┼──────────────┼─────────────┼──────────────────────────────────────────────────────────────┤
│ it_staff.tran    │ STAFF        │ IT          │ Chỉ nhìn thấy nhân viên phòng IT. Chỉ xem được dự án Public. │
├──────────────────┼──────────────┼─────────────┼──────────────────────────────────────────────────────────────┤
│ acc.pham         │ ACCOUNTANT   │ Kế toán     │ Nhìn thấy mức lương toàn bộ nhân viên công ty, nhưng Họ tên  │
│                  │              │             │ và SĐT tự động bị che mờ thành dấu *** (Data Redaction).     │
└──────────────────┴──────────────┴─────────────┴──────────────────────────────────────────────────────────────┘
```

---

## IV. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (GETTING STARTED)

### Phương án 1: Khởi chạy nhanh bằng Docker Compose (Khuyên dùng)
Hệ thống đã được đóng gói container hoàn chỉnh. Bạn không cần cài đặt Node.js hay cấu hình môi trường thủ công.

1. Yêu cầu đã cài đặt **Docker Desktop**.
2. Đảm bảo Oracle Database đang khởi chạy và mở cổng `1521`.
3. Mở Terminal tại thư mục gốc của dự án và chạy lệnh:

```bash
docker-compose up -d --build
```

4. Truy cập hệ thống:
   - **Giao diện Web (Frontend):** [http://localhost:3000](http://localhost:3000)
   - **Tài liệu API (Backend Swagger):** [http://localhost:3001/api](http://localhost:3001/api)

---

### Phương án 2: Cài đặt thủ công cho Nhà phát triển

#### Bước 1: Chuẩn bị Cơ sở dữ liệu Oracle
1. Mở **Oracle SQL Developer** kết nối vào PDB `FREEPDB1` bằng tài khoản `SYS AS SYSDBA` hoặc `SYSTEM`.
2. Thực thi lần lượt các script trong thư mục `database-scripts/`:
   - `00_create_new_user.sql` (Tạo tài khoản kết nối Backend `ems_app_user`)
   - `01_init_tables.sql` & `02_mock_data.sql` (Khởi tạo bảng và dữ liệu mẫu)
   - `03_noidung_1_2_logic.sql` -> `06_noidung_6_logic.sql` (Kích hoạt bảo mật VPD, Redaction, FGA, OLS)
   - `08_grant_and_synonyms.sql` (Cấp quyền chuẩn hóa đọc View giám sát cho Backend)

#### Bước 2: Khởi chạy Backend API (NestJS)
```bash
cd backend
npm install
npm run dev
```

#### Bước 3: Khởi chạy Frontend Web (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## V. KỊCH BẢN DEMO BẢO MẬT CHẤM ĐIỂM ĐỒ ÁN

*Hãy thực hiện theo kịch bản 4 bước sau để trình diễn toàn bộ sự "lợi hại" của kiến trúc bảo mật:*

1. **Bước 1 (Đăng nhập `it_staff.tran`):** Vào trang **Nhân viên**, chứng minh nhân viên IT không thể nhìn thấy nhân viên phòng HR hay Kinh doanh. Vào trang **Dự án**, chứng minh chỉ thấy dự án Công khai (`PUB`).
2. **Bước 2 (Đăng xuất -> Đăng nhập `acc.pham`):** Vào trang **Nhân viên**, chứng minh Kế toán có thể nhìn thấy cột Lương của tất cả mọi người, nhưng cột Họ tên bị che mờ `***`.
3. **Bước 3 (Đăng xuất -> Đăng nhập `hr_staff.nguyen`):** 
   - Bấm nút **[Sửa]** một nhân viên bất kỳ -> Cố tình gõ một con số mới vào ô **"Mức lương"** -> Bấm **[Lưu thay đổi]**.
   - **Chiêm ngưỡng kết quả:** Hệ thống lập tức từ chối và hiện Toast đỏ góc trên bên phải: *"Không có quyền cập nhật mức lương. Mã lỗi Oracle: ORA-20403"*.
4. **Bước 4 (Đăng xuất -> Đăng nhập `hr.le` - HR Manager):**
   - Bấm nút **[Sửa]** nhân viên đó -> Cập nhật mức lương mới -> Bấm **[Lưu]** -> Thành công mượt mà.
   - Bấm vào nút **[Lịch sử]** màu xanh ngay dòng nhân viên đó -> Mở ra Timeline xem lịch sử biến động lương chính xác đến từng giây.
   - Chuyển sang menu **[Báo cáo Giám sát HR]** -> Xem danh sách Fine-Grained Audit ghi lại vết ai đã vừa sửa bảng nhân viên.

---
### 🤝 Nhóm Phát triển Đồ án EMS Security
*Đồ án được phát triển nhằm mục đích nghiên cứu và kiểm chứng tính năng Bảo mật CSDL Oracle.*
