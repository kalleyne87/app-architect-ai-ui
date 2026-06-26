export interface SessionSummary {
  id: string;
  title: string;
  status: SessionStatus;
  createdAt: Date;
}

export enum SessionStatus {
  Active = 'active',
  Completed = 'completed',
  Failed = 'failed'
}