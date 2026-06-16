import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  // We can return simple info or user profile data if available
  return NextResponse.json({ authenticated: true }, { status: 200 });
}
