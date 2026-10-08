export type IssueStatus = 'OPEN' | 'IN PROGRESS' | 'DONE';
export type IssuePriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Issue {
  id: string; // e.g. "#124"
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  labels: string[];
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}
