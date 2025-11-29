import api from "./api";

export const AuthService = {
  async login(login: string, password: string) {
    return api.post("/auth/login", {
      login,
      password,
    });
  },
};
