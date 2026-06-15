import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    const loginEndpoint = `${backendUrl}/api/v1/auth/login`;

    // Construct urlencoded request params (OAuth2 password request form layout)
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);
    params.append("grant_type", "password");

    // Call external backend API via Axios
    const response = await axios.post(loginEndpoint, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = response.data; // expects { access_token, token_type }

    const nextResponse = NextResponse.json(data, { status: 200 });

    // Set secure HTTP-only cookie for auth session management
    nextResponse.cookies.set({
      name: "access_token",
      value: data.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return nextResponse;
  } catch (err: any) {
    console.error("Login Proxy Error:", err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || "Authentication failed";
    return NextResponse.json({ error: message }, { status });
  }
}
