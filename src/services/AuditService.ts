import api from "./api";
import { AuditListResponse, Audit } from "../types/audits"

export const AuditService = {
  async list(): Promise<AuditListResponse> {
    const response = await api.get("/audits");
    return response.data;
  },

  async get(id: number): Promise<Audit> {
    const response = await api.get(`/audits/${id}`);
    return response.data;
  }
};
