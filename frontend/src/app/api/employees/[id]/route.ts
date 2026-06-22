import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  
  if (body.luong) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  
  return NextResponse.json({ message: 'Cập nhật thành công' });
}
