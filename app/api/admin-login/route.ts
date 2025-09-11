import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const ADMIN_PASSWORD = process.env.ADMIN_DASHBOARD_PASSWORD; // Server-only
  console.log(ADMIN_PASSWORD);

  if (password === ADMIN_PASSWORD) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
