import { useState } from 'react';
import {
  ArrowRight, BadgeCheck, CircleDollarSign, Clock3, Cpu, GitBranch, ListChecks,
  RotateCcw, ShieldAlert, Sparkles, Target, TriangleAlert, X, Zap,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useApp } from '@/store/app';
import type { ActionItem } from '@/data/model';
import { Badge, Btn, ScreenHeader, SectionHead, Tag } from '@/components/ui';
import { ScheduleGrid, ScheduleLegend } from '@/components/ScheduleGrid';

function StatusRail({ action }: { action: ActionItem }) {
  const done = action.status === 'approved' || action.status === 'queued';
  if (action.status === 'rejected') {
    return <Badge sev="crit">Rejected · logged to audit</Badge>;
  }
  if (!done) {
    return (
      <Badge sev={action.status === 'manual' ? 'warn' : 'info'}>
        {action.status === 'manual' ? 'Manual review required' : 'AI recommendation · awaiting approval'}
      </Badge>
    );
  }
  return (
    <div className="flex items-center gap-0 text-[10px] font-bold">
      {[
        { t: 'AI recommendation', state: 'done' },
        { t: `Approved · ${action.approvedAt ?? ''}`, state: 'done', who: action.approvedBy },
        { t: action.status === 'queued' ? 'Execution queued' : 'Queueing…', state: action.status === 'queued' ? 'done' : 'active' },
      ].map((s, i) => (
        <span key={i} className="flex items-center">
          {i > 0 && <span className="w-6 h-px bg-slate-200 mx-1" />}
          <span className={cn('flex items-center gap-1.5 px-2 py-1 rounded-md border',
            s.state === 'done' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-sky-200 bg-sky-50 text-sky-700')}>
            {s.state === 'done' ? <BadgeCheck className="size-3" /> : <span className="size-3 rounded-full border-2 border-current border-t-transparent animate-spin" />}
            {s.t}
            {s.who && <span className="text-emerald-600 font-semibold">· {s.who}</span>}
          </span>
        </span>
      ))}
    </div>
  );
}

function ModifyModal({ action, onClose }: { action: ActionItem; onClose: () => void }) {
  const { modifyAndApprove } = useApp();
  const [count, setCount] = useState(action.id === 'ACT-2048' ? 3 : action.id === 'ACT-2049' ? 40 : 45);
  const [edge, setEdge] = useState('Evening peak (14:00–22:00)');
  const label = action.id === 'ACT-2048' ? 'Cross-trained staff' : action.id === 'ACT-2049' ? 'Salmon order (kg)' : 'Extension (min)';
  const note = `${label}: ${count}${action.id === 'ACT-2049' ? ' kg' : action.id === 'ACT-2051' ? ' min' : ''} · ${edge}`;
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-[440px] surface p-5 animate-pop" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[14px] font-bold text-slate-900">Modify recommendation</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X className="size-4" /></button>
        </div>
        <p className="text-[11px] font-mono text-slate-500 mb-4">{action.id} · {action.title}</p>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1.5">
              <span className="text-slate-500 uppercase tracking-wider">{label}</span>
              <span className="text-slate-900 tnum">{count}{action.id === 'ACT-2049' ? ' kg' : action.id === 'ACT-2051' ? ' min' : ''}</span>
            </div>
            <input type="range" min={action.id === 'ACT-2048' ? 2 : action.id === 'ACT-2049' ? 20 : 15} max={action.id === 'ACT-2048' ? 6 : action.id === 'ACT-2049' ? 60 : 90}
              value={count} onChange={e => setCount(+e.target.value)}
              className="w-full" style={{ '--fill': `${(count / (action.id === 'ACT-2048' ? 6 : action.id === 'ACT-2049' ? 60 : 90)) * 100}%` } as React.CSSProperties} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Window</p>
            <div className="grid grid-cols-2 gap-2">
              {['Evening peak (14:00–22:00)', 'Extended (12:00–24:00)'].map(o => (
                <button key={o} onClick={() => setEdge(o)}
                  className={cn('h-9 rounded-lg border text-[11px] font-semibold transition-all',
                    edge === o ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900">Impact recheck: </span>
            engine validates modified parameters before queueing. Deviation log → decision audit.
          </div>
          <div className="flex gap-2">
            <Btn variant="primary" className="flex-1" onClick={() => { modifyAndApprove(action.id, note); onClose(); }}>Approve with modifications</Btn>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ action, index }: { action: ActionItem; index: number }) {
  const { approveAction, rejectAction, restoreAction } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [modify, setModify] = useState(false);
  const done = action.status === 'approved' || action.status === 'queued';
  const rejected = action.status === 'rejected';
  const manual = action.status === 'manual';

  return (
    <div className={cn('rounded-xl border p-4 transition-all animate-rise',
      done ? 'border-emerald-200 bg-emerald-50/50' : rejected ? 'border-slate-200 opacity-60 bg-slate-50' : manual ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm')}
      style={{ animationDelay: `${index * 70}ms` }}>
      <div className="flex flex-wrap items-center gap-2 mb-2.5">
        <span className="font-mono text-[10px] text-slate-500">{action.num}</span>
        <span className="font-mono text-[10px] text-slate-500">{action.id}</span>
        <Tag>{action.dept}</Tag>
        {action.priority === 'HIGH' && <Badge sev="crit">High priority</Badge>}
        <span className="ml-auto"><StatusRail action={action} /></span>
      </div>

      <h4 className="text-[15px] font-bold text-slate-900">{action.title}</h4>
      <p className="text-[12.5px] text-slate-600 mt-1 leading-relaxed">{action.desc}</p>

      {manual && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 flex items-center gap-2">
          <TriangleAlert className="size-4 text-amber-500 shrink-0" />
          <p className="text-[11.5px] text-amber-800">AI recommendation requires review — confidence <b className="tnum">71%</b> is below the 85% auto-approval threshold.</p>
        </div>
      )}

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
        <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Why</p>
        <p className="text-[12px] text-slate-800 leading-relaxed">{action.why}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
        {[
          { icon: Target, l: 'Impact', v: action.impact, c: 'text-emerald-600' },
          { icon: CircleDollarSign, l: 'Cost', v: action.cost, c: 'text-slate-900' },
          { icon: Zap, l: 'Confidence', v: `${action.confidence}%`, c: action.confidence >= 85 ? 'text-slate-900' : 'text-amber-600' },
          { icon: ShieldAlert, l: 'Risk', v: action.risk, c: action.risk === 'Low' ? 'text-slate-900' : 'text-amber-600' },
        ].map((m, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-2 shadow-sm">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><m.icon className="size-3" />{m.l}</p>
            <p className={cn('text-[11.5px] font-bold mt-1 leading-tight', m.c)}>{m.v}</p>
          </div>
        ))}
      </div>

      {action.detail && (expanded || done) && (
        <div className="mt-3 space-y-1.5 animate-fade-in">
          {action.detail.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-[11.5px] rounded-md bg-white border border-slate-100 px-2.5 py-1.5">
              <span className="text-slate-600">{d.label}</span>
              <span className="font-semibold text-slate-900 text-right">{d.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {done ? (
          <div className="flex-1 flex items-center gap-2 text-[11.5px] text-emerald-600">
            <BadgeCheck className="size-4" />
            Approved by {action.approvedBy} {action.approvedAt && `· ${action.approvedAt}`}
            {action.status === 'queued' && (
              <span className="ml-auto flex items-center gap-1.5 text-sky-600">
                <GitBranch className="size-3.5" /> task created → execution queue
              </span>
            )}
          </div>
        ) : rejected ? (
          <>
            <p className="text-[11.5px] text-mute flex-1">Rejected by Sarah Morgan · 09:24 AM · reason logged</p>
            <Btn size="sm" variant="ghost" onClick={() => restoreAction(action.id)}><RotateCcw className="size-3.5" /> Restore</Btn>
          </>
        ) : (
          <>
            <Btn size="sm" variant="primary" disabled={manual} onClick={() => approveAction(action.id)} title={manual ? 'Manual review — modify before approval' : ''}>
              Approve
            </Btn>
            <Btn size="sm" variant="outline" onClick={() => setModify(true)}>Modify</Btn>
            <Btn size="sm" variant="danger" onClick={() => rejectAction(action.id)}>Reject</Btn>
            {action.detail && (
              <Btn size="sm" variant="ghost" className="ml-auto" onClick={() => setExpanded(e => !e)}>
                {expanded ? 'Hide detail' : action.id === 'ACT-2049' ? 'Review PO' : 'Review'}
              </Btn>
            )}
          </>
        )}
      </div>
      {modify && <ModifyModal action={action} onClose={() => setModify(false)} />}
    </div>
  );
}

export function ActionPlan() {
  const { actions, navigate, staff } = useApp();
  const [view, setView] = useState<'before' | 'after'>('before');
  const staffAction = actions.find(a => a.id === 'ACT-2048');
  const optimized = staffAction ? ['approved', 'queued'].includes(staffAction.status) : false;
  const after = view === 'after';

  const metrics = after
    ? [
      { l: 'Labor cost', v: '$8,420', d: '+$340 vs base · within budget', c: 'text-slate-900' },
      { l: 'Staff coverage', v: '96%', d: '+18 pts vs current', c: 'text-emerald-600' },
      { l: 'Shift fairness', v: '91%', d: 'Deviation ≤ 1.5 hrs', c: 'text-slate-900' },
      { l: 'Service risk', v: 'LOW', d: 'vs HIGH before optimization', c: 'text-emerald-600' },
    ]
    : [
      { l: 'Labor cost', v: '$8,080', d: 'Base plan', c: 'text-slate-900' },
      { l: 'Staff coverage', v: '78%', d: 'HK shortfall 14:00–22:00', c: 'text-amber-600' },
      { l: 'Shift fairness', v: '91%', d: 'Deviation ≤ 1.5 hrs', c: 'text-slate-900' },
      { l: 'Service risk', v: 'HIGH', d: 'Capacity exceeded at peak', c: 'text-rose-600' },
    ];

  return (
    <div className="p-6 max-w-[1560px] mx-auto">
      <ScreenHeader
        title="AI Action Plan"
        sub="Review and control every AI-generated decision."
        right={
          <>
            <Tag><ListChecks className="size-3 mr-1.5 text-sky-500" /><b className="text-slate-900 tnum">3</b>&nbsp;recommendations</Tag>
            <Tag><TriangleAlert className="size-3 mr-1.5 text-rose-500" /><b className="text-slate-900 tnum">2</b>&nbsp;high priority</Tag>
            <Tag><Sparkles className="size-3 mr-1.5 text-emerald-500" /><b className="text-slate-900 tnum">92%</b>&nbsp;avg confidence</Tag>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* LEFT · queue */}
        <div className="col-span-12 xl:col-span-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <SectionHead title="AI action queue" sub="Human approval required for every high-impact decision" />
            <span className="font-mono text-[10.5px] text-slate-400">PLAN-0096 · generated 09:14</span>
          </div>
          {actions.map((a, i) => <ActionCard key={a.id} action={a} index={i} />)}
        </div>

        {/* RIGHT · staff allocation */}
        <div className="col-span-12 xl:col-span-6 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHead title="Staff allocation" sub="Tonight · 08:00 – 24:00 · cross-training overlay" />
            <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
              {(['before', 'after'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={cn('h-8 px-3.5 text-[11.5px] font-bold transition-colors',
                    view === v ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:text-slate-900 bg-transparent')}>
                  {v === 'before' ? 'Current plan' : optimized ? 'After approval' : 'After (projected)'}
                </button>
              ))}
            </div>
          </div>

          <ScheduleGrid staff={staff} after={after} />
          <ScheduleLegend />

          {after && !optimized && (
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 flex items-center gap-2 text-[11.5px] text-sky-800 animate-fade-in shadow-sm">
              <Cpu className="size-4 shrink-0" />
              Projected view — approve <span className="font-mono font-bold">ACT-2048</span> to apply this allocation to the live schedule.
              <Btn size="xs" variant="outline" className="ml-auto" onClick={() => navigate('scheduler')}>Open scheduler</Btn>
            </div>
          )}
          {after && optimized && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 flex items-center gap-2 text-[11.5px] text-emerald-800 animate-fade-in shadow-sm">
              <BadgeCheck className="size-4 shrink-0" />
              Applied — reassignment notices sent. Synced to payroll & timeclock (09:22).
              <Btn size="xs" variant="outline" className="ml-auto" onClick={() => navigate('tasks')}>View task <ArrowRight className="size-3" /></Btn>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.map((m, i) => (
              <div key={m.l} className="surface p-3.5 animate-rise" style={{ animationDelay: `${i * 55}ms` }}>
                <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-[0.12em]">{m.l}</p>
                <p className={cn('text-[19px] font-bold tnum mt-1', m.c)}>{m.v}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{m.d}</p>
              </div>
            ))}
          </div>

          <div className="surface-flat p-3.5 flex items-center gap-3 text-[11px] text-slate-600 shadow-sm">
            <Clock3 className="size-4 text-slate-400 shrink-0" />
            <p>Schedule lock at <b className="text-slate-900">13:45</b> — changes require duty manager co-sign. Fairness model flags overtime &gt; 2 hrs per employee.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
