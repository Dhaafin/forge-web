import axios from "axios";

export interface Exercise {
  id: string;
  name: string;
  target_muscle: string;
}

export interface GetExercisesParams {
  search?: string;
  sort_by?: "name" | "target_muscle";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export async function fetchExercises(params: GetExercisesParams = {}): Promise<Exercise[]> {
  const response = await axios.get<Exercise[]>("/api/workouts/exercises", {
    params,
  });
  return response.data;
}
