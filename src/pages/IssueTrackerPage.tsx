import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  Check
} from 'lucide-react';
import type { Issue, IssuePriority, IssueStatus } from '../types/issue';
import { getStoredIssues, saveStoredIssues } from '../utils/localStorage';
import { playClickSound } from '../utils/sound';

export const IssueTrackerPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | IssueStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | IssuePriority>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'priority'>('newest');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formStatus, setFormStatus] = useState<IssueStatus>('OPEN');
  const [formPriority, setFormPriority] = useState<IssuePriority>('MEDIUM');
  const [formLabels, setFormLabels] = useState('');

  useEffect(() => {
    setIssues(getStoredIssues());
  }, []);

  const persist = (updated: Issue[]) => {
    setIssues(updated);
    saveStoredIssues(updated);
  };

  const handleToggleDone = (id: string) => {
    playClickSound();
    const updated = issues.map(i => {
      if (i.id === id) {
        return {
          ...i,
          status: (i.status === 'DONE' ? 'OPEN' : 'DONE') as IssueStatus,
          updatedAt: Date.now(),
        };
      }
      return i;
    });
    persist(updated);
  };

  const handleDelete = (id: string) => {
    playClickSound();
    const updated = issues.filter(i => i.id !== id);
    persist(updated);
  };

  const handleOpenCreateModal = () => {
    setEditingIssue(null);
    setFormTitle('');
    setFormStatus('OPEN');
    setFormPriority('HIGH');
    setFormLabels('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (issue: Issue) => {
    setEditingIssue(issue);
    setFormTitle(issue.title);
    setFormStatus(issue.status);
    setFormPriority(issue.priority);
    setFormLabels(issue.labels.join(', '));
    setIsModalOpen(true);
  };

  const handleSaveIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    playClickSound();

    const labelList = formLabels
      .split(',')
      .map(l => l.trim().toUpperCase())
      .filter(Boolean);

    if (editingIssue) {
      const updated = issues.map(i => {
        if (i.id === editingIssue.id) {
          return {
            ...i,
            title: formTitle.trim(),
            status: formStatus,
            priority: formPriority,
            labels: labelList,
            updatedAt: Date.now(),
          };
        }
        return i;
      });
      persist(updated);
    } else {
      const nextNum = Math.floor(100 + Math.random() * 900);
      const newIssue: Issue = {
        id: `#${nextNum}`,
        title: formTitle.trim(),
        status: formStatus,
        priority: formPriority,
        labels: labelList.length ? labelList : ['TASK'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      persist([newIssue, ...issues]);
    }

    setIsModalOpen(false);
  };

  // Stats calculation
  const openCount = issues.filter(i => i.status === 'OPEN').length;
  const inProgressCount = issues.filter(i => i.status === 'IN PROGRESS').length;
  const doneCount = issues.filter(i => i.status === 'DONE').length;
  const total = issues.length;
  const velocity = total > 0 ? Math.round((doneCount / total) * 100) : 100;

  // Filter & sort
  const filteredIssues = issues
    .filter(i => {
      const matchesSearch = 
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.id.toLowerCase().includes(search.toLowerCase()) ||
        i.labels.some(l => l.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || i.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return b.createdAt - a.createdAt;
      if (sortOrder === 'oldest') return a.createdAt - b.createdAt;
      const rank: Record<IssuePriority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return rank[b.priority] - rank[a.priority];
    });

  const formatAge = (timestamp: number) => {
    const diffHours = Math.floor((Date.now() - timestamp) / (1000 * 3600));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const days = Math.floor(diffHours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-purple mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse"></span>
            TASK MANAGEMENT • BACKLOG
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-dark-text">Issue Tracker</h1>
          <p className="text-xs text-dark-text-muted mt-1">
            Keep track of tasks, priorities, and workflow progress.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-dark-text-secondary bg-dark-surface1 px-3 py-1.5 rounded-lg border border-dark-border">
          <Check className="w-3.5 h-3.5 text-brand-emerald" />
          <span>Auto-saved</span>
          <span className="text-dark-border">•</span>
          <span className="text-dark-text-muted">{issues.length} Tasks</span>
        </div>
      </div>

      {/* 3 Summary Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Open */}
        <div className="p-5 rounded-xl bg-dark-surface1 border border-dark-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-dark-text-muted mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-indigo"></span> OPEN
            </span>
            <span className="text-[11px] text-brand-indigo font-bold">○</span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-mono font-bold text-dark-text">{openCount}</span>
            <span className="text-xs text-dark-text-muted font-mono">active backlog</span>
          </div>
          <div className="w-full h-1 bg-dark-surface3 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-brand-indigo rounded-full" 
              style={{ width: `${total ? (openCount / total) * 100 : 0}%` }} 
            />
          </div>
        </div>

        {/* In Progress */}
        <div className="p-5 rounded-xl bg-dark-surface1 border border-dark-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-dark-text-muted mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-cyan"></span> IN PROGRESS
            </span>
            <span className="text-[11px] text-brand-cyan font-bold">◐</span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-mono font-bold text-dark-text">{inProgressCount}</span>
            <span className="text-xs text-dark-text-muted font-mono">active sprint</span>
          </div>
          <div className="w-full h-1 bg-dark-surface3 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-brand-cyan rounded-full" 
              style={{ width: `${total ? (inProgressCount / total) * 100 : 0}%` }} 
            />
          </div>
        </div>

        {/* Done */}
        <div className="p-5 rounded-xl bg-dark-surface1 border border-dark-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-dark-text-muted mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-emerald"></span> DONE
            </span>
            <span className="text-[11px] text-brand-emerald font-bold">●</span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-mono font-bold text-dark-text">{doneCount}</span>
            <span className="text-xs text-brand-emerald font-mono">{velocity}% velocity</span>
          </div>
          <div className="w-full h-1 bg-dark-surface3 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-brand-emerald rounded-full" 
              style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }} 
            />
          </div>
        </div>

      </div>

      {/* Filter & Action Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-xl bg-dark-surface1 border border-dark-border mb-6">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues, labels, or #id..."
            className="w-full bg-dark-surface2 text-dark-text placeholder:text-dark-text-muted pl-9 pr-4 py-2 rounded-lg border border-dark-border text-xs focus:border-brand-indigo focus:outline-none"
          />
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | IssueStatus)}
            className="bg-dark-surface2 text-dark-text-secondary px-3 py-2 rounded-lg border border-dark-border text-xs focus:outline-none"
          >
            <option value="ALL">Status: All</option>
            <option value="OPEN">Status: Open</option>
            <option value="IN PROGRESS">Status: In Progress</option>
            <option value="DONE">Status: Done</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'ALL' | IssuePriority)}
            className="bg-dark-surface2 text-dark-text-secondary px-3 py-2 rounded-lg border border-dark-border text-xs focus:outline-none"
          >
            <option value="ALL">Priority: All</option>
            <option value="HIGH">Priority: High</option>
            <option value="MEDIUM">Priority: Medium</option>
            <option value="LOW">Priority: Low</option>
          </select>

          {/* Sort order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'priority')}
            className="bg-dark-surface2 text-dark-text-secondary px-3 py-2 rounded-lg border border-dark-border text-xs focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority First</option>
          </select>

          {/* New Issue Button */}
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-indigo hover:bg-brand-indigo/90 text-white text-xs font-medium transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Issue</span>
          </button>
        </div>

      </div>

      {/* Issues Table */}
      <div className="rounded-xl bg-dark-surface1 border border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-dark-border bg-dark-surface2/50 text-[10px] font-mono uppercase text-dark-text-muted">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Issue Details</th>
                <th className="py-3 px-4 w-28 text-center">Priority</th>
                <th className="py-3 px-4 w-32 text-center">Status</th>
                <th className="py-3 px-4 w-28 text-right">Age</th>
                <th className="py-3 px-4 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/60">
              {issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center text-brand-indigo mb-3">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-semibold text-dark-text mb-1">No issues tracked yet</div>
                      <div className="text-xs text-dark-text-muted mb-4 max-w-xs">
                        Create your first issue or task to start tracking workflow status and priorities.
                      </div>
                      <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-indigo hover:bg-brand-indigo/90 text-white text-xs font-medium transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>New Issue</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-dark-text-muted font-mono">
                    No issues match your current filters.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => {
                  const isDone = issue.status === 'DONE';
                  return (
                    <tr 
                      key={issue.id} 
                      className={`hover:bg-dark-surface2/40 transition-colors ${
                        isDone ? 'opacity-70 bg-dark-surface1/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleDone(issue.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                            isDone 
                              ? 'bg-brand-emerald border-brand-emerald text-white' 
                              : 'border-dark-border hover:border-brand-indigo'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-dark-text-muted font-semibold">{issue.id}</span>
                          <span className={`font-medium text-dark-text ${isDone ? 'line-through text-dark-text-muted' : ''}`}>
                            {issue.title}
                          </span>
                          {issue.labels.map((lbl, idx) => (
                            <span 
                              key={idx} 
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-dark-surface2 border border-dark-border text-dark-text-secondary"
                            >
                              {lbl}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                          issue.priority === 'HIGH' 
                            ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                            : issue.priority === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}>
                          {issue.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                          issue.status === 'OPEN'
                            ? 'bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/30'
                            : issue.status === 'IN PROGRESS'
                            ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30'
                            : 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {issue.status}
                        </span>
                      </td>

                      {/* Age */}
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-dark-text-muted">
                        {formatAge(issue.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-dark-text-muted">
                          <button
                            onClick={() => handleOpenEditModal(issue)}
                            className="p-1 hover:text-dark-text transition"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(issue.id)}
                            className="p-1 hover:text-red-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 border-t border-dark-border bg-dark-surface2/30 flex items-center justify-between text-[11px] font-mono text-dark-text-muted">
          <div>
            Showing <strong className="text-dark-text">{filteredIssues.length}</strong> of {total} tasks
          </div>
          <div className="flex items-center gap-1.5 text-brand-emerald">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
            All changes saved
          </div>
        </div>
      </div>

      {/* Create / Edit Issue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-dark-surface1 border border-dark-border rounded-xl shadow-2xl p-6 text-dark-text">
            
            <div className="flex items-center justify-between pb-3 border-b border-dark-border mb-4">
              <h2 className="text-base font-bold font-mono text-dark-text">
                {editingIssue ? `Edit Task ${editingIssue.id}` : 'Create New Issue'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-dark-text-muted hover:text-dark-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveIssue} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-[11px] uppercase text-dark-text-muted mb-1.5">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Optimize calculation formula speed"
                  className="w-full bg-dark-surface2 text-dark-text px-3 py-2 rounded-lg border border-dark-border focus:border-brand-indigo focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-dark-text-muted mb-1.5">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as IssueStatus)}
                    className="w-full bg-dark-surface2 text-dark-text px-3 py-2 rounded-lg border border-dark-border focus:outline-none"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase text-dark-text-muted mb-1.5">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as IssuePriority)}
                    className="w-full bg-dark-surface2 text-dark-text px-3 py-2 rounded-lg border border-dark-border focus:outline-none"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-dark-text-muted mb-1.5">
                  Labels (comma-separated)
                </label>
                <input
                  type="text"
                  value={formLabels}
                  onChange={(e) => setFormLabels(e.target.value)}
                  placeholder="UI, MOBILE, CORE"
                  className="w-full bg-dark-surface2 text-dark-text px-3 py-2 rounded-lg border border-dark-border focus:border-brand-indigo focus:outline-none text-xs uppercase font-mono"
                />
              </div>

              <div className="pt-3 border-t border-dark-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-dark-border text-dark-text-secondary hover:bg-dark-surface2 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-indigo hover:bg-brand-indigo/90 text-white font-medium transition"
                >
                  {editingIssue ? 'Update Issue' : 'Create Issue'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
