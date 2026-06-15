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

export async function createExercise(name: string, targetMuscle: string): Promise<Exercise> {
  const response = await axios.post<Exercise>("/api/workouts/exercises", {
    name,
    target_muscle: targetMuscle,
  });
  return response.data;
}

export async function updateExercise(id: string, name: string, targetMuscle: string): Promise<Exercise> {
  const response = await axios.put<Exercise>(`/api/workouts/exercises/${id}`, {
    name,
    target_muscle: targetMuscle,
  });
  return response.data;
}


