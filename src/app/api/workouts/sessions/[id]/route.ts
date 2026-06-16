import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = resolvedParams.id;

    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const durationMinutes = searchParams.get("duration_minutes");

    const accessToken = req.cookies.get("access_token")?.value;
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    const updateEndpoint = `${backendUrl}/api/v1/workouts/session/${sessionId}`;

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await axios.put(
      updateEndpoint,
      null, // body is empty
      {
        headers,
        params: {
          title: title || undefined,
          duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (err: any) {
    console.error("Update Workout Session Proxy Error:", err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || "Failed to update workout session";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = resolvedParams.id;

    const accessToken = req.cookies.get("access_token")?.value;
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    const deleteEndpoint = `${backendUrl}/api/v1/workouts/session/${sessionId}`;

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    await axios.delete(deleteEndpoint, { headers });

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error("Delete Workout Session Proxy Error:", err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || "Failed to delete workout session";
    return NextResponse.json({ error: message }, { status });
  }
}

