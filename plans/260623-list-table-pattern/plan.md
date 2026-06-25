# List/Table Management Pattern — Complete

## Screens (all updated)
1. ✅ Employees (`EmployeeTable`)
2. ✅ Attendance (`AttendanceTable`)
3. ✅ Payroll (`PayrollTable`)
4. ✅ Change history (`ChangeHistoryTable` + `employees/history`)
5. ✅ HR monitoring FGA (`HrAuditLogTable` + `audit/page`)
6. ✅ System audit (`SystemAuditLogTable`)
7. ✅ Projects (`projects/page` - card grid + toolbar + pagination)
## Reusable pieces
- `lib/list-utils.ts` - search, paginate, sort helpers
- `hooks/useClientListTable.ts` - client-side filter/sort/pagination
- `components/data-table/search-filter-toolbar.tsx`
- `components/data-table/pagination-controls.tsx`
- `components/data-table/data-table-card.tsx`
- `components/data-table/filter-select.tsx`

## Per-screen search fields
- Employees: maNV, hoTen, sdt, maPB
- Attendance: maChamCong, maNV, ngayLamViec, trangThai
- Payroll: maNV, maSoThue, luong
- History: maNV, performedBy, changeSummary, eventType
- Audit FGA: maNV, performedBy, changeSummary
- System audit: nguoi_thuc_hien, bang_tac_dong, loai_hanh_dong, trang_thai, sql
- Projects: maDA, tenDA, trangThai
