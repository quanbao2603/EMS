import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = body;

    let role = 'STAFF';
    let maPB = 'IT';
    
    if (username === 'hr_manager') {
      role = 'HR_MANAGER'; maPB = 'HR';
    } else if (username === 'hr_staff') {
      role = 'HR_STAFF'; maPB = 'HR';
    } else if (username === 'accountant') {
      role = 'ACCOUNTANT'; maPB = 'ACC';
    } else if (username === 'manager') {
      role = 'MANAGER'; maPB = 'BOD';
    } else {
      role = 'STAFF'; maPB = 'IT';
    }

    const payload = {
      userId: `USR_${Math.floor(Math.random() * 1000)}`,
      username: username || 'test_user',
      role: role,
      maPB: maPB,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
    };

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const body64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const token = `${header}.${body64}.fakesignature`;

    return NextResponse.json({ access_token: token });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
