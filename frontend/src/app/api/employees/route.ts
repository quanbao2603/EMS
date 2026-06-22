import { NextResponse } from 'next/server';

export async function GET() {
  // Trả về mảng rỗng để giao diện hiển thị "Không có dữ liệu"
  return NextResponse.json([]);
}
