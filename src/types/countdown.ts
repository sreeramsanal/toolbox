export interface CountdownEvent {
  id: string;
  title: string;
  targetTimestamp: number;
  createdAt: number;
  isPaused?: boolean;
  pausedRemainingMs?: number;
  isCompleted?: boolean;
}
