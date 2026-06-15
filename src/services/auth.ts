import axios from "axios";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await axios.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });
  return response.data;
}
