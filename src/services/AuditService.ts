import api from "./api";
import { AuditListResponse, Audit } from "../types/audits"

export const AuditService = {

  async list(): Promise<AuditListResponse> {
    const response = await api.get<AuditListResponse>("/audits");
    return response.data;
  },

  async getAudit(id: number): Promise<Audit> {
    const resp = await api.get<Audit>(`/audits/${id}`);
    return resp.data;
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
    const resp = await api.post(`/audits/${auditId}/submit`, {
      ended_at: new Date().toISOString(),
    });
    return resp.data;
  },

  async findByAssignment(assignmentId: number, technicianId: number) {
    const resp = await api.get(`/audits?assignment_id=${assignmentId}&technician_id=${technicianId}`);
      return resp.data.data?.[0] ?? null;
  }

};
