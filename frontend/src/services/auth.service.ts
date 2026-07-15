import api from "./api";
import type { AuthResponse, User } from "../types";

export async function login(email: string, password: string) {
  const response = await api.post<{ success: boolean; data: AuthResponse }>(
    "/auth/login",
    { email, password }
  );
  return response.data;
}

export async function register(name: string, email: string, password: string) {
  const response = await api.post<{ success: boolean; data: AuthResponse }>(
    "/auth/register",
    { name, email, password }
  );
  return response.data;
}

export async function getMe() {
  const response = await api.get<{ success: boolean; data: User }>("/auth/me");
  return response.data;
}

export async function updateProfile(name: string, email: string) {
  const response = await api.put<{ success: boolean; data: User }>(
    "/auth/profile",
    { name, email }
  );
  return response.data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const response = await api.put<{ success: boolean; message: string }>(
    "/auth/password",
    { currentPassword, newPassword }
  );
  return response.data;
}
