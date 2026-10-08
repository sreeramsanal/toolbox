import type { Issue } from '../types/issue';
import type { CalculationHistoryItem } from '../types/calculator';
import type { CountdownEvent } from '../types/countdown';
import type { AlarmItem } from '../types/alarm';

const ISSUES_KEY = 'toolbox_issues';
const CALC_HISTORY_KEY = 'toolbox_calc_history';
const COUNTDOWNS_KEY = 'toolbox_countdowns';
const ALARMS_KEY = 'toolbox_alarms';

// Legacy mock identifiers to clean up from user's storage
const DUMMY_ISSUE_IDS = new Set(['#124', '#123', '#122', '#121', '#120']);
const DUMMY_COUNTDOWN_TITLES = new Set(['Product Launch v2.0', 'Quarterly Review', 'Team Offsite']);
const DUMMY_ALARM_LABELS = new Set(['Morning Workout', 'Sprint Standup']);
const DUMMY_CALC_EXPRESSIONS = new Set(['840 × 1.15', '2048 ÷ 16', '1200 + 45.50']);

export function getStoredIssues(): Issue[] {
  try {
    const raw = localStorage.getItem(ISSUES_KEY);
    if (!raw) return [];
    const parsed: Issue[] = JSON.parse(raw);
    const cleaned = parsed.filter(i => !DUMMY_ISSUE_IDS.has(i.id));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(ISSUES_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredIssues(issues: Issue[]): void {
  try {
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
  } catch {
    // ignore
  }
}

export function getStoredCalcHistory(): CalculationHistoryItem[] {
  try {
    const raw = localStorage.getItem(CALC_HISTORY_KEY);
    if (!raw) return [];
    const parsed: CalculationHistoryItem[] = JSON.parse(raw);
    const cleaned = parsed.filter(i => !DUMMY_CALC_EXPRESSIONS.has(i.expression));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(CALC_HISTORY_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredCalcHistory(history: CalculationHistoryItem[]): void {
  try {
    localStorage.setItem(CALC_HISTORY_KEY, JSON.stringify(history.slice(-30)));
  } catch {
    // ignore
  }
}

export function getStoredCountdowns(): CountdownEvent[] {
  try {
    const raw = localStorage.getItem(COUNTDOWNS_KEY);
    if (!raw) return [];
    const parsed: CountdownEvent[] = JSON.parse(raw);
    const cleaned = parsed.filter(i => !DUMMY_COUNTDOWN_TITLES.has(i.title));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(COUNTDOWNS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredCountdowns(events: CountdownEvent[]): void {
  try {
    localStorage.setItem(COUNTDOWNS_KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}

export function getStoredAlarms(): AlarmItem[] {
  try {
    const raw = localStorage.getItem(ALARMS_KEY);
    if (!raw) return [];
    const parsed: AlarmItem[] = JSON.parse(raw);
    const cleaned = parsed.filter(i => !DUMMY_ALARM_LABELS.has(i.label));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(ALARMS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredAlarms(alarms: AlarmItem[]): void {
  try {
    localStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
  } catch {
    // ignore
  }
}
