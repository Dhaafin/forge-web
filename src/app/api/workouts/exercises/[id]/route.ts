import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const exerciseId = resolvedParams.id;

    const { name, target_muscle } = await req.json();

    if (!name || !target_muscle) {
      return NextResponse.json(
        { error: "Name and target muscle are required" },
        { status: 400 }
      );
    }

    const accessToken = req.cookies.get("access_token")?.value;
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    const exercisesEndpoint = `${backendUrl}/api/v1/workouts/exercises/${exerciseId}`;

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Backend endpoint expects: PUT /api/v1/workouts/exercises/{exercise_id}
    // with name and target_muscle as query parameters.
    const response = await axios.put(
      exercisesEndpoint,
      null, // body is empty
      {
        headers,
        params: {
          name,
          target_muscle,
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (err: any) {
    console.error("Update Exercise Proxy Error:", err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || "Failed to update exercise";
    return NextResponse.json({ error: message }, { status });
  }
}
