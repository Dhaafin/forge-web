import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const timeWindow = searchParams.get("time_window");
    const sortBy = searchParams.get("sort_by") || "start_time";
    const order = searchParams.get("order") || "desc";
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";

    const accessToken = req.cookies.get("access_token")?.value;
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    const historyEndpoint = `${backendUrl}/api/v1/workouts/session/history`;

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await axios.get(historyEndpoint, {
      headers,
      params: {
        search: search || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        time_window: timeWindow || undefined,
        sort_by: sortBy,
        order,
        limit,
        offset,
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (err: any) {
    console.error("Workout History Proxy Error:", err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || "Failed to fetch workout history";
    return NextResponse.json({ error: message }, { status });
  }
}
