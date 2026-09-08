import { useMemo, useState } from 'react';
import {
  ArrowRight, BedDouble, Brain, CheckCircle2, DoorOpen, Droplets, MessageSquareQuote, Route,
  Sparkles, TriangleAlert, Waves, Wifi, Wrench, X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useApp } from '@/store/app';
import { AC_TASK, REVIEWS, type Review, type Task } from '@/data/model';
import { Badge, Btn, Progress, ScreenHeader, SectionHead, Tag } from '@/components/ui';
import { Highlighted } from './CommandCenter';

const FILTERS = ['All', 'Negative', 'Positive', 'Mixed', 'Facilities', 'Cleanliness', 'F&B', 'Service'];

const TASK_BY_REVIEW: Record<string, Task> = {
  'RV-1042': { ...AC_TASK },
  'RV-1041': {
    id: 'FNB-036', title: 'Log menu-win signal — seared scallops', dept: 'Food & Beverage', priority: 'Low',
    source: 'Guest Intelligence', assignee: 'Marco Ruiz', location: 'Azure Grill', createdAt: '09:26 AM',
    status: 'todo', origin: 'Sentiment Router · RV-1041', prediction: 'F&B aspect +0.88',
    action: 'Tag scallops as signature dish in menu engineering; brief FOH on upsell script.',
  },
  'RV-1039': {
    id: 'FD-022', title: 'Log recovery play — concierge gesture', dept: 'Front Desk', priority: 'Low',
    source: 'Guest Intelligence', assignee: 'Priya Nair', location: 'Front Desk', createdAt: '09:26 AM',
    status: 'todo', origin: 'Sentiment Router · RV-1039', prediction: 'Service aspect +0.82',
    action: 'Add late-check-in → concierge gesture to service recovery playbook.',
  },
  'RV-1038': {
    id: 'ENG-092', title: 'Check Tower B AP load — floors 3–4', dept: 'Engineering', priority: 'Medium',
    source: 'Guest Intelligence', assignee: 'Daniel Osei', location: 'Tower B', createdAt: '09:26 AM',
    status: 'todo', origin: 'Sentiment Router · RV-1038', prediction: 'Connectivity aspect −0.58 · 3rd complaint this week',
    action: 'Survey AP capacity floors 3–4; rebalance channels before corporate block arrives.',
  },
};

const SENT_SEV: Record<string, 'crit' | 'warn' | 'ok' | 'info'> = { Negative: 'crit', Positive: 'ok', Mixed: 'warn' };

function RoomModal({ room, onClose }: { room: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-[420px] surface p-5 animate-pop" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="size-9 rounded-lg border border-sky-200 bg-sky-50 flex items-center justify-center"><DoorOpen className="size-4.5 text-sky-600" /></span>
            <div>
              <p className="text-[15px] font-bold text-slate-900">Room {room}</p>
              <p className="text-[11px] text-slate-600">Ocean View King · Floor 3 · Tower B</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X className="size-4" /></button>
        </div>
        <div className="space-y-2 text-[12px]">
          {[
            { l: 'Current guest', v: 'G-8832 · checkout today 11:00', ok: true },
            { l: 'Next check-in', v: 'Today 15:00 · G-9104 · 3 nights', ok: false },
            { l: 'AC unit', v: 'Split DX · installed 2019 · serviced 6 mo ago', ok: false },
            { l: 'IoT vibration sensor', v: 'Alert 2 h ago · 2.4σ above baseline', ok: false },
            { l: 'Water-damage exposure', v: 'Bathroom adjacency — resolve leak before 15:00', ok: false },
          ].map((r, i) => (
            <div key={i} className="flex justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-slate-600">{r.l}</span>
              <span className={cn('font-semibold text-right', r.ok ? 'text-slate-900' : 'text-amber-600')}>{r.v}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800">
          Inspection window: 11:30–13:30 (post-checkout, pre-clean sealing). Task OPS-104 aligns with this window.
        </div>
      </div>
    </div>
  );
}

export function GuestIntelligence() {
  const { addTask, hasTask, pushToast, navigate, resolvedReviews, resolveReview } = useApp();
  const [filter, setFilter] = useState('All');
  const [selId, setSelId] = useState('RV-1042');
  const [roomView, setRoomView] = useState(false);

  const list = useMemo(() => REVIEWS.filter(r =>
    filter === 'All' ? true : ['Negative', 'Positive', 'Mixed'].includes(filter) ? r.sentiment === filter : r.aspect === filter), [filter]);
  const sel: Review = REVIEWS.find(r => r.id === selId) ?? REVIEWS[0];
  const selTask = TASK_BY_REVIEW[sel.id];
  const taskExists = selTask ? hasTask(selTask.id) : false;
  const negCount = REVIEWS.filter(r => r.sentiment === 'Negative' && !resolvedReviews.has(r.id)).length;

  const createTask = () => {
    if (!selTask) return;
    if (taskExists) { navigate('tasks'); return; }
    addTask(selTask);
    pushToast('success', `${selTask.id} created`, `Routed to ${selTask.dept} · auto-assigned to ${selTask.assignee}.`);
  };

  return (
    <div className="p-6 max-w-[1560px] mx-auto">
      <ScreenHeader
        title="Guest Intelligence"
        sub="Turn guest feedback into operational action."
        right={
          <>
            <Tag><MessageSquareQuote className="size-3 mr-1.5 text-sky-500" /><b className="text-slate-900 tnum">{REVIEWS.length}</b>&nbsp;reviews (24 h)</Tag>
            <Tag><TriangleAlert className="size-3 mr-1.5 text-rose-500" /><b className="text-slate-900 tnum">{negCount}</b>&nbsp;needs action</Tag>
          </>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('h-7 px-3 rounded-full border text-[11.5px] font-semibold transition-all',
              filter === f ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm' : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 bg-white')}>
            {f}
            {f === 'Negative' && <span className="ml-1.5 tnum text-[10px] opacity-80">{REVIEWS.filter(r => r.sentiment === 'Negative').length}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Feed */}
        <div className="col-span-12 xl:col-span-5 space-y-2.5">
          <SectionHead title="Guest review feed" sub="Unified: post-stay · in-stay app · public channels" />
          {list.map((r, i) => {
            const active = r.id === selId;
            const resolved = resolvedReviews.has(r.id);
            return (
              <button key={r.id} onClick={() => setSelId(r.id)}
                className={cn('w-full text-left rounded-xl border p-3.5 transition-all animate-rise',
                  active ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm', resolved && 'opacity-60')}
                style={{ animationDelay: `${i * 45}ms` }}>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="font-mono text-[10px] text-slate-500">{r.guest}</span>
                  <Tag>Room {r.room}</Tag>
                  <Badge sev={SENT_SEV[r.sentiment]}>{r.sentiment}</Badge>
                  <Tag>{r.aspect}</Tag>
                  <Badge sev={r.priority === 'High' ? 'crit' : r.priority === 'Medium' ? 'warn' : 'neutral'} className="ml-auto">{r.priority}</Badge>
                </div>
                <p className="text-[12.5px] text-slate-800 leading-relaxed line-clamp-2">"{r.text}"</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                  <span>{r.source}</span><span>·</span><span>{r.date}</span>
                  {resolved && <span className="ml-auto flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="size-3" /> Resolved</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* AI Sentiment analysis */}
        <div className="col-span-12 xl:col-span-7">
          <div className="surface p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <SectionHead title="AI sentiment analysis" sub={`${sel.id} · ${sel.source} · ${sel.date}`} />
              <span className="flex items-center gap-2 text-[11px] text-slate-600">
                Overall
                <span className={cn('text-[20px] font-bold tnum', sel.overall < -0.5 ? 'text-rose-600' : sel.overall < 0 ? 'text-amber-600' : 'text-emerald-600')}>
                  {sel.overall > 0 ? '+' : ''}{sel.overall.toFixed(2)}
                </span>
              </span>
            </div>

            <blockquote className="rounded-lg border border-slate-200 bg-slate-50 shadow-sm p-3.5 text-[14px] text-slate-800 leading-relaxed mb-4">
              "<Highlighted text={sel.text} marks={sel.highlights}
                markClass={sel.overall > 0 ? 'bg-emerald-100 text-emerald-800 rounded px-1 py-px font-semibold' : 'bg-rose-100 text-rose-800 rounded px-1 py-px font-semibold'} />"
            </blockquote>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-2.5">Aspect extraction</p>
                <div className="space-y-2.5">
                  {sel.aspects.map(a => (
                    <div key={a.label}>
                      <div className="flex items-center justify-between text-[11.5px] mb-1">
                        <span className="text-slate-600">{a.label}</span>
                        <span className="tnum">
                          <b className={a.score < -0.5 ? 'text-rose-600' : a.score < 0 ? 'text-amber-600' : 'text-emerald-600'}>
                            {a.score > 0 ? '+' : ''}{a.score.toFixed(2)}
                          </b>
                          <span className={cn('ml-2 text-[9.5px] font-bold uppercase', a.score < -0.5 ? 'text-rose-500' : a.score < 0 ? 'text-amber-500' : 'text-emerald-500')}>{a.tag}</span>
                        </span>
                      </div>
                      <Progress value={Math.abs(a.score) * 100} color={a.score < -0.5 ? '#F43F5E' : a.score < 0 ? '#F59E0B' : '#10B981'} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-2.5">Detected signals</p>
                <div className="flex flex-wrap gap-1.5">
                  {sel.highlights.map((h, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-rose-200 bg-rose-50 text-[11px] font-semibold text-rose-700">
                      {h === 'leaking' ? <Droplets className="size-3" /> : h === 'Wi-Fi dropped' ? <Wifi className="size-3" /> : <Waves className="size-3" />}
                      "{h}"
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-600 shadow-sm">
                    <BedDouble className="size-3" /> Room {sel.room}
                  </span>
                </div>
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 shadow-sm">
                  <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Brain className="size-3 text-emerald-500" /> AI reasoning</p>
                  <p className="text-[11.5px] text-slate-800 leading-relaxed">{sel.reasoning}</p>
                </div>
              </div>
            </div>

            {/* Routing */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-3.5">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-3">
                <span className="flex items-center gap-2 text-[11.5px]"><Route className="size-3.5 text-sky-500" /><span className="text-slate-500 uppercase font-bold text-[9.5px] tracking-wider">Destination</span><b className="text-slate-900">{sel.destination}</b></span>
                <span className="flex items-center gap-2 text-[11.5px]"><TriangleAlert className="size-3.5 text-rose-500" /><span className="text-slate-500 uppercase font-bold text-[9.5px] tracking-wider">Priority</span>
                  <Badge sev={sel.priority === 'High' ? 'crit' : sel.priority === 'Medium' ? 'warn' : 'neutral'}>{sel.priority}</Badge></span>
                <span className="ml-auto flex items-center gap-1.5 text-[10.5px] text-slate-500"><Sparkles className="size-3 text-emerald-500" /> routed in 0.4 s · rules v18</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 shadow-sm p-3 flex items-start gap-2.5 mb-3">
                <Wrench className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Generated task</p>
                  <p className="text-[12.5px] font-semibold text-slate-900">"{sel.genTask}"</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Btn variant="primary" size="sm" onClick={createTask} disabled={resolvedReviews.has(sel.id)}>
                  {taskExists ? <>View on task board <ArrowRight className="size-3.5" /></> : 'Create task'}
                </Btn>
                <Btn variant="outline" size="sm" onClick={() => setRoomView(true)}><DoorOpen className="size-3.5" /> View room</Btn>
                <Btn variant="ghost" size="sm" className="ml-auto"
                  onClick={() => {
                    if (resolvedReviews.has(sel.id)) return;
                    resolveReview(sel.id);
                    pushToast('success', `${sel.id} marked resolved`, 'Feedback loop recorded for model learning.');
                  }}>
                  <CheckCircle2 className="size-3.5" /> {resolvedReviews.has(sel.id) ? 'Resolved' : 'Mark resolved'}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
      {roomView && <RoomModal room={sel.room} onClose={() => setRoomView(false)} />}
    </div>
  );
}
