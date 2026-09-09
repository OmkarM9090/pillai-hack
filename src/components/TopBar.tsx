import { useEffect, useState } from 'react';
import { Bell, ChevronDown, MapPin, Search, Sparkles, Menu } from 'lucide-react';
import { useApp } from '@/store/app';
import { DATE_STR } from '@/data/model';
import { Avatar, Btn } from './ui';

function useClock() {
  const [t, setT] = useState(() => new Date(2026, 8, 8, 9, 17, 0));
  useEffect(() => {
    const id = setInterval(() => setT(p => new Date(p.getTime() + 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function TopBar() {
  const { setAssistantOpen, assistantOpen, pendingCount, navigate, setMobileMenuOpen } = useApp();
  const t = useClock();
  let h = t.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  const clock = `${String(h).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')} ${ap}`;

  return (
    <header className="h-16 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur flex items-center gap-3 px-5 sticky top-0 z-30">
      <button className="md:hidden flex shrink-0 items-center justify-center size-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(true)}>
        <Menu className="size-4" />
      </button>

      <button className="flex items-center gap-2 h-9 pl-2.5 pr-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-colors">
        <MapPin className="size-3.5 text-emerald-500" />
        <span className="text-[13px] font-semibold text-slate-900">Azure Bay Resort</span>
        <ChevronDown className="size-3.5 text-slate-400" />
      </button>

      <div className="hidden xl:flex items-center gap-2 text-[12px] text-slate-500">
        <span className="font-medium">{DATE_STR}</span>
        <span className="text-slate-300">·</span>
        <span className="tnum font-semibold text-slate-900">{clock}</span>
      </div>

      <span className="hidden lg:inline-flex items-center gap-1.5 h-[22px] px-2 rounded-md bg-emerald-50 border border-emerald-200 text-[10.5px] font-bold tracking-wide text-emerald-700 uppercase">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse-dot" /> Operational
      </span>

      <div className="flex-1" />

      <div className="hidden md:flex items-center gap-2 h-9 w-[220px] px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 transition-colors cursor-text">
        <Search className="size-3.5" />
        <span className="text-[12.5px]">Search rooms, tasks…</span>
        <span className="ml-auto text-[10px] font-mono border border-slate-200 rounded px-1 py-px bg-white">⌘K</span>
      </div>

      <Btn variant="primary" size="md" onClick={() => setAssistantOpen(!assistantOpen)}>
        <Sparkles className="size-4" strokeWidth={2.2} />
        Ask Resort AI
      </Btn>

      <button onClick={() => navigate('actions')} className="relative size-9 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center" title="Notifications">
        <Bell className="size-4 text-slate-600" />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 size-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center tnum">{pendingCount}</span>
        )}
      </button>

      <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
        <Avatar name="Sarah Morgan" />
        <div className="hidden lg:block leading-tight">
          <p className="text-[12.5px] font-semibold text-slate-900">Sarah Morgan</p>
          <p className="text-[10.5px] text-slate-500">General Manager</p>
        </div>
      </div>
    </header>
  );
}
