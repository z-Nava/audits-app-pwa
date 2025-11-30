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

export interface Tool {
  id: number;
  name: string;
  code: string;
  model?: string;
  description?: string;
}

export interface Assignment {
  id: number;
  notes?: string;
  shift: string;
  status: string;
  line: {
    id: number;
    name: string;
    code: string;
  };
  tools?: Tool[];
}

export interface AuditItem {
  id: number;
  tool_id: number;
  result: string;
  comments?: string;
  defects?: string;
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
  
   items?: AuditItem[];
}

export interface AuditListResponse {
  current_page: number;
  data: Audit[];
  last_page: number;
  total: number;
}
