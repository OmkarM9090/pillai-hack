import { Fragment, useState } from 'react';
import {
  Archive, BadgeCheck, CircleX, CloudLightning, CloudRain, Download, History, RefreshCw, Sun, TriangleAlert, WifiOff,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useApp } from '@/store/app';
import { SCENARIO_RUNS, type ScenarioRun } from '@/data/model';
import { Badge, Btn, ScreenHeader, Tag, sevFromRisk } from '@/components/ui';

const W_ICON = { sunny: Sun, rainy: CloudRain, stormy: CloudLightning };

const DECISION_STYLE: Record<ScenarioRun['decision'], { label: string; cls: string; icon: typeof BadgeCheck }> = {
  APPLIED: { label: 'Applied', cls: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: BadgeCheck },
  REJECTED: { label: 'Rejected', cls: 'bg-rose-50 border-rose-200 text-rose-800', icon: CircleX },
  ARCHIVED: { label: 'Archived', cls: 'bg-slate-50 border-slate-200 text-slate-600', icon: Archive },
  FAILED: { label: 'Failed', cls: 'bg-amber-50 border-amber-200 text-amber-800', icon: TriangleAlert },
};

export function ScenarioHistory() {
  const { pushToast } = useApp();
  const [runs, setRuns] = useState(SCENARIO_RUNS);
  const [retrying, setRetrying] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const failed = runs.find(r => r.decision === 'FAILED');

  const retry = () => {
    setRetrying(true);
    setTimeout(() => {
      setRuns(prev => prev.map(r => r.decision === 'FAILED' ? { ...r, decision: 'APPLIED', when: 'Sep 6 · 09:52' } : r));
      setRetrying(false);
      pushToast('success', 'Simulation service restored', 'SCN-308 recomputed from validated snapshot — decision applied.');
    }, 1100);
  };

  return (
    <div className="p-6 max-w-[1560px] mx-auto">
      <ScreenHeader
        title="Scenario History"
        sub="Full decision audit — every simulation, parameter set and outcome."
        right={
          <>
            <Tag><History className="size-3 mr-1.5" />148 runs · 90-day retention</Tag>
            <Btn variant="outline" size="sm" onClick={() => pushToast('info', 'Export queued', 'Audit CSV will arrive in your inbox.')}><Download className="size-3.5" /> Export audit</Btn>
          </>
        }
      />

      {failed && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-wrap items-center gap-3 animate-rise shadow-sm">
          <span className="size-9 rounded-lg border border-amber-200 bg-amber-100/50 flex items-center justify-center">
            <WifiOff className="size-4.5 text-amber-600" />
          </span>
          <div className="flex-1 min-w-[240px]">
            <p className="text-[13px] font-bold text-slate-900">Simulation unavailable — service timeout detected</p>
            <p className="text-[11.5px] text-slate-600 mt-0.5">Using last validated scenario. {failed.id} ({failed.name}) failed at engine stage 3/5 · error E-502G.</p>
          </div>
          <Btn variant="warnSoft" loading={retrying} onClick={retry}>
            {!retrying && <RefreshCw className="size-3.5" />} {retrying ? 'Retrying…' : 'Retry'}
          </Btn>
        </div>
      )}

      <div className="surface overflow-x-auto shadow-sm">
        <table className="w-full text-[12.5px] min-w-[700px]">
          <thead>
            <tr className="bg-slate-50">
              {['Run', 'Scenario', 'Parameters', 'Δ GOPPAR', 'Risk', 'Decision', 'Owner'].map((h, i) => (
                <th key={i} className={cn('px-4 py-3 text-left text-[10px] font-bold tracking-[0.12em] text-slate-500 uppercase', (i === 3 || i === 4) && 'text-center')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {runs.map(r => {
              const W = W_ICON[r.weather];
              const d = DECISION_STYLE[r.decision];
              const neg = r.goppar.startsWith('−');
              const expanded = open === r.id;
              return (
                <Fragment key={r.id}>
                  <tr onClick={() => setOpen(expanded ? null : r.id)}
                    className={cn('border-t border-slate-200 cursor-pointer transition-colors', expanded ? 'bg-slate-50/80' : 'hover:bg-slate-50/50')}>
                    <td className="px-4 py-3">
                      <p className="font-mono text-[11px] text-slate-900">{r.id}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{r.when}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{r.name}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 text-[11px] text-slate-600">
                        <span className={cn('tnum font-bold', r.occ >= 90 ? 'text-amber-600' : 'text-slate-900')}>{r.occ}%</span>
                        <W className={cn('size-3.5', r.weather === 'stormy' ? 'text-amber-500' : 'text-slate-500')} />
                        <span className="tnum">+{r.inflation}% infl</span>
                      </span>
                    </td>
                    <td className={cn('px-4 py-3 text-center tnum font-bold', neg ? 'text-rose-600' : 'text-emerald-600')}>{r.goppar}</td>
                    <td className="px-4 py-3 text-center"><Badge sev={sevFromRisk(r.risk)}>{r.risk}</Badge></td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1.5 h-[22px] px-2 rounded-md border text-[10.5px] font-bold uppercase tracking-wide', d.cls)}>
                        <d.icon className="size-3" />{d.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.user}</td>
                  </tr>
                  {expanded && (
                    <tr key={r.id + '-x'} className="border-t border-slate-100 bg-slate-50">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="flex flex-wrap gap-x-8 gap-y-1.5 text-[11.5px] text-slate-600 animate-fade-in">
                          <span><b className="text-slate-500 uppercase text-[9px] tracking-wider mr-1.5">Engine</b>v2.4.1 · ensemble · seed {(310 + Number(r.id.slice(4))).toFixed(0)}</span>
                          <span><b className="text-slate-500 uppercase text-[9px] tracking-wider mr-1.5">Runtime</b>1.24 s · 5/5 stages</span>
                          <span><b className="text-slate-500 uppercase text-[9px] tracking-wider mr-1.5">Decision window</b>4.2 min avg</span>
                          {r.decision === 'APPLIED' && <span className="text-emerald-700"><b className="uppercase text-[9px] tracking-wider mr-1.5 text-emerald-500">Audit</b>Approved by {r.user} · linked actions & tasks attached</span>}
                          {r.decision === 'REJECTED' && <span className="text-rose-700"><b className="uppercase text-[9px] tracking-wider mr-1.5 text-rose-500">Reason</b>Over capacity — burnout &gt; 90%, safety floor breached</span>}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[10.5px] text-slate-500 font-mono">AUDIT POLICY: immutable log · SOC 2 §CC7.2 · exportable to BI · last validated scenario SCN-310 (Sep 7, 16:40)</p>
    </div>
  );
}
