import { cn } from '@/utils/cn';
import { useApp } from '@/store/app';

export type Dept = 'Housekeeping' | 'Front Desk' | 'F&B' | 'Spa' | 'Operations';

export const DEPT_STYLE: Record<Dept, { bg: string; border: string; text: string; hex: string }> = {
  Housekeeping: { bg: 'bg-sky-500/15', border: 'border-sky-500/40', text: 'text-sky-300', hex: '#38BDF8' },
  'Front Desk': { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-300', hex: '#10B981' },
  'F&B': { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-300', hex: '#F59E0B' },
  Spa: { bg: 'bg-violet-500/15', border: 'border-violet-500/40', text: 'text-violet-300', hex: '#8B5CF6' },
  Operations: { bg: 'bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-300', hex: '#F43F5E' },
};

export const TIMES = ['08 AM', '10 AM', '12 PM', '02 PM', '04 PM', '06 PM', '08 PM', '10 PM'];

export interface Block { start: number; span: number; dept: Dept; kind?: 'reassigned'; label?: string }
export interface Emp { name: string; role: string; dept: Dept; blocks: Block[]; afterBlocks?: Block[] }

export function ScheduleGrid({ staff, after, className }: { staff: Emp[], after: boolean; className?: string }) {
  const groups: { dept: Dept; emps: Emp[] }[] = (['Housekeeping', 'Front Desk', 'F&B', 'Spa'] as Dept[]).map(d => ({
    dept: d, emps: staff.filter(e => e.dept === d),
  }));

  return (
    <div className={cn('rounded-lg border border-edge overflow-x-auto', className)}>
      <div className="min-w-[700px]">
      {/* Time header */}
      <div className="grid bg-card2/80 border-b border-edge" style={{ gridTemplateColumns: '170px 1fr' }}>
        <div className="px-3 py-2 text-[9.5px] font-bold uppercase tracking-wider text-faint">Employee</div>
        <div className="grid grid-cols-8">
          {TIMES.map(t => <div key={t} className="py-2 text-center text-[9.5px] font-bold tnum text-faint border-l border-edge">{t}</div>)}
        </div>
      </div>

      {groups.map(g => (
        <div key={g.dept}>
          <div className="grid border-b border-edge bg-card/50" style={{ gridTemplateColumns: '170px 1fr' }}>
            <div className="px-3 py-1.5 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full" style={{ background: DEPT_STYLE[g.dept].hex }} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-mute">{g.dept}</span>
            </div>
            <div className="border-l border-edge" />
          </div>
          {g.emps.map(e => {
            const blocks = after && e.afterBlocks && e.afterBlocks.length > 0 ? e.afterBlocks : e.blocks;
            return (
              <div key={e.name} className="grid border-b border-edge/60 hover:bg-card/40 transition-colors" style={{ gridTemplateColumns: '170px 1fr' }}>
                <div className="px-3 py-1.5 leading-tight">
                  <p className="text-[11.5px] font-semibold text-mist">{e.name}</p>
                  <p className="text-[9px] text-faint">{e.role}</p>
                </div>
                <div className="relative border-l border-edge/60 h-[38px]">
                  <div className="absolute inset-0 grid grid-cols-8">
                    {TIMES.map((_, i) => <div key={i} className={cn(i > 0 && "border-l border-edge/40")} />)}
                  </div>
                  {blocks.map((b, bi) => {
                    const s = DEPT_STYLE[b.dept];
                    return (
                      <div key={bi}
                        className={cn('absolute top-1/2 -translate-y-1/2 h-[22px] rounded-md border flex items-center px-2 overflow-hidden',
                          s.bg, b.kind === 'reassigned' ? 'border-dashed border-emerald-400/60 bg-emerald-500/10' : s.border)}
                        style={{ left: `calc(${(b.start / 8) * 100}% + 3px)`, width: `calc(${(b.span / 8) * 100}% - 6px)` }}
                        title={`${e.name} · ${b.label ?? b.dept} · ${TIMES[b.start]}–${TIMES[Math.min(7, b.start + b.span - 1)]}`}>
                        <span className={cn('text-[9px] font-bold truncate', b.kind === 'reassigned' ? 'text-emerald-300' : s.text)}>
                          {b.label ?? b.dept}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {/* Coverage row for Housekeeping */}
          {g.dept === 'Housekeeping' && (
            <div className="grid border-b border-edge" style={{ gridTemplateColumns: '170px 1fr' }}>
              <div className="px-3 py-1.5 leading-tight">
                <p className="text-[11.5px] font-semibold text-mute">HK coverage vs demand</p>
                <p className="text-[9px] text-faint">{after ? 'After ACT-2048' : 'Current plan · tonight'}</p>
              </div>
              <div className="relative border-l border-edge h-[38px]">
                <div className="absolute inset-0 grid grid-cols-8">
                  {TIMES.map((_, i) => <div key={i} className={cn(i > 0 && "border-l border-edge/40")} />)}
                </div>
                {after ? (
                  <div className="absolute top-1/2 -translate-y-1/2 h-[22px] rounded-md border border-emerald-500/50 bg-emerald-500/10 flex items-center px-2"
                    style={{ left: 'calc(37.5% + 3px)', width: 'calc(62.5% - 6px)' }}>
                    <span className="text-[9px] font-bold text-emerald-300">COVERED · +3 cross-trained staff</span>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-1/2 -translate-y-1/2 h-[22px] rounded-md border border-sky-500/30 bg-sky-500/8 flex items-center px-2"
                      style={{ left: 'calc(0% + 3px)', width: 'calc(37.5% - 6px)' }}>
                      <span className="text-[9px] font-bold text-sky-300/80">COVERED</span>
                    </div>
                    <div className="hatch absolute top-1/2 -translate-y-1/2 h-[22px] rounded-md flex items-center px-2 animate-pulse-dot"
                      style={{ left: 'calc(37.5% + 3px)', width: 'calc(62.5% - 6px)' }}>
                      <span className="text-[9px] font-bold text-rose-300">SHORTAGE · −3 FTE vs 190-room demand</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}

export function ScheduleLegend() {
  const { actions } = useApp();
  const optimized = ['approved', 'queued'].includes(actions.find(a => a.id === 'ACT-2048')?.status ?? '');
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-mute">
      {(Object.keys(DEPT_STYLE) as Dept[]).map(d => (
        <span key={d} className="flex items-center gap-1.5">
          <span className="w-2.5 h-1.5 rounded-sm" style={{ background: DEPT_STYLE[d].hex }} />{d}
        </span>
      ))}
      <span className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 rounded-sm border border-dashed border-emerald-400" /> Cross-trained (XT)</span>
      <span className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 rounded-sm bg-rose-500/40" /> Shortage</span>
      <span className="ml-auto font-mono text-[9.5px] text-faint">{optimized ? 'OPTIMIZED PLAN APPLIED · ACT-2048' : 'CURRENT PLAN · OPTIMIZATION PENDING'}</span>
    </div>
  );
}
