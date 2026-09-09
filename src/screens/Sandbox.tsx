import {
  ArrowRight, BedDouble, Box, CheckCircle2, Clock, CloudLightning, CloudRain, Flame,
  Play, RotateCcw, ShieldAlert, Sparkles, Sun, Timer, TrendingUp, Users, UtensilsCrossed,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useApp } from '@/store/app';
import { fmtDuration, fmtMoney, type Weather } from '@/data/model';
import { AnimatedNumber, Badge, BarGauge, Btn, Delta, ScreenHeader, SectionHead, SEV, Tag, type Sev } from '@/components/ui';
import { CompareBars } from '@/components/charts';
import type { CSSProperties } from 'react';

const WEATHER_OPTS: { id: Weather; label: string; icon: typeof Sun; note: string }[] = [
  { id: 'sunny', label: 'Sunny', icon: Sun, note: 'Pool & beach flow' },
  { id: 'rainy', label: 'Rainy', icon: CloudRain, note: '+ indoor dining' },
  { id: 'stormy', label: 'Stormy', icon: CloudLightning, note: 'Guests stay on-site' },
];

const sevOf = (v: number, warnAt: number, critAt: number): Sev => (v >= critAt ? 'crit' : v >= warnAt ? 'warn' : 'ok');

export function Sandbox() {
  const { draft, setDraft, applied, result, baseResult, dirty, phase, lastRun, runSimulation, resetBaseline, actions, approveAction, navigate } = useApp();
  const loading = phase === 'running';
  const isBaseline = applied.occupancy === 0.7 && applied.weather === 'sunny' && applied.inflation === 0;
  const rippleKey = `${applied.occupancy}-${applied.weather}-${applied.inflation}-${lastRun}`;

  const occPct = Math.round(draft.occupancy * 100);
  const mainActions = actions.filter(a => a.status !== 'manual');
  const allQueued = mainActions.every(a => a.status === 'queued' || a.status === 'approved');
  const dt = (v: string, invert?: boolean) => isBaseline
    ? <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">baseline</span>
    : <Delta value={v} invert={invert} />;

  const ripple: { icon: typeof TrendingUp; label: string; sub: string; sev: Sev }[] = [
    { icon: TrendingUp, label: `${Math.round(result.occupancy * 100)}% occupancy`, sub: 'Target demand level', sev: 'info' },
    { icon: BedDouble, label: `${result.occupiedRooms} occupied rooms`, sub: 'of 200 total inventory', sev: 'info' as Sev },
    { icon: Timer, label: `Housekeeping load +${Math.max(0, result.hkLoadPct)}%`, sub: `${fmtDuration(result.hkDelayMin)} per turnover`, sev: sevOf(result.hkDelayMin, 45, 70) },
    { icon: Users, label: result.burnout >= 70 ? 'Staff capacity exceeded' : 'Staffing within envelope', sub: `Burnout risk ${result.burnout}%`, sev: sevOf(result.burnout, 55, 70) },
    { icon: UtensilsCrossed, label: `Dining demand +${Math.max(0, result.diningDemandPct)}%`, sub: 'Azure Grill evening service', sev: sevOf(result.diningWaitMin, 12, 18) },
    { icon: Box, label: 'Inventory pressure increases', sub: `Salmon ${result.salmonKg} kg vs ~${result.salmonDemandKg} kg demand`, sev: result.salmonKg < 10 ? 'crit' : result.salmonKg < 25 ? 'warn' : 'ok' },
    { icon: Clock, label: `Guest waiting ${result.diningWaitMin} min`, sub: 'Dining seating queue', sev: sevOf(result.diningWaitMin, 12, 18) },
    { icon: ShieldAlert, label: `Operational risk ${result.risk}`, sub: `Composite index ${result.riskIndex}/100`, sev: result.risk === 'HIGH' ? 'crit' : result.risk === 'MODERATE' ? 'warn' : 'ok' },
  ];

  const rows: { m: string; base: string; sim: string; delta?: string; invert?: boolean; badge?: { t: string; sev: Sev } }[] = [
    { m: 'Room Revenue', base: fmtMoney(baseResult.roomRevenue), sim: fmtMoney(result.roomRevenue), delta: '+' + ((result.roomRevenue / baseResult.roomRevenue - 1) * 100).toFixed(1) + '%' },
    { m: 'HK Turnover', base: fmtDuration(baseResult.hkDelayMin), sim: fmtDuration(result.hkDelayMin), badge: { t: result.hkDelayMin >= 70 ? 'Critical' : result.hkDelayMin >= 45 ? 'Warning' : 'On track', sev: sevOf(result.hkDelayMin, 45, 70) } },
    { m: 'Dining Wait', base: fmtDuration(baseResult.diningWaitMin), sim: fmtDuration(result.diningWaitMin), badge: { t: result.diningWaitMin >= 18 ? 'Warning' : 'Healthy', sev: sevOf(result.diningWaitMin, 18, 30) } },
    { m: 'Burnout Risk', base: baseResult.burnout + '%', sim: result.burnout + '%', badge: { t: result.burnout >= 70 ? 'Critical' : result.burnout >= 55 ? 'Watch' : 'Safe', sev: sevOf(result.burnout, 55, 70) } },
    { m: 'Salmon Stock', base: baseResult.salmonKg + ' kg', sim: result.salmonKg + ' kg', badge: { t: result.salmonKg < 10 ? 'Low' : result.salmonKg < 25 ? 'Watch' : 'OK', sev: result.salmonKg < 10 ? 'warn' : result.salmonKg < 25 ? 'warn' : 'ok' } },
    { m: 'GOPPAR', base: fmtMoney(baseResult.goppar), sim: fmtMoney(result.goppar), delta: '+' + ((result.goppar / baseResult.goppar - 1) * 100).toFixed(0) + '%' },
  ];

  return (
    <div className="p-6 max-w-[1560px] mx-auto">
      <ScreenHeader
        eyebrow="Counterfactual simulation"
        title="Resort Sandbox"
        sub="Test the future before you commit to it."
        right={
          <>
            {loading && <Badge sev="info" pulse>Simulation recalculating…</Badge>}
            {phase === 'updated' && <Badge sev="ok"><CheckCircle2 className="size-3" /> Scenario updated{lastRun ? ` · ${lastRun}` : ''}</Badge>}
            {phase === 'idle' && !loading && (
              <Badge sev={isBaseline ? 'neutral' : result.risk === 'HIGH' ? 'crit' : 'warn'}>
                {isBaseline ? 'Baseline view' : `Scenario active · risk ${result.risk}`}
              </Badge>
            )}
            <Tag>Model v2.4.1</Tag>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* ── LEFT · Scenario controls ─────────────────────── */}
        <div className="col-span-12 lg:col-span-3 space-y-4 max-md:contents">
          <div className="surface p-4 space-y-5 max-md:col-span-12 max-md:order-1">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] font-bold tracking-[0.14em] text-faint uppercase">Scenario controls</p>
              {dirty && !loading && <Badge sev="warn" pulse>Unapplied</Badge>}
            </div>

            {/* Occupancy */}
            <div>
              <div className="flex items-end justify-between mb-1">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Target occupancy</p>
                <span className="text-[28px] font-bold tnum text-slate-900 leading-none">{occPct}%</span>
              </div>
              <input
                type="range" min={60} max={100} step={1} value={occPct}
                onChange={e => setDraft({ occupancy: +e.target.value / 100 })}
                style={{ '--fill': `${((occPct - 60) / 40) * 100}%` } as CSSProperties}
                className="w-full"
              />
              <div className="flex justify-between text-[9.5px] text-slate-500 tnum mt-0.5">
                {['60', '70', '80', '90', '100'].map(t => <span key={t}>{t}%</span>)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Occupied rooms</span>
                <span className="font-bold tnum text-slate-900">{Math.round(200 * draft.occupancy)}<span className="text-slate-500 font-medium"> / 200</span></span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-600">vs baseline 70%</span>
                <span className={cn('font-bold tnum', occPct === 70 ? 'text-slate-400' : occPct > 70 ? 'text-amber-600' : 'text-sky-600')}>
                  {occPct === 70 ? '—' : `${occPct > 70 ? '+' : ''}${occPct - 70} pts`}
                </span>
              </div>
            </div>

            {/* Weather */}
            <div>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Weather</p>
              <div className="grid grid-cols-3 gap-2">
                {WEATHER_OPTS.map(w => {
                  const active = draft.weather === w.id;
                  return (
                    <button key={w.id} onClick={() => setDraft({ weather: w.id })}
                      className={cn('rounded-lg border p-2.5 text-center transition-all',
                        active ? 'border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-white')}>
                      <w.icon className={cn('size-5 mx-auto mb-1.5', active ? (w.id === 'stormy' ? 'text-amber-600' : 'text-emerald-600') : 'text-slate-400')} />
                      <p className="text-[11px] font-semibold">{w.label}</p>
                      <p className="text-[8.5px] text-slate-500 leading-tight mt-0.5">{w.note}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inflation */}
            <div>
              <div className="flex items-end justify-between mb-1">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Ingredient inflation</p>
                <span className="text-[20px] font-bold tnum text-slate-900 leading-none">{draft.inflation}%</span>
              </div>
              <input
                type="range" min={0} max={50} step={5} value={draft.inflation}
                onChange={e => setDraft({ inflation: +e.target.value })}
                style={{ '--fill': `${draft.inflation * 2}%` } as CSSProperties}
                className="w-full range-warn"
              />
              <div className="flex justify-between text-[9.5px] text-slate-500 tnum mt-0.5"><span>0%</span><span>25%</span><span>50%</span></div>
              <p className="mt-1.5 text-[10.5px] text-slate-600">F&B cost pressure <b className="text-amber-600 tnum">+${(draft.inflation * 256).toLocaleString()}/mo</b></p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <Btn variant="primary" className="w-full h-10" loading={loading} onClick={runSimulation} disabled={!dirty}>
                {!loading && <Play className="size-4" strokeWidth={2.5} />}
                {loading ? 'Running simulation…' : 'Run simulation'}
              </Btn>
              <Btn variant="ghost" className="w-full" onClick={resetBaseline} disabled={loading}>
                <RotateCcw className="size-3.5" /> Reset to baseline
              </Btn>
            </div>
          </div>

          <div className="surface-flat p-3.5 text-[10.5px] text-slate-600 leading-relaxed shadow-sm max-md:col-span-12 max-md:order-2">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[9.5px] mb-1">Counterfactual engine</p>
            Cascades demand through staffing, housekeeping, F&B and inventory models calibrated on 18 months of property history.
            <span className="block mt-1 font-mono text-[10px] text-slate-400">Latency 1.2 s · seed 8842 · v2.4.1</span>
          </div>
        </div>

        {/* ── CENTER · Operational ripple ──────────────────── */}
        <div className="col-span-12 lg:col-span-5 space-y-4 max-md:contents">
          <div className="surface p-4 relative overflow-hidden shadow-sm max-md:col-span-12 max-md:order-3">
            {loading && (
              <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden bg-slate-200/50 z-10">
                <div className="h-full w-1/3 bg-sky-500 animate-scan" />
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <SectionHead title="Operational impact" sub={loading ? 'Running operational simulation…' : `${Math.round(result.occupancy * 100)}% · ${applied.weather} · ${applied.inflation}% inflation`} />
              <Badge sev={result.risk === 'HIGH' ? 'crit' : result.risk === 'MODERATE' ? 'warn' : 'ok'} pulse={result.risk === 'HIGH'}>
                Risk {result.risk}
              </Badge>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={cn('rounded-lg border border-slate-200 p-3 space-y-2.5', i === 4 && 'sm:col-span-2')}>
                    <div className="skeleton h-2.5 w-1/2" /><div className="skeleton h-6 w-2/3" /><div className="skeleton h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" key={rippleKey}>
                <Metric icon={<Flame className="size-3.5" />} label="Staff burnout" sev={sevOf(result.burnout, 55, 70)}
                  value={<AnimatedNumber value={result.burnout} format={v => Math.round(v) + '%'} />}
                  delta={dt(`+${result.burnout - baseResult.burnout} pts`, true)}
                  gauge={<BarGauge value={result.burnout} thresholds={[55, 70]} />} d={0} />
                <Metric icon={<Timer className="size-3.5" />} label="Housekeeping delay" sev={sevOf(result.hkDelayMin, 45, 70)}
                  value={<AnimatedNumber value={result.hkDelayMin} format={v => fmtDuration(v)} />}
                  delta={dt(`+${fmtDuration(result.hkDelayMin - baseResult.hkDelayMin)}`, true)}
                  gauge={<BarGauge value={result.hkDelayMin} max={120} thresholds={[45, 70]} />} d={1} />
                <Metric icon={<UtensilsCrossed className="size-3.5" />} label="Dining wait" sev={sevOf(result.diningWaitMin, 12, 18)}
                  value={<AnimatedNumber value={result.diningWaitMin} format={v => Math.round(v) + ' min'} />}
                  delta={dt(`+${result.diningWaitMin - baseResult.diningWaitMin} min`, true)}
                  gauge={<BarGauge value={result.diningWaitMin} max={30} thresholds={[12, 18]} />} d={2} />
                <Metric icon={<TrendingUp className="size-3.5" />} label="Room revenue" sev="ok"
                  value={<AnimatedNumber value={result.roomRevenue} format={fmtMoney} />}
                  delta={dt(`+${((result.roomRevenue / baseResult.roomRevenue - 1) * 100).toFixed(1)}%`)}
                  gauge={<BarGauge value={result.roomRevenue} max={54000} thresholds={[99999, 99999]} showNeedle={false} />} d={3} />
                <Metric className="sm:col-span-2" icon={<Sparkles className="size-3.5" />} label="GOPPAR" sev="ok"
                  value={<AnimatedNumber value={result.goppar} format={fmtMoney} />}
                  delta={dt(`+${Math.round((result.goppar / baseResult.goppar - 1) * 100)}%`)}
                  gauge={<BarGauge value={result.goppar} max={46000} thresholds={[99999, 99999]} showNeedle={false} />} d={4} />
              </div>
            )}
          </div>

          {/* Ripple flow */}
          <div className="surface p-4 max-md:col-span-12 max-md:order-5">
            <div className="flex items-center justify-between mb-3">
              <SectionHead title="Ripple effect" sub="Demand cascade across operations" />
              <span className="text-[10px] font-mono text-faint">T+0 → T+9 hrs</span>
            </div>
            <div className="relative" key={`flow-${rippleKey}`}>
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />
              <svg className="absolute left-[15px] top-2 bottom-2 w-px h-[calc(100%-16px)]" preserveAspectRatio="none">
                <line x1="0.5" y1="0" x2="0.5" y2="100%" stroke="#0EA5E9" strokeWidth="1" strokeDasharray="4 10" className="animate-flow" opacity={0.5} vector-effect="non-scaling-stroke" />
              </svg>
              <div className="space-y-1">
                {ripple.map((n, i) => {
                  const s = SEV[n.sev];
                  return (
                    <div key={i} className="relative flex items-center gap-3 py-1.5 pl-0 animate-rise" style={{ animationDelay: `${i * 65}ms` }}>
                      <span className={cn('relative z-10 size-8 rounded-full border flex items-center justify-center shrink-0 bg-slate-50', s.border)}>
                        <n.icon className={cn('size-3.5', s.text)} />
                        {n.sev === 'crit' && <span className={cn('absolute inset-0 rounded-full border animate-ping opacity-30', s.border)} />}
                      </span>
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-3 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 px-2 py-1 transition-colors">
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-semibold text-slate-900 truncate">{n.label}</p>
                          <p className="text-[10.5px] text-slate-500">{n.sub}</p>
                        </div>
                        <span className={cn('size-2 rounded-full shrink-0', s.dot)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT · Business impact ──────────────────────── */}
        <div className="col-span-12 lg:col-span-4 space-y-4 max-md:contents">
          <div className="surface p-4 max-md:col-span-12 max-md:order-4">
            <SectionHead title="Business impact" sub="Baseline vs scenario" className="mb-3" />
            {loading ? (
              <div className="space-y-3"><div className="skeleton h-10 w-2/3" /><div className="skeleton h-3 w-full" /><div className="skeleton h-3 w-full" /><div className="skeleton h-24 w-full" /></div>
            ) : (
              <>
                <div className="flex items-end gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Projected GOPPAR</p>
                    <AnimatedNumber value={result.goppar} format={fmtMoney} className="text-[30px] font-bold text-slate-900 leading-tight" />
                  </div>
                  <Delta value={`+${Math.round((result.goppar / baseResult.goppar - 1) * 100)}%`} className="mb-2 text-[13px]" />
                  <span className="ml-auto text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">ADR</p>
                    <p className="text-[13px] font-bold text-slate-900 tnum">${baseResult.adr} → <span className="text-emerald-600">${result.adr}</span></p>
                  </span>
                </div>
                <CompareBars items={[
                  { label: 'Room revenue', base: baseResult.roomRevenue, sim: result.roomRevenue, format: fmtMoney },
                  { label: 'GOPPAR', base: baseResult.goppar, sim: result.goppar, format: fmtMoney },
                  { label: 'HK delay (min)', base: baseResult.hkDelayMin, sim: result.hkDelayMin, format: v => Math.round(v) + 'm', invert: true },
                  { label: 'Burnout risk (%)', base: baseResult.burnout, sim: result.burnout, format: v => Math.round(v) + '%', invert: true },
                ]} />
              </>
            )}
          </div>

          <div className="surface p-4 max-md:col-span-12 max-md:order-7">
            <SectionHead title="Simulation insight" className="mb-2.5" />
            <div className="rounded-lg border border-sky-500/25 bg-sky-500/[0.06] p-3 flex gap-2.5">
              <Sparkles className="size-4 text-sky-500 shrink-0 mt-0.5" />
              {loading ? <div className="skeleton h-3 w-full mt-1" /> : (
                <p className="text-[12px] text-slate-800 leading-relaxed">
                  {result.risk === 'HIGH'
                    ? `${Math.round(result.occupancy * 100)}% occupancy maximizes room revenue, but creates operational stress across housekeeping, F&B and staffing. Prescriptive mitigation is available below.`
                    : result.risk === 'MODERATE'
                      ? 'Demand is elevated. Departments absorb the load with minor friction — watch dining wait and inventory drawdown during the evening peak.'
                      : 'Operations run comfortably inside every safe threshold. Capacity headroom exists to accept additional demand or weather disruption.'}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { l: 'Revenue gain', v: '+' + fmtMoney(result.roomRevenue - baseResult.roomRevenue), c: 'text-emerald-600' },
                { l: 'Service cost', v: `+${result.diningWaitMin - baseResult.diningWaitMin} min wait`, c: result.diningWaitMin > baseResult.diningWaitMin + 5 ? 'text-rose-600' : 'text-slate-500' },
                { l: 'RevPAR', v: fmtMoney(result.adr * result.occupancy), c: 'text-slate-900' },
              ].map((x, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-2.5 text-center shadow-sm">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{x.l}</p>
                  <p className={cn('text-[12.5px] font-bold tnum mt-0.5', x.c)}>{x.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM LEFT · Comparison table ──────────────── */}
        <div className="col-span-12 xl:col-span-7 max-md:contents">
          <div className="surface p-4 h-full max-md:col-span-12 max-md:order-6">
            <div className="flex items-center justify-between mb-3">
              <SectionHead title="Baseline vs simulation" sub="Every metric recomputed from scenario inputs" />
              <div className="flex gap-2">
                <Badge sev="neutral">Baseline {Math.round(baseResult.occupancy * 100)}%</Badge>
                <Badge sev={result.risk === 'HIGH' ? 'crit' : 'info'}>Simulation {Math.round(result.occupancy * 100)}%</Badge>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 overflow-x-auto">
              <table className="w-full text-[12.5px] min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    {['Metric', `Baseline ${Math.round(baseResult.occupancy * 100)}%`, `Simulation ${Math.round(result.occupancy * 100)}%`, 'Impact'].map((h, i) => (
                      <th key={i} className={cn('px-3.5 py-2.5 text-[10px] font-bold tracking-[0.12em] text-slate-500 uppercase', i > 0 && 'text-right', i === 3 && 'text-center')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody key={`tbl-${rippleKey}`}>
                  {loading ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-t border-slate-200"><td colSpan={4} className="px-3.5 py-3"><div className="skeleton h-3 w-full" /></td></tr>
                  )) : rows.map((r, i) => (
                    <tr key={i} className="border-t border-slate-200 hover:bg-slate-50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 45}ms` }}>
                      <td className="px-3.5 py-2.5 font-semibold text-slate-900">{r.m}</td>
                      <td className="px-3.5 py-2.5 text-right tnum text-slate-500">{r.base}</td>
                      <td className={cn('px-3.5 py-2.5 text-right tnum font-bold', isBaseline ? 'text-slate-500' : 'text-slate-900')}>{r.sim}</td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex justify-center">
                          {r.delta ? <Delta value={r.delta} className="text-[12px]" /> : r.badge && <Badge sev={r.badge.sev}>{r.badge.t}</Badge>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[10.5px] text-slate-400 font-mono">SCN-312 · engine v2.4.1 · confidence-weighted ensemble · seed 8842</p>
          </div>
        </div>

        {/* ── BOTTOM RIGHT · AI prescriptive plan ─────────── */}
        <div className="col-span-12 xl:col-span-5 max-md:contents">
          <div className={cn('surface p-4 h-full border max-md:col-span-12 max-md:order-8', allQueued ? 'border-emerald-500/25' : 'border-emerald-500/20')}>
            <div className="flex items-center justify-between mb-1">
              <SectionHead title="AI recommendation" />
              <Badge sev="ok" pulse={!allQueued}>Prescriptive</Badge>
            </div>
            <p className="text-[15px] font-bold text-slate-900 tracking-tight mb-3">
              {allQueued ? 'Plan approved — execution is being monitored.' : 'Protect service quality before accepting additional demand.'}
            </p>
            <div className="space-y-2.5">
              {mainActions.map((a, i) => {
                const done = a.status === 'queued' || a.status === 'approved';
                return (
                  <div key={a.id} className={cn('rounded-lg border p-3 transition-all animate-rise',
                    done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm')}
                    style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9.5px] text-slate-400">{a.num}</span>
                      <p className="text-[12.5px] font-bold text-slate-900 flex-1">{a.title}</p>
                      <span className="text-[10px] text-slate-500 font-medium">{a.dept}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 gap-3">
                      <div className="flex items-center gap-3 text-[10.5px]">
                        <span className="text-emerald-600 font-semibold tnum">{a.impact}</span>
                        <span className="text-slate-500">Conf <b className="text-slate-900 tnum">{a.confidence}%</b></span>
                      </div>
                      {done ? (
                        <Badge sev="ok"><CheckCircle2 className="size-3" /> {a.status === 'queued' ? 'Execution queued' : 'Approved'}</Badge>
                      ) : a.status === 'rejected' ? (
                        <Badge sev="crit">Rejected</Badge>
                      ) : (
                        <div className="flex gap-1.5">
                          <Btn size="xs" variant="success" onClick={() => approveAction(a.id)}>Approve</Btn>
                          <Btn size="xs" variant="ghost" onClick={() => navigate('actions')}>Details</Btn>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Btn variant="outline" className="w-full mt-3" onClick={() => navigate('actions')}>
              {allQueued ? 'Monitor execution' : 'Review full action plan'} <ArrowRight className="size-3.5" />
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, delta, gauge, sev, d, className }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; delta: React.ReactNode; gauge: React.ReactNode; sev: Sev; d: number; className?: string;
}) {
  const s = SEV[sev];
  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-3 animate-rise shadow-sm', className)} style={{ animationDelay: `${d * 60}ms` }}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[9.5px] font-bold tracking-[0.12em] uppercase text-slate-500">
          <span className={s.text}>{icon}</span>{label}
        </span>
        {delta}
      </div>
      <p className={cn('text-[22px] font-bold mt-1 leading-none', sev === 'crit' ? 'text-rose-600' : sev === 'warn' ? 'text-amber-600' : 'text-slate-900')}>{value}</p>
      <div className="mt-2.5">{gauge}</div>
    </div>
  );
}
