// src/services/AuthService.ts
import api from "./api";
import type { User } from "../store/userStore";

export interface AuthResponse {
  token: string;
  user: User;
}

export const AuthService = {
  async login(login: string, password: string, recaptcha_token: string) {
    const response = await api.post<AuthResponse>("/auth/login", {
      login,
      password,
      recaptcha_token,
      device_name: "pwa",
    });

    return response;
  },

  async logout() {
    await api.post("/auth/logout");
  },

  async verifyCode(code: string, email: string) {
    const response = await api.post<AuthResponse>("/auth/verify-code", {
      code,
      email,
    });
    return response;
  },
};

export default AuthService;
