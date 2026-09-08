import { useMemo, useState } from 'react';
import {
  ArrowRight, BadgeCheck, Boxes, CheckCircle2, ChevronLeft, ChevronRight, CircleDot, MapPin,
  Plus, Sparkles, X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useApp } from '@/store/app';
import { ACCURACY_7D, TASK_COLS, type Priority, type Task, type TaskStatus } from '@/data/model';
import { Avatar, Badge, Btn, EmptyState, ScreenHeader, SectionHead, Tag } from '@/components/ui';
import { LineChart } from '@/components/charts';

const PRIO: Record<Priority, { text: string; bar: string }> = {
  Critical: { text: 'text-rose-600', bar: 'bg-rose-500' },
  High: { text: 'text-amber-600', bar: 'bg-amber-500' },
  Medium: { text: 'text-sky-600', bar: 'bg-sky-500' },
  Low: { text: 'text-slate-500', bar: 'bg-slate-400' },
};

const NEXT: Record<TaskStatus, TaskStatus | null> = { todo: 'progress', progress: 'verify', verify: 'done', done: null };
const NEXT_LABEL: Record<TaskStatus, string | null> = { todo: 'Start task', progress: 'Send to verifying', verify: 'Mark complete', done: null };

function TaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { moveTask, pushToast } = useApp();
  const next = NEXT[task.status];
  return (
    <div onClick={onOpen}
      className="relative rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all p-3 pl-3.5 cursor-pointer group animate-rise shadow-sm">
      <span className={cn('absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r', PRIO[task.priority].bar)} />
      <div className="flex items-center gap-1.5 text-[10px] mb-1.5">
        <span className="font-mono text-slate-500">{task.id}</span>
        <span className="text-slate-300">·</span>
        <span className={cn('font-bold uppercase tracking-wide', PRIO[task.priority].text)}>{task.priority}</span>
        <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-500"><CircleDot className="size-3" /></span>
      </div>
      <p className="text-[12.5px] font-semibold text-slate-900 leading-snug">{task.title}</p>
      <div className="flex items-center gap-2 mt-2 text-[10.5px] text-slate-600">
        <Avatar name={task.assignee === 'Unassigned' ? '?' : task.assignee} size="sm" />
        <span className="truncate">{task.assignee}</span>
        <span className="flex items-center gap-0.5 text-slate-500"><MapPin className="size-2.5" />{task.location}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
        <Tag className="h-[20px] text-[9.5px]">{task.dept}</Tag>
        <span className="text-[9.5px] text-slate-500 ml-auto">{task.createdAt}</span>
        {next && (
          <button
            onClick={e => {
              e.stopPropagation();
              moveTask(task.id, next);
              pushToast('info', `${task.id} → ${TASK_COLS.find(c => c.id === next)?.label}`, task.title);
            }}
            title="Advance status"
            className="size-5 rounded border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:border-emerald-300 flex items-center justify-center transition-colors shadow-sm">
            <ChevronRight className="size-3" />
          </button>
        )}
      </div>
      <p className="text-[9.5px] text-slate-500 mt-1.5">Source: {task.source}</p>
    </div>
  );
}

function TaskPanel({ task, onClose }: { task: Task; onClose: () => void }) {
  const { moveTask, pushToast } = useApp();
  const next = NEXT[task.status];
  return (
    <div className="fixed inset-y-0 right-0 w-[400px] z-[70] bg-white border-l border-slate-200 shadow-2xl shadow-slate-300/60 animate-slide-left flex flex-col">
      <div className="p-5 border-b border-slate-200 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] text-slate-500 uppercase mb-1">Task details</p>
          <h3 className="text-[16px] font-bold text-slate-900 leading-snug">{task.title}</h3>
          <p className="font-mono text-[11px] text-slate-500 mt-1">{task.id} · created {task.createdAt}</p>
        </div>
        <button onClick={onClose} className="size-8 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Status rail */}
        <div className="grid grid-cols-4 gap-1">
          {TASK_COLS.map((c, i) => {
            const curIdx = TASK_COLS.findIndex(x => x.id === task.status);
            const pass = i <= curIdx;
            return (
              <div key={c.id} className={cn('rounded-md border py-1.5 text-center text-[8.5px] font-bold uppercase tracking-wide transition-colors',
                pass ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 bg-slate-50/50')}>
                {c.label}
              </div>
            );
          })}
        </div>

        {[
          { l: 'Origin', v: task.origin },
          { l: 'Prediction', v: task.prediction },
          { l: 'Action', v: task.action },
          { l: 'Assigned', v: task.assignee },
          { l: 'Location', v: task.location },
          { l: 'Source', v: task.source },
        ].map(f => (
          <div key={f.l} className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">{f.l}</p>
            <p className="text-[12.5px] text-slate-900 leading-relaxed">{f.v}</p>
          </div>
        ))}

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-between shadow-sm">
          <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">Priority</span>
          <Badge sev={task.priority === 'Critical' ? 'crit' : task.priority === 'High' ? 'warn' : 'info'}>{task.priority}</Badge>
        </div>

        <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-[11px] text-sky-800 leading-relaxed shadow-sm">
          <span className="font-bold text-sky-900">Traceability: </span>
          this task was generated by an approved AI decision. Completion data feeds the accuracy model (PREDICT → ACT → LEARN).
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 flex gap-2">
        {next ? (
          <Btn variant="primary" className="flex-1" onClick={() => {
            moveTask(task.id, next);
            pushToast('success', `${task.id} updated`, `Status → ${TASK_COLS.find(c => c.id === next)?.label}.`);
            if (next === 'done') onClose();
          }}>
            {task.status === 'verify' ? <CheckCircle2 className="size-4" /> : <ArrowRight className="size-4" />}
            {NEXT_LABEL[task.status]}
          </Btn>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12.5px] font-bold">
            <BadgeCheck className="size-4" /> Completed · verified
          </div>
        )}
        <Btn variant="outline" onClick={onClose}>Close</Btn>
      </div>
    </div>
  );
}

export function TaskBoard() {
  const { tasks, navigate, pushToast } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const depts = useMemo(() => ['All', ...Array.from(new Set(tasks.map(t => t.dept)))], [tasks]);
  const visible = filter === 'All' ? tasks : tasks.filter(t => t.dept === filter);
  const selectedTask = tasks.find(t => t.id === selected);

  const accuracy = [
    { m: 'Housekeeping delay', p: '1.4 hr', a: '1.2 hr', e: '14.3%', ep: 14.3 },
    { m: 'Dining wait', p: '22 min', a: '19 min', e: '13.6%', ep: 13.6 },
    { m: 'Burnout risk', p: '84%', a: '79%', e: '6.0%', ep: 6 },
  ];

  return (
    <div className="p-6 max-w-[1560px] mx-auto">
      <ScreenHeader
        title="Operations Task Board"
        sub="Turn approved decisions into measurable execution."
        right={
          <>
            <Tag><Boxes className="size-3 mr-1.5 text-sky-500" />Open <b className="text-slate-900 ml-1 tnum">{tasks.filter(t => t.status !== 'done').length}</b></Tag>
            <Tag>Critical <b className="text-rose-600 ml-1 tnum">{tasks.filter(t => t.priority === 'Critical' && t.status !== 'done').length}</b></Tag>
            <Btn variant="outline" size="sm" onClick={() => pushToast('info', 'Manual task', 'Quick-add is disabled in this demo — tasks originate from Sense / Decide flows.')}>
              <Plus className="size-3.5" /> New task
            </Btn>
          </>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {depts.map(d => (
          <button key={d} onClick={() => setFilter(d)}
            className={cn('h-7 px-3 rounded-full border text-[11.5px] font-semibold transition-all',
              filter === d ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm' : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 bg-white')}>
            {d}
          </button>
        ))}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {TASK_COLS.map(col => {
          const colTasks = visible.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col min-h-[300px]">
              <div className="flex items-center gap-2 mb-2.5 px-1">
                <span className={cn('size-2 rounded-full', col.id === 'done' ? 'bg-emerald-400' : col.id === 'verify' ? 'bg-sky-400' : col.id === 'progress' ? 'bg-amber-400' : 'bg-slate-400')} />
                <p className="text-[10.5px] font-bold tracking-[0.14em] text-slate-500 uppercase">{col.label}</p>
                <span className="ml-auto text-[10.5px] font-bold tnum text-slate-600 bg-white border border-slate-200 shadow-sm rounded-md px-1.5 py-px">{colTasks.length}</span>
              </div>
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 p-2 space-y-2.5">
                {colTasks.length === 0 ? (
                  <EmptyState icon={<CheckCircle2 className="size-5" />} title="All operational queues are clear" sub="New tasks appear from approved actions" />
                ) : colTasks.map(t => <TaskCard key={t.id} task={t} onOpen={() => setSelected(t.id)} />)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prediction accuracy */}
      <div className="flex items-end justify-between mb-3">
        <SectionHead title="Prediction accuracy" sub="Yesterday's forecasts vs measured outcomes — the learning loop closes here" />
        <Badge sev="ok">MAPE 11.3% · improving</Badge>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-5 space-y-3">
          {accuracy.map((a, i) => (
            <div key={i} className="surface p-3.5 animate-rise shadow-sm" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{a.m}</p>
                <span className={cn('text-[11px] font-bold tnum', a.ep > 10 ? 'text-amber-600' : 'text-emerald-600')}>error {a.e}</span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[9.5px] text-slate-500 uppercase font-bold">Predicted</p>
                  <p className="text-[15px] font-bold text-sky-600 tnum">{a.p}</p>
                </div>
                <ChevronLeft className="size-3.5 text-slate-400 rotate-180" />
                <div>
                  <p className="text-[9.5px] text-slate-500 uppercase font-bold">Actual</p>
                  <p className="text-[15px] font-bold text-emerald-600 tnum">{a.a}</p>
                </div>
                <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden ml-2">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(12, 100 - a.ep)}%`, background: a.ep > 10 ? '#F59E0B' : '#10B981' }} />
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-slate-200 bg-slate-50 shadow-sm p-3 text-[11px] text-slate-600 leading-relaxed flex gap-2.5">
            <Sparkles className="size-4 text-emerald-500 shrink-0 mt-0.5" />
            Errors feed nightly retraining (02:00 UTC). Burnout model residual −5 pts → threshold recalibration scheduled in v2.4.2.
          </div>
        </div>
        <div className="col-span-12 xl:col-span-7">
          <div className="surface p-4 h-full shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <SectionHead title="Prediction accuracy — last 7 days" />
              <Tag>HK delay (min / turnover)</Tag>
            </div>
            <LineChart
              height={200}
              labels={ACCURACY_7D.labels}
              legend
              series={[
                { data: ACCURACY_7D.predicted, color: '#0EA5E9', dashed: true, label: 'Predicted' },
                { data: ACCURACY_7D.actual, color: '#10B981', label: 'Actual' },
              ]}
              formatY={v => Math.round(v) + 'm'}
            />
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
              <span>Predict → Actual → Learn · model v2.4.1 · ensemble of 14 predictors</span>
              <button onClick={() => navigate('accuracy')} className="text-emerald-600 font-semibold flex items-center gap-0.5 hover:text-emerald-700">Open feedback studio <ArrowRight className="size-3" /></button>
            </div>
          </div>
        </div>
      </div>

      {selectedTask && <TaskPanel task={selectedTask} onClose={() => setSelected(null)} />}
      {selectedTask && <div className="fixed inset-0 z-[65] bg-black/40" onClick={() => setSelected(null)} />}
    </div>
  );
}
