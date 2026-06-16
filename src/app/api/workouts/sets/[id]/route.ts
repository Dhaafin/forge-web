import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: setId } = await params;
    const { searchParams } = new URL(req.url);
    const weightKg = searchParams.get("weight_kg");
    const reps = searchParams.get("reps");
    const setType = searchParams.get("set_type");

    const accessToken = req.cookies.get("access_token")?.value;
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    const endpoint = `${backendUrl}/api/v1/workouts/set/${setId}`;

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await axios.put(endpoint, null, {
      headers,
      params: {
        weight_kg: weightKg ? Number(weightKg) : undefined,
        reps: reps ? Number(reps) : undefined,
        set_type: setType || undefined,
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (err: any) {
    console.error("PUT Workout Set Proxy Error:", err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || "Failed to update set detail";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: setId } = await params;
    const accessToken = req.cookies.get("access_token")?.value;
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    const endpoint = `${backendUrl}/api/v1/workouts/set/${setId}`;

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    await axios.delete(endpoint, { headers });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error("DELETE Workout Set Proxy Error:", err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || "Failed to delete workout set";
    return NextResponse.json({ error: message }, { status });
  }
}
