import { useState } from 'react';
import { BadgeCheck, CalendarDays, CircleAlert, Clock3, Cpu, Download, Filter, Sparkles, TriangleAlert, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useApp } from '@/store/app';
import { Badge, Btn, Progress, ScreenHeader, SectionHead, Tag } from '@/components/ui';
import { ScheduleGrid, ScheduleLegend, STAFF } from '@/components/ScheduleGrid';

const WEEK = [
  { d: 'Mon 7', occ: 88 }, { d: 'Tue 8', occ: 95, today: true }, { d: 'Wed 9', occ: 92 }, { d: 'Thu 10', occ: 86 },
  { d: 'Fri 11', occ: 79 }, { d: 'Sat 12', occ: 93 }, { d: 'Sun 13', occ: 84 },
];

const COVERAGE = [
  { dept: 'Housekeeping', need: 34, have: 26, xt: 6 },
  { dept: 'Front Desk', need: 6, have: 5, xt: 2 },
  { dept: 'F&B', need: 14, have: 11, xt: 3 },
  { dept: 'Spa', need: 4, have: 6, xt: 0 },
  { dept: 'Engineering', need: 3, have: 3, xt: 0 },
];

export function StaffScheduler() {
  const { actions, navigate, pushToast } = useApp();
  const optimized = ['approved', 'queued'].includes(actions.find(a => a.id === 'ACT-2048')?.status ?? '');
  const [view, setView] = useState<'before' | 'after'>(optimized ? 'after' : 'before');
  const after = view === 'after';

  return (
    <div className="p-6 max-w-[1560px] mx-auto">
      <ScreenHeader
        title="Staff Scheduler"
        sub="Demand-driven rostering with cross-training optimization."
        right={
          <>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {(['before', 'after'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={cn('h-8 px-3.5 text-[11.5px] font-bold transition-colors',
                    view === v ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:text-slate-900 bg-slate-50')}>
                  {v === 'before' ? 'Current plan' : 'Optimized'}
                </button>
              ))}
            </div>
            <Btn variant="outline" size="sm" onClick={() => pushToast('info', 'Export started', 'Roster PDF will arrive in your inbox.')}><Download className="size-3.5" /> Export</Btn>
            <Btn variant="primary" size="sm" onClick={() => navigate('actions')}><Sparkles className="size-3.5" /> AI optimize</Btn>
          </>
        }
      />

      {/* Week strip */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-4">
        {WEEK.map((d, i) => (
          <div key={i} className={cn('rounded-lg border p-2.5 text-center transition-colors cursor-default',
            d.today ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm')}>
            <p className={cn('text-[10px] font-bold uppercase tracking-wider', d.today ? 'text-emerald-700' : 'text-slate-500')}>{d.d}</p>
            <p className={cn('text-[15px] font-bold tnum mt-0.5', d.occ >= 90 ? 'text-amber-600' : 'text-slate-900')}>{d.occ}%</p>
            <p className="text-[9px] text-slate-500">occupancy</p>
            {d.today && <Badge sev="ok" className="mt-1 h-[16px] text-[8.5px] px-1">Tonight</Badge>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <SectionHead title="Shift board — Tuesday, Sep 8" sub={`${STAFF.length} employees rostered · XT = cross-trained certified`} />
            <Tag><Filter className="size-3 mr-1.5" /> All departments</Tag>
          </div>
          <ScheduleGrid after={after} />
          <ScheduleLegend />
          <ScheduleLegend />
          <div className="surface-flat p-3 flex items-center gap-3 text-[11px] text-slate-600">
            <Clock3 className="size-4 text-slate-500 shrink-0" />
            {after
              ? 'Optimized plan: 3 Spa employees (cross-trained L2) support FD/F&B 14:00–22:00. Labor cost $8,420 (+4.2%) · service risk LOW.'
              : 'Current plan: housekeeping coverage 78% with a −3 FTE gap 14:00–22:00 against 190-room demand. Service risk HIGH at peak.'}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="surface p-4">
            <SectionHead title="Coverage vs demand" sub="Tonight 14:00–22:00 window" className="mb-3" />
            <div className="space-y-3">
              {COVERAGE.map(c => {
                const eff = c.have + (after ? c.xt : 0);
                const pct = Math.min(100, (eff / c.need) * 100);
                const short = eff < c.need;
                return (
                  <div key={c.dept}>
                    <div className="flex items-center justify-between text-[11.5px] mb-1">
                      <span className="text-slate-600 font-medium">{c.dept}</span>
                      <span className="tnum">
                        <b className={short ? 'text-rose-600' : 'text-emerald-600'}>{eff}</b>
                        <span className="text-slate-500"> / {c.need} FTE</span>
                      </span>
                    </div>
                    <Progress value={pct} color={short ? '#F43F5E' : '#10B981'} />
                    {c.xt > 0 && after && <p className="text-[9.5px] text-emerald-600 mt-1 tnum">+{c.xt} cross-trained applied</p>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface p-4 space-y-3">
            <SectionHead title="Roster alerts" />
            {[
              { icon: TriangleAlert, c: 'text-amber-500', t: 'Luis Vega approaches overtime (+1.5 hrs)', s: 'Fairness model suggests swap with D. Whitfield 18:00 block.' },
              { icon: CircleAlert, c: 'text-sky-500', t: 'Certification expiring: S. Kim — food handler', s: 'Renew by Sep 20 to keep XT → F&B eligibility.' },
              { icon: Users, c: 'text-emerald-500', t: 'Bench: 2 on-call attendants available', s: 'Activation cost $220/shift · ETA 45 min.' },
            ].map((a, i) => (
              <div key={i} className="flex gap-2.5">
                <a.icon className={cn('size-4 shrink-0 mt-0.5', a.c)} />
                <div>
                  <p className="text-[12px] font-semibold text-slate-900 leading-snug">{a.t}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{a.s}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="surface p-4">
            <SectionHead title="Optimization status" className="mb-3" />
            <div className="flex items-center gap-3">
              <span className={cn('size-10 rounded-lg border flex items-center justify-center', optimized ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50')}>
                {optimized ? <BadgeCheck className="size-5 text-emerald-600" /> : <Cpu className="size-5 text-amber-600" />}
              </span>
              <div className="text-[11.5px] leading-relaxed">
                {optimized ? (
                  <p className="text-emerald-800"><b className="text-emerald-700">ACT-2048 applied</b> — schedule synced to payroll & timeclock at 09:22. Audit ref AUD-5521.</p>
                ) : (
                  <p className="text-slate-600">Optimization ready — <b className="text-slate-900">ACT-2048</b> closes the housekeeping gap. Requires GM approval to apply.</p>
                )}
              </div>
            </div>
            {!optimized && <Btn variant="primary" size="sm" className="w-full mt-3" onClick={() => navigate('actions')}>Review in Action Plan</Btn>}
          </div>

          <div className="surface-flat p-3 flex items-center gap-2.5 text-[10.5px] text-slate-500">
            <CalendarDays className="size-3.5" />
            Next schedule generation: Wed 06:00 · rolling 7-day horizon · constraints: union rules v3, minors policy, XT matrix r12.
          </div>
        </div>
      </div>
    </div>
  );
}
