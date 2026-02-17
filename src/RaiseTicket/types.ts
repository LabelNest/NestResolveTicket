
export enum TicketStatus {
  TODO = 'TO DO',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  IN_REVIEW = 'IN REVIEW',
  DONE = 'DONE',
  REJECTED = 'REJECTED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}


export interface TicketTypeConfig {
  ticket_type: string;
  label: string;
  icon: string;
  description: string;
  allowed_roles: string[];
  visible_to: 'internal' | 'external' | 'all';
  form_schema_json: {
    fields: FormField[];
  };
  default_team: string;
}

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'url' | 'file';
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
}

export interface Ticket {
  id: string;
  tenant_id: string | null;
  issue_origin: string | null;
  title: string;
  description: string | null;
  type: string | null;
  department: string | null;
  priority: Priority;
  status: TicketStatus;
  created_by: string | null;
  assigned_to: string | null;
  created_by_name: string | null;
  created_by_email: string | null;
  created_at: string | null;
  source_module: string | null;
  dataset: string | null;
  entity_id: string | null;
  field_name: string | null;
  confidence_score: number | null;
}


export interface TicketMetadata {
  id: string;
  ticket_id: string;
  field_key: string;
  field_value: string;
}

export interface Attachment {
  id: string;
  ticket_id: string;
  name: string;
  url: string;
}
