import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bot, Flame, FlaskConical, Send, Sparkles, Timer, UtensilsCrossed, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useApp } from '@/store/app';
import { Btn } from './ui';

interface Msg { role: 'user' | 'ai'; text?: string; card?: CardKind }
type CardKind = 'surge' | 'bookings' | 'risk' | 'tonight' | 'fallback';

const SUGGESTED: { q: string; card: CardKind }[] = [
  { q: 'What happens if occupancy reaches 95%?', card: 'surge' },
  { q: 'Can we safely accept 20 more bookings?', card: 'bookings' },
  { q: 'Which department is at highest risk?', card: 'risk' },
  { q: 'What should I do before tonight?', card: 'tonight' },
];

function SurgeCard() {
  const { navigate, presetSurge, setAssistantOpen } = useApp();
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2.5 shadow-sm">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Simulation complete · SCN-312</p>
      <p className="text-[12px] text-slate-900 leading-relaxed">95% occupancy is expected to:</p>
      <ul className="space-y-1.5 text-[12px]">
        {[
          { icon: Timer, c: 'text-rose-500', t: 'Increase housekeeping delay to ', b: '1.4 hr' },
          { icon: UtensilsCrossed, c: 'text-amber-500', t: 'Increase dining wait to ', b: '22 min' },
          { icon: Flame, c: 'text-rose-500', t: 'Raise staff burnout risk to ', b: '84%' },
          { icon: FlaskConical, c: 'text-amber-500', t: 'Reduce salmon inventory to ', b: '~5 kg' },
        ].map((r, i) => (
          <li key={i} className="flex items-center gap-2 text-slate-600">
            <r.icon className={cn('size-3.5 shrink-0', r.c)} />
            <span>{r.t}<b className="text-slate-900 tnum">{r.b}</b></span>
          </li>
        ))}
      </ul>
      <div className="rounded-md bg-emerald-50 border border-emerald-200 p-2.5">
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Recommended action</p>
        <p className="text-[12px] text-slate-900 leading-relaxed">Reallocate 3 cross-trained employees and prepare a salmon replenishment order before the 18:00 peak.</p>
      </div>
      <div className="flex gap-2 pt-1">
        <Btn size="sm" variant="primary" onClick={() => { presetSurge(); setAssistantOpen(false); }}>
          Open simulation <ArrowRight className="size-3.5" />
        </Btn>
        <Btn size="sm" variant="outline" onClick={() => { navigate('actions'); setAssistantOpen(false); }}>View action plan</Btn>
      </div>
    </div>
  );
}

function BookingsCard() {
  const { navigate, setAssistantOpen } = useApp();
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2.5 shadow-sm">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Capacity check · 20 additional rooms</p>
      <p className="text-[12px] text-slate-900 leading-relaxed">
        Not without mitigation. Tonight's forecast is already <b className="tnum">95%</b> (190/200). Adding 20 rooms creates
        an overbooking exposure of <b className="text-rose-600 tnum">10 rooms</b> and pushes dining wait to
        <b className="text-rose-600 tnum"> ~34 min</b> with burnout at <b className="text-rose-600 tnum">91%</b>.
      </p>
      <p className="text-[12px] text-slate-600 leading-relaxed">
        Safe path: apply the <b className="text-slate-900">+$40 rate fence</b> and hold 4 rooms as walk-in buffer. Net revenue gain
        <b className="text-emerald-600 tnum"> +$1,840</b> with risk contained.
      </p>
      <div className="flex gap-2 pt-1">
        <Btn size="sm" variant="primary" onClick={() => { navigate('actions'); setAssistantOpen(false); }}>Review ACT-2050</Btn>
        <Btn size="sm" variant="outline" onClick={() => { navigate('sandbox'); setAssistantOpen(false); }}>Test in Sandbox</Btn>
      </div>
    </div>
  );
}

function RiskCard() {
  const rows = [
    { d: 'Housekeeping', v: 92, c: '#F43F5E' },
    { d: 'F&B', v: 74, c: '#F59E0B' },
    { d: 'Front Desk', v: 51, c: '#F59E0B' },
    { d: 'Engineering', v: 28, c: '#10B981' },
  ];
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2.5 shadow-sm">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department risk index · tonight</p>
      {rows.map(r => (
        <div key={r.d} className="flex items-center gap-2">
          <span className="w-24 text-[11.5px] text-slate-600">{r.d}</span>
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${r.v}%`, background: r.c }} />
          </div>
          <span className="text-[11px] font-bold tnum text-slate-900 w-8 text-right">{r.v}</span>
        </div>
      ))}
      <p className="text-[12px] text-slate-900 leading-relaxed pt-1">
        <b>Housekeeping</b> is the binding constraint — turnover capacity is 118 rooms/shift vs 190 required.
        ACT-2048 closes most of this gap.
      </p>
    </div>
  );
}

function TonightCard() {
  const { navigate, setAssistantOpen } = useApp();
  const steps = [
    { t: 'Before 14:00', d: 'Approve staff reallocation (ACT-2048) so Spa team can be briefed at shift change.', s: 'HIGH' },
    { t: 'Before 14:30', d: 'Confirm salmon PO #7741 delivery at Receiving Dock B.', s: 'HIGH' },
    { t: 'Before 18:00', d: 'Apply premium rate fence to slow booking velocity past 95%.', s: 'MED' },
  ];
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2.5 shadow-sm">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pre-evening checklist · generated 09:17</p>
      {steps.map((s, i) => (
        <div key={i} className="flex gap-2.5">
          <span className={cn('mt-1 size-1.5 rounded-full shrink-0', s.s === 'HIGH' ? 'bg-rose-500' : 'bg-amber-500')} />
          <div>
            <p className="text-[11px] font-bold text-sky-600 tnum">{s.t}</p>
            <p className="text-[12px] text-slate-600 leading-relaxed">{s.d}</p>
          </div>
        </div>
      ))}
      <Btn size="sm" variant="primary" className="w-full mt-1" onClick={() => { navigate('actions'); setAssistantOpen(false); }}>
        Open action plan <ArrowRight className="size-3.5" />
      </Btn>
    </div>
  );
}

export function AIAssistant() {
  const { assistantOpen, setAssistantOpen } = useApp();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' });
  }, [msgs, typing, assistantOpen]);

  if (!assistantOpen) return null;

  const ask = (q: string, card: CardKind) => {
    if (typing) return;
    setMsgs(m => [...m, { role: 'user', text: q }]);
    setTyping(true);
    setInput('');
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { role: 'ai', card }]);
    }, card === 'surge' ? 1400 : 1000);
  };

  const submit = () => {
    const q = input.trim();
    if (!q || typing) return;
    const match = SUGGESTED.find(s => q.toLowerCase().includes(s.q.toLowerCase().slice(0, 18)));
    ask(q, match ? match.card : 'fallback');
  };

  return (
    <div className="fixed top-[68px] right-4 bottom-4 w-[400px] z-[80] flex flex-col rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-300/60 animate-slide-left overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 h-[54px] border-b border-slate-200 shrink-0">
        <span className="size-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
          <Sparkles className="size-4 text-emerald-600" />
        </span>
        <div className="leading-tight flex-1">
          <p className="text-[13px] font-bold text-slate-900">Resort AI</p>
          <p className="text-[10.5px] text-slate-600">Decision Assistant · Azure Bay context</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse-dot" /> LIVE
        </span>
        <button onClick={() => setAssistantOpen(false)} className="size-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Operating context</p>
          <p className="text-[11.5px] text-slate-600 leading-relaxed">
            Azure Bay · Tue Sep 8 · 09:17 · Forecast occ <b className="text-slate-900 tnum">95%</b> · Storm warning 17:00–21:00 · Service quality <b className="text-slate-900 tnum">92.5%</b>
          </p>
        </div>

        {msgs.length === 0 && (
          <div className="flex gap-2.5 animate-fade-in">
            <Bot className="size-4 text-emerald-600 shrink-0 mt-1" />
            <p className="text-[12.5px] text-slate-600 leading-relaxed">
              Good morning, Sarah. I monitor demand signals, staffing, inventory and guest sentiment continuously.
              Ask me to test a scenario — I will never execute high-impact changes without your approval.
            </p>
          </div>
        )}

        {msgs.map((m, i) => m.role === 'user' ? (
          <div key={i} className="flex justify-end animate-fade-in">
            <p className="max-w-[85%] rounded-lg rounded-br-sm bg-emerald-50 border border-emerald-200 px-3 py-2 text-[12.5px] text-slate-900">{m.text}</p>
          </div>
        ) : (
          <div key={i} className="flex gap-2.5 animate-rise">
            <Bot className="size-4 text-emerald-600 shrink-0 mt-1" />
            <div className="flex-1 min-w-0 space-y-2">
              {m.card === 'surge' && <p className="text-[12.5px] text-slate-600 leading-relaxed">Running a scenario using current staffing, inventory and demand conditions…</p>}
              {m.card === 'surge' && <SurgeCard />}
              {m.card === 'bookings' && <BookingsCard />}
              {m.card === 'risk' && <RiskCard />}
              {m.card === 'tonight' && <TonightCard />}
              {m.card === 'fallback' && (
                <p className="text-[12.5px] text-slate-600 leading-relaxed">
                  I can help with occupancy scenarios, staffing risk, inventory pressure and guest issues.
                  Try one of the suggested questions below.
                </p>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-2.5 items-center animate-fade-in">
            <Bot className="size-4 text-emerald-600 shrink-0" />
            <div className="flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 shadow-sm">
              <span className="typing-dot size-1.5 rounded-full bg-emerald-500" />
              <span className="typing-dot size-1.5 rounded-full bg-emerald-500" />
              <span className="typing-dot size-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-slate-600 ml-1.5">Running operational simulation…</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested */}
      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        {SUGGESTED.map((s, i) => (
          <button key={i} onClick={() => ask(s.q, s.card)}
            className="h-7 px-2.5 rounded-full border border-slate-200 bg-white shadow-sm text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:border-emerald-300 hover:bg-emerald-50 transition-all">
            {s.q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 shrink-0">
        <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-emerald-300 shadow-sm transition-colors">
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Ask about demand, staffing, inventory…"
            className="flex-1 bg-transparent text-[12.5px] text-slate-900 placeholder:text-slate-500 outline-none"
          />
          <button onClick={submit} className="size-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white transition-colors">
            <Send className="size-3.5" strokeWidth={2.4} />
          </button>
        </div>
        <p className="text-[9.5px] text-slate-500 mt-1.5 text-center">Approval-gated · all decisions audited · model v2.4.1</p>
      </div>
    </div>
  );
}
