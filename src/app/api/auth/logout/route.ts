import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });

  // Clear cookie
  response.cookies.set({
    name: "access_token",
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
