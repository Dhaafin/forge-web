import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/api/v1/ai/chat/sessions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      return NextResponse.json(
        { detail: errJson.detail || "Failed to delete chat session" },
        { status: response.status }
      );
    }

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Delete session proxy error:", err);
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}
