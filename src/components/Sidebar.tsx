import {
  CalendarRange, ClipboardCheck, FlaskConical, Gauge, HelpCircle, History,
  LayoutDashboard, MessageSquareText, Settings, SquareKanban, TrendingUp,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useApp } from '@/store/app';
import type { ScreenId } from '@/data/model';
import { Avatar } from './ui';

type Item = { id: ScreenId; label: string; icon: React.ElementType; badge?: number };

export function Sidebar() {
  const { screen, navigate, pendingCount, openTaskIds, pushToast } = useApp();

  const groups: { label: string; items: Item[] }[] = [
    { label: 'Command Center', items: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }] },
    {
      label: 'Intelligence', items: [
        { id: 'sandbox', label: 'Resort Sandbox', icon: FlaskConical },
        { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp },
        { id: 'guests', label: 'Guest Intelligence', icon: MessageSquareText },
      ],
    },
    {
      label: 'Operations', items: [
        { id: 'actions', label: 'Action Plans', icon: ClipboardCheck, badge: pendingCount },
        { id: 'scheduler', label: 'Staff Scheduler', icon: CalendarRange },
        { id: 'tasks', label: 'Tasks', icon: SquareKanban, badge: openTaskIds },
      ],
    },
    {
      label: 'Management', items: [
        { id: 'history', label: 'Scenario History', icon: History },
        { id: 'accuracy', label: 'Feedback & Accuracy', icon: Gauge },
      ],
    },
  ];

  return (
    <aside className="w-[232px] shrink-0 h-full flex flex-col bg-white border-r border-slate-200 select-none">
      {/* Brand */}
      <div className="h-16 flex items-center gap-2.5 px-4 border-b border-slate-200">
        <div className="size-9 rounded-[10px] bg-emerald-600 flex items-center justify-center font-extrabold text-[13px] text-white tracking-tight shadow-sm">
          R360
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-bold text-slate-900 tracking-tight">ResortSandbox</p>
          <p className="text-[10px] font-semibold text-emerald-600 tracking-[0.28em]">3 6 0</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
        {groups.map(g => (
          <div key={g.label}>
            <p className="px-2.5 mb-1.5 text-[9.5px] font-bold tracking-[0.18em] text-slate-400 uppercase">{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map(it => {
                const active = screen === it.id;
                const Icon = it.icon;
                return (
                  <button key={it.id} onClick={() => navigate(it.id)}
                    className={cn(
                      'w-full h-9 px-2.5 rounded-lg flex items-center gap-2.5 text-[13px] font-medium transition-all duration-200 relative group',
                      active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                    )}>
                    <span className={cn('absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-emerald-500 transition-all', active ? 'h-5 opacity-100' : 'h-0 opacity-0')} />
                    <Icon className={cn('size-4 shrink-0 transition-colors', active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600')} strokeWidth={2} />
                    <span className="flex-1 text-left truncate">{it.label}</span>
                    {it.badge != null && it.badge > 0 && (
                      <span className={cn('min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-bold flex items-center justify-center tnum',
                        it.id === 'actions' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200')}>
                        {it.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2.5 pb-2 space-y-0.5 border-t border-slate-200 pt-3">
        <button onClick={() => pushToast('info', 'Settings', 'Property configuration is admin-managed in this demo.')}
          className="w-full h-9 px-2.5 rounded-lg flex items-center gap-2.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <Settings className="size-4 text-slate-400" /> Settings
        </button>
        <button onClick={() => pushToast('info', 'Help & playbooks', 'Operational runbooks live in the knowledge base (demo).')}
          className="w-full h-9 px-2.5 rounded-lg flex items-center gap-2.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <HelpCircle className="size-4 text-slate-400" /> Help
        </button>
      </div>

      {/* User card */}
      <div className="m-2.5 mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2.5">
          <Avatar name="Sarah Morgan" />
          <div className="min-w-0 leading-tight">
            <p className="text-[12.5px] font-semibold text-slate-900 truncate">Sarah Morgan</p>
            <p className="text-[10.5px] text-slate-500 truncate">General Manager</p>
          </div>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10.5px] text-slate-500 font-medium">Azure Bay Resort</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
            OPERATIONAL
          </span>
        </div>
      </div>
    </aside>
  );
}
