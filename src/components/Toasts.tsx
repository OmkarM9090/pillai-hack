import { useEffect } from 'react';
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useApp, type Toast } from '@/store/app';

const ICONS = { success: CheckCircle2, info: Info, warn: TriangleAlert, error: XCircle };
const COLORS = { success: 'text-emerald-500', info: 'text-sky-500', warn: 'text-amber-500', error: 'text-rose-500' };
const BAR = { success: 'bg-emerald-500', info: 'bg-sky-500', warn: 'bg-amber-500', error: 'bg-rose-500' };

function ToastItem({ toast }: { toast: Toast }) {
  const { dismissToast } = useApp();
  useEffect(() => {
    const id = setTimeout(() => dismissToast(toast.id), 4600);
    return () => clearTimeout(id);
  }, [toast.id, dismissToast]);
  const Icon = ICONS[toast.kind];
  return (
    <div className="w-[340px] rounded-xl border border-slate-200 bg-white/95 backdrop-blur shadow-2xl shadow-slate-300/50 overflow-hidden animate-slide-left">
      <div className="flex items-start gap-3 p-3.5">
        <Icon className={cn('size-4.5 shrink-0 mt-0.5', COLORS[toast.kind])} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-slate-900">{toast.title}</p>
          {toast.msg && <p className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed">{toast.msg}</p>}
        </div>
        <button onClick={() => dismissToast(toast.id)} className="text-slate-500 hover:text-slate-900 transition-colors">
          <X className="size-3.5" />
        </button>
      </div>
      <div className={cn('h-[2px] w-full opacity-70', BAR[toast.kind])} />
    </div>
  );
}

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="fixed top-[72px] right-5 z-[90] flex flex-col gap-2 items-end">
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}
