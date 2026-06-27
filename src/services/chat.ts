import axios from "axios";

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface BackendChatMessage {
  id: string;
  session_id: string;
  sender: "user" | "ai";
  content: string;
  created_at: string;
}

export async function fetchChatSessions(): Promise<ChatSession[]> {
  const response = await axios.get<ChatSession[]>("/api/ai/chat/sessions");
  return response.data;
}

export async function createChatSession(): Promise<ChatSession> {
  const response = await axios.post<ChatSession>("/api/ai/chat/sessions");
  return response.data;
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  await axios.delete(`/api/ai/chat/sessions/${sessionId}`);
}

export async function fetchChatMessages(sessionId: string): Promise<BackendChatMessage[]> {
  const response = await axios.get<BackendChatMessage[]>(`/api/ai/chat/sessions/${sessionId}/messages`);
  return response.data;
}
