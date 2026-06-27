import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/api/v1/ai/chat/sessions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      return NextResponse.json(
        { detail: errJson.detail || "Failed to fetch chat sessions" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Fetch sessions proxy error:", err);
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/api/v1/ai/chat/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      return NextResponse.json(
        { detail: errJson.detail || "Failed to create chat session" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Create session proxy error:", err);
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}
