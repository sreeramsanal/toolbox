import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Trash2, 
  Clock, 
  Volume2, 
  Check, 
  Hourglass, 
  DollarSign,
  Calendar
} from 'lucide-react';
import type { AlarmItem, AlarmRepeat } from '../types/alarm';
import { getStoredAlarms, saveStoredAlarms } from '../utils/localStorage';
import { playAlarmSound, playClickSound } from '../utils/sound';

export const AlarmPage: React.FC = () => {
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);

  // Form state
  const [formTime, setFormTime] = useState('08:00');
  const [formLabel, setFormLabel] = useState('');
  const [formRepeat, setFormRepeat] = useState<AlarmRepeat>('weekdays');

  useEffect(() => {
    setAlarms(getStoredAlarms());
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Chronometer tick & Alarm checker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;
      const seconds = now.getSeconds();

      // Check alarms at second 0
      if (seconds === 0) {
        const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        alarms.forEach(a => {
          if (a.enabled && a.time === timeStr) {
            let shouldTrigger = false;
            if (a.repeat === 'once' || a.repeat === 'daily') shouldTrigger = true;
            else if (a.repeat === 'weekdays' && !isWeekend) shouldTrigger = true;
            else if (a.repeat === 'weekends' && isWeekend) shouldTrigger = true;

            if (shouldTrigger) {
              setRingingAlarm(a);
              playAlarmSound();

              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`ALARM: ${a.label || 'Alarm Alert'}`, {
                  body: `It is now ${a.time}. Your browser alert triggered.`,
                  icon: '/logo.svg',
                });
              }
            }
          }
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [alarms]);

  const requestNotification = async () => {
    playClickSound();
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
    }
  };

  const toggleAlarm = (id: string) => {
    playClickSound();
    const updated = alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
    setAlarms(updated);
    saveStoredAlarms(updated);
  };

  const deleteAlarm = (id: string) => {
    playClickSound();
    const updated = alarms.filter(a => a.id !== id);
    setAlarms(updated);
    saveStoredAlarms(updated);
  };

  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTime) return;
    playClickSound();

    const newAlarm: AlarmItem = {
      id: String(Date.now()),
      time: formTime,
      label: formLabel.trim() || 'Alarm',
      enabled: true,
      repeat: formRepeat,
      createdAt: Date.now(),
    };

    const updated = [newAlarm, ...alarms];
    setAlarms(updated);
    saveStoredAlarms(updated);
    setFormLabel('');
  };

  const dismissRinging = () => {
    setRingingAlarm(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-purple mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse"></span>
            TIME ALERTS & SCHEDULES
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-dark-text">Alarm Clock</h1>
          <p className="text-xs text-dark-text-muted mt-1">
            Set custom alarms with repeatable schedules and audio alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/countdown"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface1 hover:bg-dark-surface2 text-dark-text-secondary text-xs font-mono transition"
          >
            <Hourglass className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Countdown</span>
          </Link>
          <Link
            to="/currency"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface1 hover:bg-dark-surface2 text-dark-text-secondary text-xs font-mono transition"
          >
            <DollarSign className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Currency</span>
          </Link>
        </div>
      </div>

      {/* Ringing Notification Banner */}
      {ringingAlarm && (
        <div className="p-4 rounded-xl bg-brand-indigo border border-brand-indigo text-white mb-6 flex items-center justify-between shadow-glow-indigo animate-bounce">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 animate-pulse" />
            <div>
              <div className="text-sm font-bold">ALARM RINGING: {ringingAlarm.time}</div>
              <div className="text-xs opacity-90">{ringingAlarm.label}</div>
            </div>
          </div>
          <button
            onClick={dismissRinging}
            className="px-4 py-2 rounded-lg bg-white text-brand-indigo font-bold text-xs hover:bg-white/90 transition shadow-sm"
          >
            Dismiss Alert
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Live System Chronometer (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-dark-surface1 border border-dark-border shadow-xl flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-dark-border/60 mb-6">
              <span className="text-xs font-mono uppercase text-dark-text font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-purple" />
                CURRENT TIME
              </span>
              
              {notificationPermission === 'granted' ? (
                <span className="flex items-center gap-1 text-[10px] font-mono text-brand-emerald">
                  <Check className="w-3 h-3" /> Notifications Enabled
                </span>
              ) : (
                <button
                  onClick={requestNotification}
                  className="px-2 py-0.5 rounded text-[10px] font-mono text-brand-indigo hover:underline"
                >
                  Enable Notifications
                </button>
              )}
            </div>

            {/* Big Live Clock */}
            <div className="text-center py-6">
              <div className="text-5xl sm:text-6xl font-mono font-bold text-dark-text tracking-tight tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-sm font-medium text-dark-text-secondary mt-2 flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4 text-brand-purple" />
                <span>{currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-dark-surface2/60 border border-dark-border flex items-center gap-2.5 text-xs text-dark-text-muted my-4">
              <Volume2 className="w-4 h-4 text-brand-indigo shrink-0" />
              <span>Acoustic audio alert + Web Audio synthesizer enabled</span>
            </div>
          </div>

          <div className="pt-4 border-t border-dark-border/60 text-[11px] font-mono text-dark-text-muted">
            <span className="text-brand-purple font-semibold">BROWSER LIMITATION NOTE: </span>
            Alarms trigger when this browser tab remains active. Browsers suspend background scripts if tabs sleep.
          </div>

        </div>

        {/* Configured Alarms & Add Form (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Alarms List */}
          <div className="p-6 rounded-2xl bg-dark-surface1 border border-dark-border">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border mb-4">
              <div className="text-xs font-mono uppercase text-dark-text font-semibold">
                CONFIGURED ALARMS ({alarms.length})
              </div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {alarms.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-dark-text-muted">
                  No active alarms configured. Add an alarm below.
                </div>
              ) : (
                alarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="p-3.5 rounded-xl bg-dark-surface2/70 border border-dark-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${alarm.enabled ? 'bg-brand-purple/20 text-brand-purple' : 'bg-dark-surface3 text-dark-text-muted'}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xl font-mono font-bold text-dark-text tabular-nums">
                          {alarm.time}
                        </div>
                        <div className="text-xs text-dark-text-muted flex items-center gap-1.5">
                          <span>{alarm.label}</span>
                          <span>•</span>
                          <span className="text-brand-cyan text-[11px] uppercase font-mono">{alarm.repeat}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Toggle Switch */}
                      <button
                        onClick={() => toggleAlarm(alarm.id)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                          alarm.enabled ? 'bg-brand-indigo' : 'bg-dark-surface3'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            alarm.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => deleteAlarm(alarm.id)}
                        className="p-1.5 text-dark-text-muted hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Add Alarm Form */}
          <div className="p-6 rounded-2xl bg-dark-surface1 border border-dark-border">
            <div className="text-xs font-mono uppercase text-dark-text font-semibold mb-3">
              QUICK ADD ALARM
            </div>

            <form onSubmit={handleAddAlarm} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-dark-text-muted mb-1">
                    Alarm Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-dark-surface2 text-dark-text text-sm font-mono font-bold px-3 py-2 rounded-lg border border-dark-border focus:border-brand-purple focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-dark-text-muted mb-1">
                    Repetition
                  </label>
                  <select
                    value={formRepeat}
                    onChange={(e) => setFormRepeat(e.target.value as AlarmRepeat)}
                    className="w-full bg-dark-surface2 text-dark-text text-xs px-3 py-2.5 rounded-lg border border-dark-border focus:outline-none"
                  >
                    <option value="weekdays">Every Weekday</option>
                    <option value="daily">Daily</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="once">Once</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-dark-text-muted mb-1">
                  Label / Note
                </label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. Daily Standup, Workout"
                  className="w-full bg-dark-surface2 text-dark-text px-3 py-2 rounded-lg border border-dark-border focus:border-brand-purple focus:outline-none text-xs"
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-white font-medium transition text-xs"
                >
                  Save Alarm
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
