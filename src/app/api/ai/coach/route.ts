import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const accessToken = req.cookies.get("access_token")?.value;
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    const aiCoachEndpoint = `${backendUrl}/api/v1/ai/coach`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await axios.post(
      aiCoachEndpoint,
      { session_id },
      { headers }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (err: any) {
    console.error("AI Coach Proxy Error:", err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || "Failed to generate AI Coach feedback";
    return NextResponse.json({ error: message }, { status });
  }
}
