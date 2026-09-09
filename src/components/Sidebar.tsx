import {
  CalendarRange, ClipboardCheck, FlaskConical, Gauge, HelpCircle, History,
  LayoutDashboard, MessageSquareText, Settings, SquareKanban, TrendingUp, Menu, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useApp } from '@/store/app';
import type { ScreenId } from '@/data/model';
import { Avatar } from './ui';

type Item = { id: ScreenId; label: string; icon: React.ElementType; badge?: number };

export function Sidebar() {
  const { screen, navigate, pendingCount, openTaskIds, pushToast, sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useApp();

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
    <aside className={cn(
      "shrink-0 h-full flex flex-col bg-white border-r border-slate-200 select-none transition-all duration-200 z-50 max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-[232px]",
      mobileMenuOpen ? 'max-md:translate-x-0 shadow-2xl' : 'max-md:-translate-x-full md:shadow-none',
      sidebarCollapsed ? 'md:w-[68px]' : 'md:w-[232px]'
    )}>
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200 justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="size-9 shrink-0 rounded-[10px] bg-emerald-600 flex items-center justify-center font-extrabold text-[13px] text-white tracking-tight shadow-sm">
            R360
          </div>
          <div className={cn("leading-tight transition-opacity duration-200", sidebarCollapsed ? "md:opacity-0 md:hidden" : "opacity-100")}>
            <p className="text-[13px] font-bold text-slate-900 tracking-tight whitespace-nowrap">ResortSandbox</p>
            <p className="text-[10px] font-semibold text-emerald-600 tracking-[0.28em] whitespace-nowrap">3 6 0</p>
          </div>
        </div>
        {/* Desktop Toggle */}
        <button onClick={() => setSidebarCollapsed(p => !p)} className="hidden md:flex shrink-0 size-6 items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
        {/* Mobile Close */}
        <button onClick={() => setMobileMenuOpen(false)} className="md:hidden shrink-0 size-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="size-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5 overflow-x-hidden">
        {groups.map(g => (
          <div key={g.label}>
            {!sidebarCollapsed && (
              <p className="px-2.5 mb-1.5 text-[9.5px] font-bold tracking-[0.18em] text-slate-400 uppercase md:block hidden">{g.label}</p>
            )}
            <p className="px-2.5 mb-1.5 text-[9.5px] font-bold tracking-[0.18em] text-slate-400 uppercase md:hidden block">{g.label}</p>
            
            {sidebarCollapsed && (
              <div className="hidden md:block h-px bg-slate-200 mx-2.5 mb-2 mt-4 first:mt-0" />
            )}

            <div className="space-y-0.5">
              {g.items.map(it => {
                const active = screen === it.id;
                const Icon = it.icon;
                return (
                  <button key={it.id} onClick={() => navigate(it.id)}
                    className={cn(
                      'w-full h-9 rounded-lg flex items-center text-[13px] font-medium transition-all duration-200 relative group',
                      sidebarCollapsed ? 'md:px-0 md:justify-center px-2.5 gap-2.5' : 'px-2.5 gap-2.5',
                      active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                    )}>
                    <span className={cn('absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-emerald-500 transition-all', active ? 'h-5 opacity-100' : 'h-0 opacity-0')} />
                    <Icon className={cn('size-4 shrink-0 transition-colors', active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600')} strokeWidth={2} />
                    
                    <span className={cn("flex-1 text-left truncate", sidebarCollapsed && "md:hidden")}>{it.label}</span>
                    
                    {!sidebarCollapsed && it.badge != null && it.badge > 0 && (
                      <span className={cn('hidden md:flex min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-bold items-center justify-center tnum',
                        it.id === 'actions' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200')}>
                        {it.badge}
                      </span>
                    )}
                    {it.badge != null && it.badge > 0 && (
                      <span className={cn('md:hidden min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-bold flex items-center justify-center tnum',
                        it.id === 'actions' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200')}>
                        {it.badge}
                      </span>
                    )}
                    {sidebarCollapsed && it.badge != null && it.badge > 0 && (
                      <span className="hidden md:block absolute top-1.5 right-1.5 size-2 rounded-full bg-amber-500 border border-white" />
                    )}

                    {/* Tooltip for collapsed state */}
                    {sidebarCollapsed && (
                      <div className="hidden md:flex absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {it.label}
                        {it.badge != null && it.badge > 0 && <span className="ml-2 px-1 py-0.5 bg-slate-700 rounded text-[9px]">{it.badge}</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2.5 pb-2 space-y-0.5 border-t border-slate-200 pt-3 flex flex-col items-center">
        <button onClick={() => pushToast('info', 'Settings', 'Property configuration is admin-managed in this demo.')}
          className={cn("w-full h-9 rounded-lg flex items-center text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors relative group", sidebarCollapsed ? "md:px-0 md:justify-center px-2.5 gap-2.5" : "px-2.5 gap-2.5")}>
          <Settings className="size-4 shrink-0 text-slate-400" />
          <span className={cn(sidebarCollapsed && "md:hidden")}>Settings</span>
          {sidebarCollapsed && (
            <div className="hidden md:flex absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Settings
            </div>
          )}
        </button>
        <button onClick={() => pushToast('info', 'Help & playbooks', 'Operational runbooks live in the knowledge base (demo).')}
          className={cn("w-full h-9 rounded-lg flex items-center text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors relative group", sidebarCollapsed ? "md:px-0 md:justify-center px-2.5 gap-2.5" : "px-2.5 gap-2.5")}>
          <HelpCircle className="size-4 shrink-0 text-slate-400" />
          <span className={cn(sidebarCollapsed && "md:hidden")}>Help</span>
          {sidebarCollapsed && (
            <div className="hidden md:flex absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Help
            </div>
          )}
        </button>
      </div>

      {/* User card */}
      <div className={cn("m-2.5 mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 transition-all overflow-hidden", sidebarCollapsed ? "md:p-2 md:flex md:justify-center" : "")}>
        <div className={cn("flex items-center gap-2.5", sidebarCollapsed ? "md:justify-center" : "")}>
          <Avatar name="Sarah Morgan" />
          <div className={cn("min-w-0 leading-tight", sidebarCollapsed ? "md:hidden" : "")}>
            <p className="text-[12.5px] font-semibold text-slate-900 truncate">Sarah Morgan</p>
            <p className="text-[10.5px] text-slate-500 truncate">General Manager</p>
          </div>
        </div>
        <div className={cn("mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between", sidebarCollapsed ? "md:hidden" : "")}>
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
