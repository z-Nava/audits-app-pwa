import api from "./api";

export const AuditService = {
  getAll() {
    return api.get("/audits");
  }
};
