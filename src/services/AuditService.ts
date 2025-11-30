import api from "./api";
import { AuditListResponse, Audit } from "../types/audits"

export const AuditService = {
  async list(): Promise<AuditListResponse> {
    const response = await api.get("/audits");
    return response.data;
  },

  async getAudit(id: number): Promise<Audit> {
    const response = await api.get(`/audits/${id}`);
    return response.data;
  },

  async createItem(auditId: number, toolId: number) {
    const resp = await api.post(`/audits/${auditId}/items`, {
      tool_id: toolId,
      result: "PASS",
      comments: "",
    });
    return resp.data;
  },

  async updateItem(itemId: number, data: any) {
    const resp = await api.put(`/audit-items/${itemId}`, data);
    return resp.data;
  },

  async submitAudit(auditId: number) {
    return api.post(`/audits/${auditId}/submit`, {
      ended_at: new Date().toISOString(),
    });
  },
};


