import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  Bell, 
  DollarSign, 
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CountdownEvent } from '../types/countdown';
import { getStoredCountdowns, saveStoredCountdowns } from '../utils/localStorage';
import { playClickSound, playCountdownCompleteSound } from '../utils/sound';

export const CountdownPage: React.FC = () => {
  const [events, setEvents] = useState<CountdownEvent[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('12:00');

  useEffect(() => {
    const list = getStoredCountdowns();
    setEvents(list);
    if (list.length > 0) setActiveId(list[0].id);
  }, []);

  // Timestamp-based tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeEvent = events.find(e => e.id === activeId) || events[0];

  // Calculate remaining
  let remainingMs = 0;
  let isDone = false;
  if (activeEvent) {
    if (activeEvent.isPaused && activeEvent.pausedRemainingMs !== undefined) {
      remainingMs = activeEvent.pausedRemainingMs;
    } else {
      remainingMs = Math.max(0, activeEvent.targetTimestamp - currentTime);
    }
    isDone = remainingMs <= 0;
  }

  // Handle countdown complete sound & confetti trigger once
  useEffect(() => {
    if (isDone && activeEvent && !activeEvent.isCompleted) {
      playCountdownCompleteSound();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      const updated = events.map(e => e.id === activeEvent.id ? { ...e, isCompleted: true } : e);
      setEvents(updated);
      saveStoredCountdowns(updated);
    }
  }, [isDone, activeEvent, events]);

  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  // Progress
  const totalDuration = activeEvent ? (activeEvent.targetTimestamp - activeEvent.createdAt) : 1;
  const elapsed = totalDuration - remainingMs;
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / (totalDuration || 1)) * 100)));

  const handleTogglePause = () => {
    if (!activeEvent) return;
    playClickSound();
    const updated = events.map(e => {
      if (e.id === activeEvent.id) {
        if (e.isPaused) {
          // Resume
          const newTarget = Date.now() + (e.pausedRemainingMs || 0);
          return { ...e, isPaused: false, targetTimestamp: newTarget, pausedRemainingMs: undefined };
        } else {
          // Pause
          const rem = Math.max(0, e.targetTimestamp - Date.now());
          return { ...e, isPaused: true, pausedRemainingMs: rem };
        }
      }
      return e;
    });
    setEvents(updated);
    saveStoredCountdowns(updated);
  };

  const handleReset = () => {
    if (!activeEvent) return;
    playClickSound();
    const originalSpan = activeEvent.targetTimestamp - activeEvent.createdAt;
    const updated = events.map(e => {
      if (e.id === activeEvent.id) {
        return {
          ...e,
          createdAt: Date.now(),
          targetTimestamp: Date.now() + originalSpan,
          isPaused: false,
          isCompleted: false,
          pausedRemainingMs: undefined,
        };
      }
      return e;
    });
    setEvents(updated);
    saveStoredCountdowns(updated);
  };

  const handleDelete = (id: string) => {
    playClickSound();
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveStoredCountdowns(updated);
    if (activeId === id) {
      setActiveId(updated.length > 0 ? updated[0].id : '');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;
    playClickSound();

    const targetDate = new Date(`${formDate}T${formTime || '12:00'}`);
    const targetMs = targetDate.getTime();
    if (isNaN(targetMs) || targetMs <= Date.now()) {
      alert('Target date/time must be in the future.');
      return;
    }

    const newEvt: CountdownEvent = {
      id: String(Date.now()),
      title: formTitle.trim(),
      targetTimestamp: targetMs,
      createdAt: Date.now(),
    };

    const updated = [newEvt, ...events];
    setEvents(updated);
    saveStoredCountdowns(updated);
    setActiveId(newEvt.id);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-emerald mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></span>
            EVENT & MILESTONE TRACKER
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-dark-text">Countdown</h1>
          <p className="text-xs text-dark-text-muted mt-1">
            Count down to upcoming releases, deadlines, and milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/alarm"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface1 hover:bg-dark-surface2 text-dark-text-secondary text-xs font-mono transition"
          >
            <Bell className="w-3.5 h-3.5 text-brand-purple" />
            <span>Alarm Clock</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Countdown Card (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-dark-surface1 border border-dark-border shadow-xl flex flex-col justify-between">
          
          {!activeEvent ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-dark-text mb-2">No Active Countdown</h2>
              <p className="text-xs text-dark-text-muted max-w-sm mb-6">
                Create a countdown milestone to track remaining days, hours, and minutes in real time.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-brand-indigo hover:bg-brand-indigo/90 text-white text-xs font-mono font-medium transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Countdown</span>
              </button>
            </div>
          ) : (
            <>
              <div>
                {/* Target title & status */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-dark-border/60">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-dark-text-muted block">
                      TARGET MILESTONE
                    </span>
                    <h2 className="text-xl font-bold text-dark-text">
                      {activeEvent.title}
                    </h2>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-mono">
                    {isDone ? '● COMPLETED' : `T-MINUS: ${days}D`}
                  </div>
                </div>

                {/* 4 Digital Boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
                  
                  <div className="p-4 rounded-xl bg-dark-surface2 text-center border border-dark-border">
                    <div className="text-4xl sm:text-5xl font-mono font-bold text-dark-text tabular-nums">
                      {String(days).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-mono uppercase text-dark-text-muted mt-1">DAYS</div>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-surface2 text-center border border-dark-border">
                    <div className="text-4xl sm:text-5xl font-mono font-bold text-dark-text tabular-nums">
                      {String(hours).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-mono uppercase text-dark-text-muted mt-1">HOURS</div>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-surface2 text-center border border-dark-border">
                    <div className="text-4xl sm:text-5xl font-mono font-bold text-brand-indigo tabular-nums">
                      {String(minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-mono uppercase text-dark-text-muted mt-1">MINUTES</div>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-surface2 text-center border border-dark-border">
                    <div className="text-4xl sm:text-5xl font-mono font-bold text-brand-cyan tabular-nums">
                      {String(seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-mono uppercase text-dark-text-muted mt-1">SECONDS</div>
                  </div>

                </div>

                {/* Burn-down progress */}
                <div className="my-6">
                  <div className="flex items-center justify-between text-xs font-mono text-dark-text-muted mb-2">
                    <span>Burn-down progress</span>
                    <span className="text-brand-cyan font-bold">{progressPercent}% elapsed</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-dark-surface3 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-brand-indigo via-indigo-400 to-brand-cyan transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Controls & Target Date */}
              <div className="pt-4 border-t border-dark-border/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePause}
                    disabled={isDone}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-xs font-mono font-medium text-dark-text transition disabled:opacity-50"
                  >
                    {activeEvent.isPaused ? <Play className="w-3.5 h-3.5 text-brand-emerald" /> : <Pause className="w-3.5 h-3.5 text-brand-amber" />}
                    <span>{activeEvent.isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-xs font-mono font-medium text-dark-text transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-dark-text-muted" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="text-xs font-mono text-dark-text-muted">
                  Target: <strong className="text-dark-text">{new Date(activeEvent.targetTimestamp).toLocaleString()}</strong>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Saved Trackers List (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-dark-surface1 border border-dark-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-dark-border mb-4">
              <div className="text-xs font-mono uppercase font-semibold text-dark-text">
                SAVED TRACKERS ({events.length})
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-indigo hover:bg-brand-indigo/90 text-white text-[11px] font-mono transition"
              >
                <Plus className="w-3 h-3" /> New
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {events.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-dark-text-muted">
                  No countdowns tracked yet. Click "+ New" to add one.
                </div>
              ) : (
                events.map((evt) => {
                  const rem = Math.max(0, evt.targetTimestamp - currentTime);
                  const d = Math.floor(rem / (1000 * 3600 * 24));
                  const h = Math.floor((rem % (1000 * 3600 * 24)) / (1000 * 3600));
                  const isSelected = evt.id === activeId;
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setActiveId(evt.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-brand-indigo bg-brand-indigo/10 text-dark-text'
                          : 'border-dark-border bg-dark-surface2/60 hover:bg-dark-surface2 text-dark-text-secondary'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-dark-text">{evt.title}</div>
                        <div className="text-[10px] font-mono text-dark-text-muted">
                          Due in {d}d {h}h
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-brand-indigo" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-dark-text-muted" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(evt.id);
                          }}
                          className="p-1 text-dark-text-muted hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-dark-border/60 text-[11px] font-mono text-dark-text-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
            Accurate System Time
          </div>
        </div>

      </div>

      {/* New Countdown Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-dark-surface1 border border-dark-border rounded-xl shadow-2xl p-6 text-dark-text">
            
            <div className="flex items-center justify-between pb-3 border-b border-dark-border mb-4">
              <h2 className="text-base font-bold font-mono text-dark-text">Create Countdown</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-dark-text-muted hover:text-dark-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-[11px] uppercase text-dark-text-muted mb-1.5">
                  Milestone Name *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Q4 Release, Exam, Flight"
                  className="w-full bg-dark-surface2 text-dark-text px-3 py-2 rounded-lg border border-dark-border focus:border-brand-indigo focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-dark-text-muted mb-1.5">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-dark-surface2 text-dark-text px-3 py-2 rounded-lg border border-dark-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase text-dark-text-muted mb-1.5">
                    Target Time
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-dark-surface2 text-dark-text px-3 py-2 rounded-lg border border-dark-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-dark-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-dark-border text-dark-text-secondary hover:bg-dark-surface2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-indigo hover:bg-brand-indigo/90 text-white font-medium"
                >
                  Create Event
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
