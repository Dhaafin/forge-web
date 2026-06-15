import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sort_by") || "name";
    const order = searchParams.get("order") || "asc";
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";

    const accessToken = req.cookies.get("access_token")?.value;

    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    const exercisesEndpoint = `${backendUrl}/api/v1/workouts/exercises`;

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await axios.get(exercisesEndpoint, {
      headers,
      params: {
        search: search || undefined,
        sort_by: sortBy,
        order,
        limit,
        offset,
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (err: any) {
    console.error("Exercises Proxy Error:", err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || "Failed to fetch exercises";
    return NextResponse.json({ error: message }, { status });
  }
}
