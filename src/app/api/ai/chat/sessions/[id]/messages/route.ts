import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/api/v1/ai/chat/sessions/${id}/messages`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      return NextResponse.json(
        { detail: errJson.detail || "Failed to fetch session messages" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Fetch session messages proxy error:", err);
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}
