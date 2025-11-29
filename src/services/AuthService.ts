// src/services/AuthService.ts
import api from "./api";
import type { User } from "../store/userStore";

export interface AuthResponse {
  token: string;
  user: User;
}

export const AuthService = {
  async login(login: string, password: string) {
    const response = await api.post<AuthResponse>("/api/v1/auth/login", {
      login,
      password,
      device_name: "pwa",
    });

    return response;
  },

  async logout() {
    // opcional, lo dejamos listo para después
    await api.post("/api/v1/auth/logout");
  },
};

export default AuthService;
