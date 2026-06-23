import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const accessToken = req.cookies.get("access_token")?.value;
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    const endpoint = `${backendUrl}/api/v1/workouts/session/parse-notes`;

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await axios.post(endpoint, payload, { headers });

    return NextResponse.json(response.data);
  } catch (err: any) {
    console.error("Parse Notes Proxy Error:", err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || "Failed to parse workout notes";
    return NextResponse.json({ error: message }, { status });
  }
}
