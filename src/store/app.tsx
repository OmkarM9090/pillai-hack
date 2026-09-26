import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ACTION_TASKS, BASE_PARAMS, computeScenario, INITIAL_ACTIONS, INITIAL_TASKS,
  type ActionItem, type ScenarioParams, type ScreenId, type SimResult, type Task, type TaskStatus,
} from '@/data/model';

export type ToastKind = 'success' | 'info' | 'warn' | 'error';
export interface Toast { id: number; kind: ToastKind; title: string; msg?: string }
export type SimPhase = 'idle' | 'running' | 'updated';

interface AppState {
  screen: ScreenId;
  navigate: (s: ScreenId) => void;

  draft: ScenarioParams;
  setDraft: (p: Partial<ScenarioParams>) => void;
  applied: ScenarioParams;
  result: SimResult;
  baseResult: SimResult;
  dirty: boolean;
  phase: SimPhase;
  lastRun: string | null;
  runSimulation: () => void;
  resetBaseline: () => void;
  presetSurge: () => void;

  actions: ActionItem[];
  approveAction: (id: string) => void;
  modifyAndApprove: (id: string, note: string) => void;
  rejectAction: (id: string) => void;
  restoreAction: (id: string) => void;
  approveAll: () => void;
  pendingCount: number;

  tasks: Task[];
  moveTask: (id: string, s: TaskStatus) => void;
  addTask: (t: Task) => void;
  hasTask: (id: string) => boolean;
  openTaskIds: number;

  toasts: Toast[];
  pushToast: (kind: ToastKind, title: string, msg?: string) => void;
  dismissToast: (id: number) => void;

  assistantOpen: boolean;
  setAssistantOpen: (v: boolean) => void;

  alertState: 'open' | 'approved' | 'dismissed';
  setAlertState: (v: 'open' | 'approved' | 'dismissed') => void;

  resolvedReviews: Set<string>;
  resolveReview: (id: string) => void;

  now: Date;

  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean | ((p: boolean) => boolean)) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean | ((p: boolean) => boolean)) => void;
}

const Ctx = createContext<AppState | null>(null);

const BOOT = new Date(2026, 8, 8, 9, 17, 0); // Sep 8 2026 · 09:17 AM
const stamp = (d: Date) => {
  let h = d.getHours(); const m = d.getMinutes(); const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenId>('overview');
  const [draft, setDraftState] = useState<ScenarioParams>(BASE_PARAMS);
  const [applied, setApplied] = useState<ScenarioParams>(BASE_PARAMS);
  const [result, setResult] = useState<SimResult>(BASE_RESULT);
  const [baseResult] = useState<SimResult>(BASE_RESULT);
  const [phase, setPhase] = useState<SimPhase>('idle');
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [actions, setActions] = useState<ActionItem[]>(INITIAL_ACTIONS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [alertState, setAlertState] = useState<'open' | 'approved' | 'dismissed'>('open');
  const [resolvedReviews, setResolvedReviews] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toastId = useRef(0);
  const timers = useRef<number[]>([]);

  const now = useMemo(() => BOOT, []);

  const navigate = useCallback((s: ScreenId) => {
    setScreen(s);
    setMobileMenuOpen(false); // Auto-close mobile menu on navigation
  }, []);

  const pushToast = useCallback((kind: ToastKind, title: string, msg?: string) => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, kind, title, msg }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const setDraft = useCallback((p: Partial<ScenarioParams>) => {
    setDraftState(d => ({ ...d, ...p }));
  }, []);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const latestDraft = useRef(draft);
  latestDraft.current = draft;

  const runSimulation = useCallback(async () => {
    setPhase('running');
    try {
      const response = await fetch('http://localhost:5000/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occupancy: latestDraft.current.occupancy,
          weather: latestDraft.current.weather,
          inflation: latestDraft.current.inflation
        })
      });
      const data = await response.json();
      
      setResult(prev => ({
        ...prev,
        occupancy: latestDraft.current.occupancy,
        occupiedRooms: Math.round(200 * latestDraft.current.occupancy),
        goppar: data.goppar,
        hkDelayMin: data.housekeepingDelay * 60, // API sends hours, map to mins
        diningWaitMin: data.fbWaitTimes,
        burnout: data.burnoutRisk,
        risk: data.status === 'CRITICAL' ? 'HIGH' : (data.status === 'LOW_DEMAND' ? 'LOW' : 'MODERATE')
      }));
      
      setApplied({ ...latestDraft.current });
      setPhase('updated');
      setLastRun(stamp(new Date(BOOT.getTime() + 5 * 60000)));
      pushToast('success', 'Scenario updated via AI Core', 'Operational impact dynamically calculated by ML Engine.');
      later(2600, () => setPhase(p => (p === 'updated' ? 'idle' : p)));
    } catch (e) {
      console.error(e);
      pushToast('error', 'API Error', 'Could not reach Python ML backend. Is it running?');
      setPhase('idle');
    }
  }, [later, pushToast]);

  const resetBaseline = useCallback(() => {
    setDraftState(BASE_PARAMS);
    setApplied(BASE_PARAMS);
    setResult(BASE_RESULT);
    setPhase('idle');
    pushToast('info', 'Reset to baseline', '70% occupancy · Sunny · 0% inflation.');
  }, [pushToast]);

  const presetSurge = useCallback(() => {
    const p = { occupancy: 0.95, weather: 'stormy' as const, inflation: 25 };
    setDraftState(p);
    navigate('sandbox');
  }, [navigate]);

  const spawnTask = useCallback((actionId: string) => {
    const t = ACTION_TASKS[actionId];
    if (!t) return;
    setTasks(prev => (prev.some(x => x.id === t.id) ? prev : [t, ...prev]));
  }, []);

  const approveAction = useCallback((id: string) => {
    setActions(prev => {
      const a = prev.find(x => x.id === id);
      if (!a || a.status !== 'pending') return prev;
      pushToast('success', 'Action approved', a.approveMsg + ' — Sarah Morgan.');
      later(1400, () => {
        setActions(p2 => p2.map(x => (x.id === id && x.status === 'approved' ? { ...x, status: 'queued' } : x)));
        spawnTask(id);
        pushToast('info', 'Execution queued', a.queuedMsg);
      });
      return prev.map(x => (x.id === id
        ? { ...x, status: 'approved', approvedBy: 'Sarah Morgan', approvedAt: stamp(new Date(BOOT.getTime() + 5 * 60000)) }
        : x));
    });
  }, [later, pushToast, spawnTask]);

  const modifyAndApprove = useCallback((id: string, note: string) => {
    setActions(prev => {
      const a = prev.find(x => x.id === id);
      if (!a || a.status === 'rejected' || a.status === 'queued' || a.status === 'approved') return prev;
      pushToast('success', 'Approved with modifications', `${id} · ${note} — Sarah Morgan.`);
      later(1400, () => {
        setActions(p2 => p2.map(x => (x.id === id && x.status === 'approved' ? { ...x, status: 'queued' } : x)));
        spawnTask(id);
        if (ACTION_TASKS[id]) pushToast('info', 'Execution queued', a.queuedMsg);
      });
      return prev.map(x => (x.id === id ? {
        ...x, status: 'approved', approvedBy: 'Sarah Morgan', approvedAt: stamp(new Date(BOOT.getTime() + 6 * 60000)),
        detail: [{ label: 'Modification', value: note }, ...(x.detail ?? [])],
      } : x));
    });
  }, [later, pushToast, spawnTask]);

  const rejectAction = useCallback((id: string) => {
    setActions(prev => prev.map(x => (x.id === id && (x.status === 'pending' || x.status === 'manual') ? { ...x, status: 'rejected' } : x)));
    pushToast('warn', 'Action rejected', id + ' logged to decision audit.');
  }, [pushToast]);

  const restoreAction = useCallback((id: string) => {
    setActions(prev => prev.map(x => (x.id === id && x.status === 'rejected' ? { ...x, status: 'pending' } : x)));
    pushToast('info', 'Action restored', id + ' returned to the approval queue.');
  }, [pushToast]);

  const approveAll = useCallback(() => {
    const ids = ['ACT-2048', 'ACT-2049', 'ACT-2050'];
    setActions(prev => prev.map(x => (ids.includes(x.id) && x.status === 'pending'
      ? { ...x, status: 'approved', approvedBy: 'Sarah Morgan', approvedAt: stamp(new Date(BOOT.getTime() + 4 * 60000)) }
      : x)));
    setAlertState('approved');
    pushToast('success', 'All 3 actions approved', 'Approved by Sarah Morgan · execution queued.');
    later(1500, () => {
      setActions(prev => prev.map(x => (ids.includes(x.id) && x.status === 'approved' ? { ...x, status: 'queued' } : x)));
      ids.forEach(spawnTask);
      pushToast('info', '3 tasks created', 'OPS-105 · FNB-034 · REV-012 assigned to department queues.');
    });
  }, [later, pushToast, spawnTask]);

  const moveTask = useCallback((id: string, s: TaskStatus) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: s } : t)));
  }, []);

  const addTask = useCallback((t: Task) => {
    setTasks(prev => (prev.some(x => x.id === t.id) ? prev : [t, ...prev]));
  }, []);

  const hasTask = useCallback((id: string) => tasks.some(t => t.id === id), [tasks]);

  const resolveReview = useCallback((id: string) => {
    setResolvedReviews(prev => new Set(prev).add(id));
  }, []);

  const dirty = useMemo(
    () => draft.occupancy !== applied.occupancy || draft.weather !== applied.weather || draft.inflation !== applied.inflation,
    [draft, applied],
  );
  const pendingCount = actions.filter(a => a.status === 'pending').length;
  const openTaskIds = tasks.filter(t => t.status !== 'done').length;

  const value: AppState = {
    screen, navigate,
    draft, setDraft, applied, result, baseResult, dirty, phase, lastRun,
    runSimulation, resetBaseline, presetSurge,
    actions, approveAction, modifyAndApprove, rejectAction, restoreAction, approveAll, pendingCount,
    tasks, moveTask, addTask, hasTask, openTaskIds,
    toasts, pushToast, dismissToast,
    assistantOpen, setAssistantOpen,
    alertState, setAlertState,
    resolvedReviews, resolveReview,
    now,
    sidebarCollapsed, setSidebarCollapsed,
    mobileMenuOpen, setMobileMenuOpen,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside provider');
  return v;
}
