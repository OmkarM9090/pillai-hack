import { ArrowRight, BedDouble, CalendarDays, CloudLightning, FlaskConical, PartyPopper, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useApp } from '@/store/app';
import { FORECAST_DAYS } from '@/data/model';
import { Badge, Btn, Delta, Kpi, ScreenHeader, SectionHead, Tag } from '@/components/ui';
import { Donut, LineChart } from '@/components/charts';
import { AnimatedNumber } from '@/components/ui';

export function DemandForecast() {
  const { navigate, presetSurge } = useApp();
  const occData = FORECAST_DAYS.map(d => d.occ);
  const labels = FORECAST_DAYS.map(d => d.d);

  const drivers = [
    { d: 'Sep 8', t: 'Storm warning 17:00–21:00', i: 'Indoor demand +14% · balcony F&B closed', icon: CloudLightning, c: 'text-amber-500' },
    { d: 'Sep 10', t: 'Techline conference checkout (92 rooms)', i: 'Occupancy trough then fast recovery', icon: Users, c: 'text-sky-500' },
    { d: 'Sep 12', t: 'Coastal Wine Festival', i: 'Rate opportunity +$48 · compression night', icon: PartyPopper, c: 'text-emerald-500' },
  ];

  return (
    <div className="p-6 max-w-[1560px] mx-auto">
      <ScreenHeader
        title="Demand Forecast"
        sub="14-day occupancy, rate and pace intelligence."
        right={
          <>
            <Tag>Pickup <b className="text-amber-600 ml-1 tnum">+38 rooms</b>&nbsp;vs STLY</Tag>
            <Tag><CalendarDays className="size-3 mr-1.5" />Horizon 14 days</Tag>
            <Btn variant="primary" size="sm" onClick={presetSurge}><FlaskConical className="size-3.5" /> Test 95% scenario</Btn>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Kpi label="Tonight" sev="warn" icon={<BedDouble className="size-4" />}
          value={<AnimatedNumber value={95} format={v => Math.round(v) + '%'} className="text-[26px] font-bold text-slate-900" />}
          sub="190 / 200 rooms" delta={<Delta value="+25 pts" invert />} />
        <Kpi label="Tomorrow" sev="neutral" icon={<BedDouble className="size-4" />}
          value={<AnimatedNumber value={92} format={v => Math.round(v) + '%'} className="text-[26px] font-bold text-slate-900" />}
          sub="Storm clears · residual surge" delta={<Delta value="+22 pts" invert />} />
        <Kpi label="Forecast ADR" sev="ok" icon={<TrendingUp className="size-4" />}
          value={<AnimatedNumber value={265} format={v => '$' + Math.round(v)} className="text-[26px] font-bold text-slate-900" />}
          sub="Optimized pricing active" delta={<Delta value="+32.5%" />} />
        <Kpi label="Forecast RevPAR" sev="ok" icon={<TrendingUp className="size-4" />}
          value={<AnimatedNumber value={251.75} format={v => '$' + Math.round(v)} className="text-[26px] font-bold text-slate-900" />}
          sub="vs $140 last Tuesday" delta={<Delta value="+79.8%" />} />
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="surface p-4">
            <div className="flex items-center justify-between mb-1">
              <SectionHead title="Occupancy forecast" sub="Confidence-weighted · ensemble v2.4.1 · P50 band shown" />
              <Badge sev="info">7,412 booking signals · 12 sources</Badge>
            </div>
            <LineChart
              height={220}
              labels={labels}
              area
              highlight={7}
              events={[{ i: 11, label: 'Wine Festival' }, { i: 7, label: 'Storm' }]}
              series={[{ data: occData, color: '#10B981', label: 'Occupancy %' }]}
              formatY={v => Math.round(v) + '%'}
            />
            <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" /> Demand event marker</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-px bg-sky-500 inline-block" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#0EA5E9 0 3px,transparent 3px 6px)' }} /> Today (Sep 8)</span>
              <span className="ml-auto">Error band ±3.2% · trained on 26 months</span>
            </div>
          </div>

          <div className="surface p-4">
            <SectionHead title="Daily detail" className="mb-3" />
            <div className="rounded-lg border border-slate-200 overflow-x-auto">
              <table className="w-full text-[12.5px] min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50">
                    {['Date', 'Occupancy', 'ADR', 'RevPAR', 'Demand driver'].map((h, i) => (
                      <th key={i} className={cn('px-3.5 py-2.5 text-left text-[10px] font-bold tracking-[0.12em] text-slate-500 uppercase', i > 0 && i < 4 && 'text-right')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FORECAST_DAYS.slice(6, 14).map((d, i) => {
                    const today = d.d === 'Sep 8';
                    const drv = d.d === 'Sep 8' ? 'Storm surge · on-property demand'
                      : d.d === 'Sep 10' ? 'Conference checkout'
                      : d.d === 'Sep 12' ? 'Wine Festival compression' : 'Organic leisure';
                    return (
                      <tr key={i} className={cn('border-t border-slate-200 transition-colors', today ? 'bg-emerald-50/50' : 'hover:bg-slate-50')}>
                        <td className={cn('px-3.5 py-2.5 font-semibold', today ? 'text-emerald-600' : 'text-slate-900')}>{d.d}{today && ' · today'}</td>
                        <td className="px-3.5 py-2.5 text-right">
                          <span className={cn('tnum font-bold', d.occ >= 90 ? 'text-amber-600' : 'text-slate-900')}>{d.occ}%</span>
                        </td>
                        <td className="px-3.5 py-2.5 text-right tnum text-slate-600">${d.adr}</td>
                        <td className="px-3.5 py-2.5 text-right tnum text-slate-600">${Math.round(d.adr * d.occ / 100)}</td>
                        <td className="px-3.5 py-2.5 text-slate-600 text-[11.5px]">{drv}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="surface p-4">
            <SectionHead title="Segment mix — tonight" className="mb-3" />
            <Donut centerValue="95%" centerLabel="Occupied" segments={[
              { label: 'Leisure', value: 62, color: '#10B981' },
              { label: 'Corporate', value: 22, color: '#38BDF8' },
              { label: 'Group', value: 16, color: '#F59E0B' },
            ]} />
          </div>

          <div className="surface p-4">
            <SectionHead title="Booking channel pace" className="mb-3" />
            {[
              { c: 'Direct', v: 44, delta: '+6 pts' },
              { c: 'OTA', v: 38, delta: '+1 pt' },
              { c: 'GDS / Corporate', v: 18, delta: '−4 pts' },
            ].map(ch => (
              <div key={ch.c} className="flex items-center gap-3 mb-2.5 last:mb-0">
                <span className="w-28 text-[11.5px] text-slate-600">{ch.c}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500 transition-all duration-700" style={{ width: `${ch.v}%` }} />
                </div>
                <span className="text-[11px] font-bold tnum text-slate-900 w-8 text-right">{ch.v}%</span>
                <span className="text-[10px] text-slate-500 w-12 text-right tnum">{ch.delta}</span>
              </div>
            ))}
          </div>

          <div className="surface p-4">
            <SectionHead title="Demand drivers" className="mb-3" />
            <div className="space-y-3">
              {drivers.map((d, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="size-8 rounded-lg border border-slate-200 bg-slate-50 shadow-sm flex items-center justify-center shrink-0"><d.icon className={cn('size-4', d.c)} /></span>
                  <div>
                    <p className="text-[12px] font-semibold text-slate-900 leading-snug"><span className="text-slate-500 font-mono text-[10px] mr-1.5">{d.d}</span>{d.t}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{d.i}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-[13px] font-bold text-slate-900">What if tonight hits 100%?</p>
            <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">The Sandbox shows service quality breaks at 97%+. Model recommends fencing at 95%.</p>
            <Btn variant="outline" size="sm" className="mt-3" onClick={() => navigate('sandbox')}>Open Sandbox <ArrowRight className="size-3.5" /></Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
