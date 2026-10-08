export type AlarmRepeat = 'once' | 'daily' | 'weekdays' | 'weekends';

export interface AlarmItem {
  id: string;
  time: string; // HH:mm format (24-hour)
  label: string;
  enabled: boolean;
  repeat: AlarmRepeat;
  createdAt: number;
}
