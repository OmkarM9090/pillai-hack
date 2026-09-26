import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BedDouble, CalendarCheck2, CheckCircle2, ChevronRight, ClipboardCheck, Sun, CloudRain,
  ConciergeBell, Flame, FlaskConical, LogIn, LogOut, Minus, PackageOpen, Sparkles, Timer, TrendingUp,
  UtensilsCrossed, Wrench, X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useApp } from '@/store/app';
import { AC_TASK, HEALTH_SPARKS } from '@/data/model';
import { AnimatedNumber, Badge, Btn, Confidence, Delta, Kpi, ScreenHeader, SectionHead, SEV, Tag } from '@/components/ui';
import { Spark } from '@/components/charts';

const HEALTH = [
  { name: 'Housekeeping', value: '1.4 hr delay', note: 'Turnover backlog', sev: 'crit' as const, icon: Timer, spark: HEALTH_SPARKS.hk, dir: 'up' as const },
  { name: 'Front Desk', value: '4.2 min wait', note: 'Within SLA (5 min)', sev: 'ok' as const, icon: ConciergeBell, spark: HEALTH_SPARKS.fd, dir: 'flat' as const },
  { name: 'F&B', value: '22 min wait', note: 'Dinner peak projection', sev: 'warn' as const, icon: UtensilsCrossed, spark: HEALTH_SPARKS.fb, dir: 'up' as const },
  { name: 'Engineering', value: '2 active tickets', note: 'Pool heater · Elevator B', sev: 'ok' as const, icon: Wrench, spark: HEALTH_SPARKS.eng, dir: 'flat' as const },
  { name: 'Pantry', value: 'Salmon 5 kg', note: 'Stockout risk 20:10', sev: 'warn' as const, icon: PackageOpen, spark: HEALTH_SPARKS.pantry, dir: 'down' as const },
];

export function Highlighted({ text, marks, markClass }: { text: string; marks: string[]; markClass?: string }) {
  const out: ReactNode[] = [];
  let rest = text, k = 0;
  while (rest.length) {
    let best = -1, mark = '';
    for (const m of marks) {
      const i = rest.toLowerCase().indexOf(m.toLowerCase());
      if (i !== -1 && (best === -1 || i < best)) { best = i; mark = rest.slice(i, i + m.length); }
    }
    if (best === -1) { out.push(rest); break; }
    if (best > 0) out.push(rest.slice(0, best));
    out.push(<mark key={k++} className={markClass ?? "bg-rose-100 text-rose-800 rounded px-1 py-px font-semibold"}>{mark}</mark>);
    rest = rest.slice(best + mark.length);
  }
  return <>{out}</>;
}

export function CommandCenter() {
  const { navigate, approveAll, alertState, setAlertState, fetchTasks, hasTask, pushToast, pendingCount, actions, result, activeRole } = useApp();
  const [weatherStr, setWeatherStr] = useState('Loading weather...');

  useEffect(() => {
    // Fetch live weather from Open-Meteo for Miami (Azure Bay Resort analog)
    fetch('https://api.open-meteo.com/v1/forecast?latitude=25.76&longitude=-80.19&current_weather=true')
      .then(res => res.json())
      .then(data => {
        const temp = data.current_weather.temperature;
        const code = data.current_weather.weathercode;
        // WMO Weather codes: 0 is clear, 1-3 cloudy, 51+ rain/storm
        if (code === 0) setWeatherStr(`Clear ${temp}°C`);
        else if (code <= 3) setWeatherStr(`Cloudy ${temp}°C`);
        else setWeatherStr(`Rain ${temp}°C`);
      })
      .catch(() => setWeatherStr('Weather Unavailable'));
  }, []);

  const createEngTask = async () => {
    if (hasTask('OPS-104')) { navigate('tasks'); return; }
    try {
      await fetch('http://localhost:5000/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': activeRole },
        body: JSON.stringify(AC_TASK)
      });
      await fetchTasks();
      pushToast('success', 'Task OPS-104 created', 'Routed to Engineering · auto-assigned to Alex Carter.');
    } catch (e) {
      console.error(e);
      pushToast('error', 'API Error', 'Failed to dispatch ticket via API.');
    }
  };

  const approved = alertState === 'approved';
  const queuedCount = actions.filter(a => a.status === 'queued' || a.status === 'approved').length;

  return (
    <div className="p-6 max-w-[1560px] mx-auto">
      <ScreenHeader
        title="Resort Command Center"
        sub="Good morning, Sarah. Here's what needs your attention today."
        right={
          <>
            <Tag><LogIn className="size-3 mr-1.5 text-emerald-500" />Arrivals <b className="text-slate-900 ml-1 tnum">74</b></Tag>
            <Tag><LogOut className="size-3 mr-1.5 text-sky-500" />Departures <b className="text-slate-900 ml-1 tnum">58</b></Tag>
            <Tag>
              {weatherStr.includes('Rain') ? <CloudRain className="size-3 mr-1.5 text-sky-500" /> : <Sun className="size-3 mr-1.5 text-amber-500" />}
              {weatherStr}
            </Tag>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Kpi
          label="Room Occupancy" sev={result.risk === 'HIGH' ? 'warn' : 'ok'} icon={<BedDouble className="size-4" />}
          onClick={() => navigate('sandbox')}
          value={<>
            <AnimatedNumber value={result.occupancy * 100} format={v => `${Math.round(v)}%`} className="text-[26px] font-bold text-slate-900" />
            {result.risk === 'HIGH' && <Badge sev="warn" pulse className="ml-1">Surge alert</Badge>}
          </>}
          sub={`Tonight · ${result.occupiedRooms}/200 rooms`} delta={<Delta value="+25%" invert={result.risk === 'HIGH'} />}
          spark={<Spark data={[62, 65, 68, 70, 71, 74, 88, result.occupancy * 100]} color={result.risk === 'HIGH' ? "#F59E0B" : "#10B981"} w={220} h={24} className="w-full" />}
        />
        <Kpi
          label="Projected GOPPAR" sev="ok" icon={<TrendingUp className="size-4" />}
          value={<AnimatedNumber value={result.goppar} format={v => '$' + Math.round(v).toLocaleString()} className="text-[26px] font-bold text-slate-900" />}
          sub="vs $38,250 static plan" delta={<Delta value="+12%" />}
          spark={<Spark data={[37.8, 38.1, 38.25, 38.6, 39.2, 40.4, 41.8, result.goppar/1000]} w={220} h={24} className="w-full" />}
        />
        <Kpi
          label="Staff Burnout Risk" sev={result.burnout > 75 ? 'crit' : 'ok'} icon={<Flame className="size-4" />}
          onClick={() => navigate('scheduler')}
          value={<>
            <AnimatedNumber value={result.burnout} format={v => `${Math.round(v)}%`} className={cn("text-[26px] font-bold", result.burnout > 75 ? "text-rose-600" : "text-emerald-600")} />
            {result.burnout > 75 && <Badge sev="crit" pulse>Critical</Badge>}
          </>}
          sub={result.burnout > 75 ? "Capacity limit exceeded" : "Within safe limits"} delta={<Delta value="+44 pts" invert />}
          spark={<Spark data={HEALTH_SPARKS.hk} color={result.burnout > 75 ? "#F43F5E" : "#10B981"} w={220} h={24} className="w-full" />}
        />
        <Kpi
          label="Service Quality" sev="ok" icon={<Sparkles className="size-4" />}
          value={<AnimatedNumber value={92.5} format={v => `${v.toFixed(1)}%`} className="text-[26px] font-bold text-slate-900" />}
          sub="Stable · 14-day trend" delta={<Delta value="-1.8%" invert />}
          spark={<Spark data={[94.3, 93.9, 94.1, 93.5, 93.2, 92.9, 92.7, 92.5]} color="#38BDF8" w={220} h={24} className="w-full" />}
        />
      </div>

      <div className="grid grid-cols-12 gap-4 mb-6">
        {/* AI ACTION REQUIRED */}
        <div className="col-span-12 xl:col-span-8">
          {alertState === 'dismissed' ? (
            <div className="surface-flat p-3.5 flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="size-4 text-slate-500" />
              <p className="text-[12.5px] text-slate-600 flex-1">Peak demand surge alert dismissed · logged to audit 09:19 AM · <span className="font-mono text-[11px]">AUD-5518</span></p>
              <Btn size="sm" variant="ghost" onClick={() => setAlertState('open')}>Reopen</Btn>
            </div>
          ) : (
            <div className={cn('relative rounded-xl border p-5 overflow-hidden animate-rise shadow-sm',
              approved ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50')}>
              <div className={cn('absolute top-0 left-0 right-0 h-[3px]', approved ? 'bg-gradient-to-r from-emerald-400 to-emerald-200' : 'bg-gradient-to-r from-amber-400 to-rose-300')} />
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge sev={approved ? 'ok' : 'warn'} pulse={!approved}>{approved ? 'Execution in progress' : 'AI action required'}</Badge>
                <span className="text-[11px] font-bold tracking-[0.16em] text-slate-500 uppercase">Peak demand surge</span>
                <span className="ml-auto font-mono text-[10.5px] text-slate-500">ALR-3301 · 09:14 AM</span>
              </div>

              <h3 className="text-[19px] font-bold text-slate-900 tracking-tight">95% occupancy creates a staffing and dining bottleneck.</h3>
              <p className="text-[12.5px] text-slate-600 mt-1">Storm conditions keep guests on-property, compounding evening peak pressure across four departments.</p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
                {[
                  { icon: Timer, l: 'Housekeeping', v: '+1.4 hr', s: 'turnover delay', c: 'text-rose-500' },
                  { icon: UtensilsCrossed, l: 'F&B', v: '22 min', s: 'predicted wait', c: 'text-amber-500' },
                  { icon: Flame, l: 'Staff', v: '84%', s: 'burnout risk', c: 'text-rose-500' },
                  { icon: PackageOpen, l: 'Inventory', v: '5 kg', s: 'salmon remaining', c: 'text-amber-500' },
                  { icon: TrendingUp, l: 'Revenue', v: '$42,850', s: 'projected GOPPAR', c: 'text-emerald-500' },
                ].map((m, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 bg-white shadow-sm p-2.5">
                    <m.icon className={cn('size-4 mb-1.5', m.c)} />
                    <p className="text-[13px] font-bold text-slate-900 tnum">{m.v}</p>
                    <p className="text-[9.5px] text-slate-500 uppercase tracking-wider font-semibold">{m.l}</p>
                    <p className="text-[10px] text-slate-600">{m.s}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 shadow-sm p-3 flex items-start gap-2.5">
                <Sparkles className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[12.5px] text-slate-900 leading-relaxed">
                  <span className="font-bold">AI recommendation: </span>
                  Rebalance cross-trained staff, adjust salmon pricing and prepare a replenishment order before the evening peak.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px]">
                <span className="flex items-center gap-2 text-slate-600">Confidence <Confidence value={92} /></span>
                <span className="flex items-center gap-1.5 text-slate-600">Risk <Badge sev="crit" className="h-5">High</Badge></span>
                <span className="flex items-center gap-1.5 text-slate-600">Expected impact <b className="text-emerald-600">Reduce predicted guest wait by 31%</b></span>
                {queuedCount > 0 && <span className="flex items-center gap-1.5 text-slate-600">Progress <b className="text-sky-600">{queuedCount}/3 actions queued</b></span>}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Btn variant="primary" onClick={() => navigate('actions')}>
                  <ClipboardCheck className="size-4" /> Review action plan
                </Btn>
                {!approved && pendingCount > 0 && (
                  <Btn variant="success" onClick={approveAll}>Approve all</Btn>
                )}
                <Btn variant="outline" onClick={() => navigate('sandbox')}>
                  <FlaskConical className="size-4" /> Open sandbox <ChevronRight className="size-3.5" />
                </Btn>
                {!approved && (
                  <Btn variant="ghost" onClick={() => { setAlertState('dismissed'); pushToast('warn', 'Alert dismissed', 'Logged to audit trail (AUD-5518).'); }}>
                    <X className="size-3.5" /> Dismiss
                  </Btn>
                )}
                {approved && (
                  <Btn variant="outline" onClick={() => navigate('tasks')}>View execution queue <ArrowRight className="size-3.5" /></Btn>
                )}
              </div>
            </div>
          )}
        </div>

        {/* LIVE GUEST INTELLIGENCE */}
        <div className="col-span-12 xl:col-span-4 flex flex-col">
          <SectionHead title="Live guest intelligence" sub="Streaming from in-stay & post-stay channels" className="mb-2" right={
            <button onClick={() => navigate('guests')} className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">Open feed <ArrowRight className="size-3" /></button>
          } />
          <div className="surface p-4 flex-1 flex flex-col shadow-sm">
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              <Badge sev="crit">Negative</Badge>
              <Tag>Facilities</Tag>
              <Tag>Room 304</Tag>
              <Badge sev="crit" className="ml-auto">Priority: High</Badge>
            </div>
            <blockquote className="text-[13.5px] text-slate-900 leading-relaxed flex-1">
              "<Highlighted text="The dinner was amazing, but the AC in Room 304 made a loud rattling noise and was leaking." marks={['rattling noise', 'leaking']} />"
            </blockquote>
            <div className="mt-3 flex items-center gap-2 text-[10.5px] text-slate-500 font-medium">
              <span className="font-mono">G-8832</span><span>·</span><span>Post-stay survey</span><span>·</span><span>Sep 7 · 21:36</span>
              <span className="ml-auto tnum">Sentiment <b className="text-rose-600">−0.84</b></span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
              <Btn variant="primary" size="sm" className="flex-1" onClick={createEngTask}>
                <Wrench className="size-3.5" /> {hasTask('OPS-104') ? 'View engineering task' : 'Create engineering task'}
              </Btn>
              <Btn variant="outline" size="sm" onClick={() => navigate('guests')}>Analyze</Btn>
            </div>
          </div>
        </div>
      </div>

      {/* OPERATIONAL HEALTH */}
      <div className="flex items-end justify-between mb-2">
        <SectionHead title="Operational health" sub="Live department telemetry vs safe thresholds" />
        <p className="text-[10.5px] text-slate-500 font-mono">Last updated 09:17 AM · 12 integrations</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {HEALTH.map(h => {
          const s = SEV[h.sev];
          return (
            <div key={h.name} className="surface p-4 hover:border-slate-300 transition-colors shadow-sm">
              <div className="flex items-center justify-between mb-2.5">
                <span className={cn('size-8 rounded-lg flex items-center justify-center border', s.bg, s.border)}>
                  <h.icon className={cn('size-4', s.text)} />
                </span>
                <Badge sev={h.sev}>{h.sev === 'ok' ? 'Healthy' : h.sev === 'warn' ? (h.name === 'Pantry' ? 'Low stock' : 'Warning') : 'Critical'}</Badge>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{h.name}</p>
              <p className="text-[15px] font-bold text-slate-900 tnum mt-0.5">{h.value}</p>
              <div className="flex items-center justify-between mt-2">
                <Spark data={h.spark} color={s.bar} w={96} h={22} />
                <TrendMark dir={h.dir} bad={h.sev !== 'ok'} />
              </div>
              <p className="text-[10px] text-slate-600 mt-1.5">{h.note}</p>
            </div>
          );
        })}
      </div>

      {/* Footer strip */}
      <div className="mt-6 surface-flat px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 border border-slate-200">
        <span className="flex items-center gap-2 text-[11px] text-slate-600"><CalendarCheck2 className="size-3.5 text-sky-500" /> Next milestone: <b className="text-slate-900">Evening peak 18:00</b></span>
        <span className="text-[11px] text-slate-600">Model: <span className="font-mono text-slate-900">v2.4.1</span> · retrained Sep 7 02:00</span>
        <span className="text-[11px] text-slate-600">Pipeline: <b className="text-emerald-600">Sense → Predict → Simulate → Decide → Approve → Act → Learn</b></span>
        <span className="ml-auto text-[10.5px] text-slate-500 font-mono">UPTIME 99.98% · SYNC 1.2s</span>
      </div>
    </div>
  );
}

function TrendMark({ dir, bad }: { dir: 'up' | 'down' | 'flat'; bad: boolean }) {
  if (dir === 'flat') return <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-500"><Minus className="size-3" strokeWidth={2.5} />0%</span>;
  const Icon = dir === 'up' ? ArrowUpRight : ArrowDownRight;
  const good = bad ? dir === 'down' : dir === 'up';
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-[11px] font-semibold', good ? 'text-emerald-600' : 'text-rose-600')}>
      <Icon className="size-3" strokeWidth={2.5} />trend
    </span>
  );
}
