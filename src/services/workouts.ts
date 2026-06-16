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

export async function deleteExercise(id: string): Promise<void> {
  await axios.delete(`/api/workouts/exercises/${id}`);
}

export interface WorkoutSet {
  id: string;
  exercise_id: string;
  weight_kg: number;
  reps: number;
  is_pr: boolean;
  set_type?: string;
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  sets: WorkoutSet[];
}

export interface GetWorkoutHistoryParams {
  search?: string;
  start_date?: string;
  end_date?: string;
  time_window?: string;
  sort_by?: "start_time" | "duration_minutes" | "title";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export async function fetchWorkoutHistory(params: GetWorkoutHistoryParams = {}): Promise<WorkoutSession[]> {
  const response = await axios.get<WorkoutSession[]>("/api/workouts/history", {
    params,
  });
  return response.data;
}

export interface RecordSessionSetParams {
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  set_type: "normal" | "warmup" | "drop" | "failure";
}

export interface RecordWorkoutSessionParams {
  title: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  sets: RecordSessionSetParams[];
}

export async function recordWorkoutSession(payload: RecordWorkoutSessionParams): Promise<WorkoutSession> {
  const response = await axios.post<WorkoutSession>("/api/workouts/sessions", payload);
  return response.data;
}

export async function updateWorkoutSession(
  sessionId: string,
  title: string,
  durationMinutes: number
): Promise<WorkoutSession> {
  const response = await axios.put<WorkoutSession>(`/api/workouts/sessions/${sessionId}`, null, {
    params: {
      title,
      duration_minutes: durationMinutes,
    },
  });
  return response.data;
}

export async function deleteWorkoutSession(sessionId: string): Promise<void> {
  await axios.delete(`/api/workouts/sessions/${sessionId}`);
}

export async function updateWorkoutSet(
  setId: string,
  weightKg: number,
  reps: number,
  setType: string
): Promise<any> {
  const response = await axios.put(`/api/workouts/sets/${setId}`, null, {
    params: {
      weight_kg: weightKg,
      reps,
      set_type: setType,
    },
  });
  return response.data;
}

export async function deleteWorkoutSet(setId: string): Promise<void> {
  await axios.delete(`/api/workouts/sets/${setId}`);
}

export interface WorkoutAiAnalysis {
  id: string;
  user_id: string;
  session_id: string;
  prompt: string;
  response: string;
  model_used: string;
  tokens_prompt: number;
  tokens_completion: number;
  created_at: string;
}

export async function getWorkoutAiAnalysis(sessionId: string): Promise<WorkoutAiAnalysis> {
  const response = await axios.post<WorkoutAiAnalysis>("/api/ai/coach", {
    session_id: sessionId,
  });
  return response.data;
}







