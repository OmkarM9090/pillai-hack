import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

// ─── Severity palette ────────────────────────────────────────
export type Sev = 'ok' | 'warn' | 'crit' | 'info' | 'neutral';

export const SEV: Record<Sev, { text: string; bg: string; border: string; dot: string; bar: string }> = {
  ok: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', bar: '#10B981' },
  warn: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', bar: '#F59E0B' },
  crit: { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500', bar: '#E11D48' },
  info: { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', dot: 'bg-sky-500', bar: '#0284C7' },
  neutral: { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-400', bar: '#64748B' },
};

export const sevFromRisk = (r: string): Sev => (r === 'HIGH' ? 'crit' : r === 'MODERATE' ? 'warn' : 'ok');

// ─── Buttons ─────────────────────────────────────────────────
type BtnVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warnSoft';
export function Btn({
  children, variant = 'outline', size = 'md', className, loading, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md' | 'xs'; loading?: boolean }) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all duration-200 active:scale-95 select-none whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none';
  const sizes = { xs: 'h-7 px-2.5 text-[11px]', sm: 'h-8 px-3 text-xs', md: 'h-9 px-4 text-[13px]' };
  const variants: Record<BtnVariant, string> = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm',
    ghost: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
    danger: 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 shadow-sm',
    warnSoft: 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 shadow-sm',
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], loading && 'opacity-70 pointer-events-none', className)} {...rest}>
      {loading && <span className="size-3 rounded-full border-2 border-current border-t-transparent animate-spin" />}
      {children}
    </button>
  );
}

// ─── Badges / chips ──────────────────────────────────────────
export function Badge({ sev = 'neutral', children, className, pulse }: { sev?: Sev; children: ReactNode; className?: string; pulse?: boolean }) {
  const s = SEV[sev];
  return (
    <span className={cn('inline-flex items-center gap-1.5 h-[22px] px-2 rounded-md border text-[10.5px] font-semibold tracking-wide uppercase', s.bg, s.border, s.text, className)}>
      <span className={cn('size-1.5 rounded-full', s.dot, pulse && 'animate-pulse-dot')} />
      {children}
    </span>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center h-[22px] px-2 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600', className)}>
      {children}
    </span>
  );
}

// ─── Delta indicator ─────────────────────────────────────────
export function Delta({ value, invert, className, suffix }: { value: string; invert?: boolean; className?: string; suffix?: string }) {
  const negative = value.trim().startsWith('-') || value.trim().startsWith('−');
  const flat = value === '0' || value === '0%';
  const good = flat ? undefined : invert ? negative : !negative;
  const Icon = flat ? Minus : negative ? ArrowDownRight : ArrowUpRight;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-[11px] font-semibold tnum',
      flat ? 'text-slate-400' : good ? 'text-emerald-600' : 'text-rose-600', className,
    )}>
      <Icon className="size-3" strokeWidth={2.5} />
      {value.replace('−', '')}{suffix}
    </span>
  );
}

// ─── Animated number ─────────────────────────────────────────
export function AnimatedNumber({ value, format, duration = 700, className }: { value: number; format: (v: number) => string; duration?: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    const t0 = performance.now();
    cancelAnimationFrame(rafRef.current);
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - k, 3);
      setDisplay(from + (value - from) * e);
      if (k < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);
  return <span className={cn('tnum', className)}>{format(display)}</span>;
}

// ─── Bar gauge (zones + needle) ──────────────────────────────
export function BarGauge({ value, max = 100, thresholds = [45, 70], height = 6, showNeedle = true }: {
  value: number; max?: number; thresholds?: [number, number] | number[]; height?: number; showNeedle?: boolean;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const color = value >= (thresholds[1] ?? 70) ? '#F43F5E' : value >= (thresholds[0] ?? 45) ? '#F59E0B' : '#10B981';
  return (
    <div className="relative w-full" style={{ height }}>
      <div className="absolute inset-0 rounded-full bg-edge/70 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: color }} />
      </div>
      {thresholds.filter(t => t <= max).map((t, i) => (
        <div key={i} className="absolute top-[-2px] bottom-[-2px] w-px bg-white/25" style={{ left: `${(t / max) * 100}%` }} />
      ))}
      {showNeedle && (
        <div className="absolute top-1/2 -translate-y-1/2 size-[9px] rounded-full bg-white border-2 transition-all duration-700 ease-out"
          style={{ left: `calc(${pct}% - 5px)`, borderColor: color, boxShadow: '0 0 6px rgba(0,0,0,.6)' }} />
      )}
    </div>
  );
}

// ─── Progress bar ────────────────────────────────────────────
export function Progress({ value, color = '#10B981', className }: { value: number; color?: string; className?: string }) {
  return (
    <div className={cn('h-1.5 w-full rounded-full bg-edge/70 overflow-hidden', className)}>
      <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────
export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const sizes = { sm: 'size-6 text-[9px]', md: 'size-8 text-[11px]', lg: 'size-10 text-[13px]' };
  return (
    <span className={cn('inline-flex items-center justify-center rounded-full font-bold bg-slate-100 border border-slate-200 text-slate-700 shrink-0', sizes[size], className)}>
      {initials}
    </span>
  );
}

// ─── Section heading ─────────────────────────────────────────
export function SectionHead({ title, sub, right, className }: { title: string; sub?: string; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div>
        <h2 className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">{title}</h2>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

// ─── Confidence meter ────────────────────────────────────────
export function Confidence({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative size-8">
        <svg viewBox="0 0 32 32" className="size-8 -rotate-90">
          <circle cx="16" cy="16" r="13" fill="none" stroke="#E2E8F0" strokeWidth="4" />
          <circle cx="16" cy="16" r="13" fill="none" stroke={value >= 85 ? '#10B981' : value >= 75 ? '#F59E0B' : '#E11D48'} strokeWidth="4"
            strokeLinecap="round" strokeDasharray={`${(value / 100) * 81.7} 81.7`} className="transition-all duration-700" />
        </svg>
      </span>
      <span className="text-xs font-bold tnum text-slate-900">{value}%</span>
    </span>
  );
}

// ─── Empty state ─────────────────────────────────────────────
export function EmptyState({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <span className="text-emerald-500">{icon}</span>
      <p className="text-xs font-semibold text-slate-600">{title}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── Skeleton card ───────────────────────────────────────────
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="surface p-4 space-y-3">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-6 w-2/3" />
      {Array.from({ length: lines - 2 }).map((_, i) => (
        <div key={i} className="skeleton h-3 w-full" />
      ))}
    </div>
  );
}

// ─── Screen header ───────────────────────────────────────────
export function ScreenHeader({ title, sub, right, eyebrow }: { title: string; sub: string; right?: ReactNode; eyebrow?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6 animate-fade-in">
      <div>
        {eyebrow && <p className="text-[10.5px] font-bold tracking-[0.2em] text-emerald-600 uppercase mb-1.5">{eyebrow}</p>}
        <h1 className="text-[24px] font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="text-[13px] text-slate-600 mt-1">{sub}</p>
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}

// ─── KPI card ────────────────────────────────────────────────
export function Kpi({ label, value, sub, delta, sev = 'neutral', icon, spark, onClick }: {
  label: string; value: ReactNode; sub: string; delta?: ReactNode; sev?: Sev; icon: ReactNode; spark?: ReactNode; onClick?: () => void;
}) {
  const s = SEV[sev];
  return (
    <div onClick={onClick} className={cn('surface p-4 relative overflow-hidden group transition-all duration-200', onClick && 'cursor-pointer hover:shadow-md hover:border-slate-300')}>
      <div className={cn('absolute left-0 top-3 bottom-3 w-[3px] rounded-r', s.dot)} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">{label}</p>
        <span className={cn('text-slate-400 group-hover:text-slate-600 transition-colors', s.text)}>{icon}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2 text-slate-900">{value}</div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="text-[12px] text-slate-500">{sub}</p>
        {delta}
      </div>
      {spark && <div className="mt-2 -mb-1">{spark}</div>}
    </div>
  );
}
