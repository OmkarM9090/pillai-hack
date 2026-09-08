import { Activity, ArrowDownRight, ArrowUpRight, Brain, CheckCircle2, CircleDot, Database, GitBranch, Gauge, RefreshCw, Repeat, Target, TriangleAlert } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ACCURACY_7D } from '@/data/model';
import { useApp } from '@/store/app';
import { Badge, Btn, Kpi, ScreenHeader, SectionHead, Tag, Progress } from '@/components/ui';
import { LineChart, Spark } from '@/components/charts';
import { AnimatedNumber } from '@/components/ui';

export function FeedbackAccuracy() {
  const { pushToast } = useApp();

  const rows = [
    { m: 'Housekeeping delay', p: '1.4 hr', a: '1.2 hr', e: 14.3, spark: [9, 11, 15, 13, 16, 14, 14.3] },
    { m: 'Dining wait', p: '22 min', a: '19 min', e: 13.6, spark: [8, 9, 12, 11, 14, 13, 13.6] },
    { m: 'Burnout risk', p: '84%', a: '79%', e: 6.0, spark: [10, 9, 8, 9, 7, 6.5, 6] },
    { m: 'Occupancy', p: '95%', a: '94%', e: 1.1, spark: [4, 3.4, 3, 2.6, 2, 1.5, 1.1] },
    { m: 'Salmon drawdown', p: '5 kg', a: '6.1 kg', e: 9.8, spark: [16, 14, 13, 12, 11, 10, 9.8] },
  ];

  const loop = [
    { t: 'PREDICT', d: 'Scenario engine · 5 stages', icon: Brain, state: 'done', note: 'SCN-311 · 09:02' },
    { t: 'ACT', d: '3 actions executed', icon: GitBranch, state: 'done', note: 'ACT-2048/49/50 queued' },
    { t: 'MEASURE', d: 'Outcome telemetry ingested', icon: Activity, state: 'done', note: 'Sep 7 · 02:00 batch' },
    { t: 'RETRAIN', d: 'Nightly at 02:00 UTC', icon: Repeat, state: 'active', note: 'Next in 16 h 43 m' },
  ];

  return (
    <div className="p-6 max-w-[1560px] mx-auto">
      <ScreenHeader
        title="Feedback & Accuracy"
        sub="How the system measures itself — and gets sharper every night."
        right={
          <>
            <Tag><Database className="size-3 mr-1.5" />12/12 integrations healthy</Tag>
            <Tag>Model <span className="font-mono text-slate-900 ml-1">v2.4.1</span></Tag>
            <Btn variant="outline" size="sm" onClick={() => pushToast('info', 'Retrain requested', 'Out-of-band retrain queued for the 02:00 window.')}>
              <RefreshCw className="size-3.5" /> Request retrain
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Kpi label="Forecast accuracy" sev="ok" icon={<Target className="size-4" />}
          value={<AnimatedNumber value={88.7} format={v => v.toFixed(1) + '%'} className="text-[26px] font-bold text-slate-900" />}
          sub="7-day rolling · weighted" />
        <Kpi label="MAPE (revenue)" sev="ok" icon={<Gauge className="size-4" />}
          value={<AnimatedNumber value={11.3} format={v => v.toFixed(1) + '%'} className="text-[26px] font-bold text-slate-900" />}
          sub="−2.4 pts vs last week" />
        <Kpi label="Calibration" sev="warn" icon={<Activity className="size-4" />}
          value={<span className="text-[26px] font-bold text-slate-900 tnum">+2.1 pts</span>}
          sub="Slight over-prediction on HK" />
        <Kpi label="Predictors" sev="neutral" icon={<Brain className="size-4" />}
          value={<span className="text-[26px] font-bold text-slate-900 tnum">14</span>}
          sub="Ensemble · nightly retrain" />
      </div>

      {/* Learning loop */}
      <div className="surface p-4 mb-6 shadow-sm">
        <SectionHead title="Closed learning loop" sub="Every approved decision is measured against its prediction" className="mb-4" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {loop.map((s, i) => (
            <div key={i} className={cn('relative rounded-lg border p-3.5',
              s.state === 'done' ? 'border-emerald-200 bg-emerald-50 shadow-sm' : 'border-sky-200 bg-sky-50 shadow-sm')}>
              {i < 3 && <span className="hidden xl:block absolute top-1/2 -right-3 w-3 h-px bg-slate-300" />}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-[0.16em] text-slate-500">{s.t}</span>
                {s.state === 'done'
                  ? <CheckCircle2 className="size-4 text-emerald-600" />
                  : <RefreshCw className="size-4 text-sky-600 animate-spin" style={{ animationDuration: '3s' }} />}
              </div>
              <s.icon className={cn('size-5 mb-2', s.state === 'done' ? 'text-emerald-600' : 'text-sky-600')} />
              <p className="text-[12px] font-semibold text-slate-900">{s.d}</p>
              <p className="text-[10px] text-slate-600 mt-1 font-mono">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-7 space-y-4">
          <div className="surface p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <SectionHead title="Prediction accuracy — last 7 days" />
              <Badge sev="ok">Improving</Badge>
            </div>
            <LineChart
              height={210}
              labels={ACCURACY_7D.labels}
              legend
              series={[
                { data: ACCURACY_7D.predicted, color: '#0EA5E9', dashed: true, label: 'Predicted HK delay' },
                { data: ACCURACY_7D.actual, color: '#10B981', label: 'Actual' },
              ]}
              formatY={v => Math.round(v) + 'm'}
            />
          </div>

          <div className="surface p-4 shadow-sm">
            <SectionHead title="Error by metric" sub="Predicted vs actual · last completed cycle" className="mb-3" />
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="bg-slate-50">
                    {['Metric', 'Predicted', 'Actual', 'Error', '7-day error trend'].map((h, i) => (
                      <th key={i} className={cn('px-3.5 py-2.5 text-left text-[10px] font-bold tracking-[0.12em] text-slate-500 uppercase', i > 0 && 'text-right')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const improving = r.spark[r.spark.length - 1] < r.spark[0];
                    return (
                      <tr key={i} className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="px-3.5 py-2.5 font-semibold text-slate-900">{r.m}</td>
                        <td className="px-3.5 py-2.5 text-right tnum text-sky-600">{r.p}</td>
                        <td className="px-3.5 py-2.5 text-right tnum text-emerald-600">{r.a}</td>
                        <td className={cn('px-3.5 py-2.5 text-right tnum font-bold', r.e > 10 ? 'text-amber-600' : 'text-emerald-600')}>{r.e.toFixed(1)}%</td>
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center justify-end gap-2">
                            <Spark data={r.spark} color={improving ? '#10B981' : '#F43F5E'} w={72} h={18} />
                            {improving ? <ArrowDownRight className="size-3 text-emerald-500" /> : <ArrowUpRight className="size-3 text-rose-500" />}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="surface p-4 space-y-3.5 shadow-sm">
            <SectionHead title="Drift & recalibration" />
            {[
              { sev: 'warn' as const, t: 'Salmon demand model drift +9%', s: 'Guest mix shifted pescatarian-heavy this week. Retrain scheduled 02:00 — supplier lead-time predictor unaffected.', prog: 62 },
              { sev: 'info' as const, t: 'HK pace recalibrated Sep 6', s: 'Turnover model now weights room type + stayover ratio. Error 16.8% → 14.3% over 2 cycles.', prog: 88 },
              { sev: 'ok' as const, t: 'Occupancy pace model stable', s: 'P50 band ±3.2% holding for 21 consecutive days. No action required.', prog: 96 },
            ].map((d, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  {d.sev === 'warn' ? <TriangleAlert className="size-4 text-amber-500" /> : d.sev === 'info' ? <CircleDot className="size-4 text-sky-500" /> : <CheckCircle2 className="size-4 text-emerald-500" />}
                  <p className="text-[12.5px] font-semibold text-slate-900">{d.t}</p>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mb-2">{d.s}</p>
                <div className="flex items-center gap-2">
                  <Progress value={d.prog} color={d.sev === 'warn' ? '#F59E0B' : d.sev === 'info' ? '#38BDF8' : '#10B981'} className="flex-1" />
                  <span className="text-[9.5px] tnum text-slate-500">{d.prog}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="surface p-4 shadow-sm">
            <SectionHead title="What the model learned recently" className="mb-3" />
            <div className="space-y-3">
              {[
                { d: 'Sep 7', t: 'Banquet event adds +9 min dining wait independent of occupancy', w: 'Weight +0.14 on events feature' },
                { d: 'Sep 6', t: 'Storm days compress HK turnover by 12% (guests linger)', w: 'Weather coupling enabled' },
                { d: 'Sep 4', t: 'Festival ADR ceiling is $262 before pace drop-off', w: 'Rate fence guardrail updated' },
              ].map((l, i) => (
                <div key={i} className="flex gap-3">
                  <span className="font-mono text-[10px] text-slate-500 w-10 shrink-0 pt-0.5">{l.d}</span>
                  <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-[12px] text-slate-900 leading-snug">{l.t}</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">{l.w}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 flex gap-3 shadow-sm">
            <Brain className="size-5 text-sky-500 shrink-0" />
            <p className="text-[11.5px] text-slate-600 leading-relaxed">
              <b className="text-slate-900">Governance:</b> predictions influence recommendations — never direct execution.
              Every approved or rejected decision becomes labeled training data. Override rate this week: <b className="text-slate-900 tnum">4.2%</b>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
