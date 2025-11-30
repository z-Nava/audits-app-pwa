// src/types/audit.ts

export interface Line {
  id: number;
  code: string;
  name: string;
}

export interface Person {
  id: number;
  name: string;
  email: string;
}

export interface Assignment {
  id: number;
  supervisor_id: number;
  technician_id: number;
  line_id: number;
  shift: string;
  status: string;
}

export interface Audit {
  id: number;
  assignment_id: number;
  technician_id: number;
  supervisor_id: number;
  employee_number: string;
  audit_code: string;
  line_id: number;
  shift: string;
  status: string;
  summary: string | null;
  overall_result: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;

  assignment: Assignment;
  technician: Person;
  supervisor: Person;
  line: Line;
}

export interface AuditListResponse {
  current_page: number;
  data: Audit[];
  last_page: number;
  total: number;
}
