import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const response = await axios.get(`${backendUrl}/api/v1/ai/chat/sessions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (err: any) {
    console.error("Fetch sessions proxy error:", err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || "Failed to fetch chat sessions";
    return NextResponse.json({ detail: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const response = await axios.post(
      `${backendUrl}/api/v1/ai/chat/sessions`,
      "",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (err: any) {
    console.error("Create session proxy error:", err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || "Failed to create chat session";
    return NextResponse.json({ detail: message }, { status });
  }
}

