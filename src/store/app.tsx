import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect, type ReactNode } from 'react';
import {
  ACTION_TASKS, BASE_PARAMS, BASE_RESULT,
  type ActionItem, type ScenarioParams, type ScreenId, type SimResult, type Task, type TaskStatus, type Review
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

  activeRole: string;
  setActiveRole: (role: string) => void;
  activeUserName: string;

  reviews: Review[];
  fetchReviews: () => Promise<void>;

  staff: any[];
  fetchStaff: () => Promise<void>;

  fetchTasks: () => Promise<void>;
  fetchActions: () => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

const BOOT = new Date(2026, 8, 8, 9, 17, 0); // Sep 8 2026 · 09:17 AM
const stamp = (d: Date) => {
  let h = d.getHours(); const m = d.getMinutes(); const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`;
};

export const ROLES = [
  { id: 'gm', name: 'General Manager', user: 'Sarah Morgan' },
  { id: 'ops', name: 'Operations Manager', user: 'David Chen' },
  { id: 'hk', name: 'Housekeeping Manager', user: 'Maria Garcia' },
  { id: 'fb', name: 'F&B Manager', user: 'Chef Gordon' },
  { id: 'eng', name: 'Engineering Manager', user: 'John Smith' },
  { id: 'staff', name: 'Staff', user: 'Alex' },
  { id: 'guest', name: 'Guest', user: 'Guest User' }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<string>('gm');
  const [screen, setScreen] = useState<ScreenId>('overview');
  const [draft, setDraftState] = useState<ScenarioParams>(BASE_PARAMS);
  const [applied, setApplied] = useState<ScenarioParams>(BASE_PARAMS);
  const [result, setResult] = useState<SimResult>(BASE_RESULT);
  const [baseResult] = useState<SimResult>(BASE_RESULT);
  const [phase, setPhase] = useState<SimPhase>('idle');
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [alertState, setAlertState] = useState<'open' | 'approved' | 'dismissed'>('open');
  const [resolvedReviews, setResolvedReviews] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toastId = useRef(0);
  const timers = useRef<number[]>([]);

  const now = useMemo(() => BOOT, []);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reviews', { headers: { 'x-user-role': activeRole } });
      if (res.ok) setReviews(await res.json());
    } catch (e) { console.error('Failed to fetch reviews', e); }
  }, [activeRole]);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/staff', { headers: { 'x-user-role': activeRole } });
      if (res.ok) setStaff(await res.json());
    } catch (e) { console.error('Failed to fetch staff', e); }
  }, [activeRole]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks', { headers: { 'x-user-role': activeRole } });
      if (res.ok) setTasks(await res.json());
    } catch (e) { console.error('Failed to fetch tasks', e); }
  }, [activeRole]);

  const fetchActions = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/plans', { headers: { 'x-user-role': activeRole } });
      if (res.ok) setActions(await res.json());
    } catch (e) { console.error('Failed to fetch actions', e); }
  }, [activeRole]);

  // Fetch initial data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchTasks();
        await fetchActions();
        await fetchReviews();
        await fetchStaff();
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    loadData();
  }, [fetchTasks, fetchActions, fetchReviews, fetchStaff]);

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

  const latestRole = useRef(activeRole);
  latestRole.current = activeRole;

  const runSimulation = useCallback(async () => {
    setPhase('running');
    try {
      const response = await fetch('http://localhost:5000/api/simulate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': latestRole.current
        },
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

  const spawnTask = useCallback(async (actionId: string) => {
    const t = ACTION_TASKS[actionId];
    if (!t) return;
    try {
      await fetch('http://localhost:5000/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': latestRole.current },
        body: JSON.stringify(t)
      });
      await fetchTasks();
    } catch (e) {
      console.error('Failed to spawn task', e);
    }
  }, [fetchTasks]);

  const approveAction = useCallback(async (id: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/approve-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': latestRole.current
        },
        body: JSON.stringify({ db_plan_id: id, decision: 'approved' })
      });
      if (!response.ok) throw new Error('API Error');
      
      setActions(prev => {
        const a = prev.find(x => x.id === id);
        if (!a || a.status !== 'pending') return prev;
        pushToast('success', 'Action approved via API', a.approveMsg + ' — Sarah Morgan.');
        later(1400, () => {
          setActions(p2 => p2.map(x => (x.id === id && x.status === 'approved' ? { ...x, status: 'queued' } : x)));
          spawnTask(id);
          pushToast('info', 'Execution queued', a.queuedMsg);
        });
        return prev.map(x => (x.id === id
          ? { ...x, status: 'approved', approvedBy: 'Sarah Morgan', approvedAt: stamp(new Date(BOOT.getTime() + 5 * 60000)) }
          : x));
      });
    } catch (e) {
      console.error(e);
      pushToast('error', 'API Error', 'Failed to approve action via backend.');
    }
  }, [later, pushToast, spawnTask]);

  const modifyAndApprove = useCallback(async (id: string, note: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/approve-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': latestRole.current },
        body: JSON.stringify({ db_plan_id: id, decision: 'approved', note })
      });
      if (!response.ok) throw new Error('API Error');

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
    } catch (e) {
      console.error(e);
      pushToast('error', 'API Error', 'Failed to approve action with modification via backend.');
    }
  }, [later, pushToast, spawnTask]);

  const rejectAction = useCallback(async (id: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/approve-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': latestRole.current },
        body: JSON.stringify({ db_plan_id: id, decision: 'rejected' })
      });
      if (!response.ok) throw new Error('API Error');
      setActions(prev => prev.map(x => (x.id === id && (x.status === 'pending' || x.status === 'manual') ? { ...x, status: 'rejected' } : x)));
      pushToast('warn', 'Action rejected', id + ' logged to decision audit.');
    } catch (e) {
      console.error(e);
      pushToast('error', 'API Error', 'Failed to reject action via backend.');
    }
  }, [pushToast]);

  const restoreAction = useCallback(async (id: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/approve-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': latestRole.current },
        body: JSON.stringify({ db_plan_id: id, decision: 'pending' })
      });
      if (!response.ok) throw new Error('API Error');
      setActions(prev => prev.map(x => (x.id === id && x.status === 'rejected' ? { ...x, status: 'pending' } : x)));
      pushToast('info', 'Action restored', id + ' returned to the approval queue.');
    } catch (e) {
      console.error(e);
      pushToast('error', 'API Error', 'Failed to restore action via backend.');
    }
  }, [pushToast]);

  const approveAll = useCallback(async () => {
    const ids = ['ACT-2048', 'ACT-2049', 'ACT-2050'];
    setAlertState('approved');
    pushToast('info', 'Approving...', 'Sending requests to backend API.');
    
    let successCount = 0;
    for (const id of ids) {
      try {
        const response = await fetch('http://localhost:5000/api/approve-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-role': latestRole.current },
          body: JSON.stringify({ db_plan_id: id, decision: 'approved' })
        });
        if (response.ok) {
          successCount++;
          setActions(prev => prev.map(x => (x.id === id ? { ...x, status: 'approved', approvedBy: 'Sarah Morgan', approvedAt: stamp(new Date()) } : x)));
        }
      } catch (err) {
        console.error("Failed to approve", id, err);
      }
    }
    
    if (successCount === ids.length) {
      pushToast('success', 'All 3 actions approved', 'Approved by Sarah Morgan · execution queued.');
      later(1500, () => {
        setActions(prev => prev.map(x => (ids.includes(x.id) && x.status === 'approved' ? { ...x, status: 'queued' } : x)));
        ids.forEach(spawnTask);
        pushToast('info', '3 tasks created', 'OPS-105 · FNB-034 · REV-012 assigned to department queues.');
      });
    } else {
      pushToast('warn', 'Partial Approval', `Only ${successCount}/3 actions were approved successfully.`);
    }
  }, [later, pushToast, spawnTask]);

  const moveTask = useCallback(async (id: string, s: TaskStatus) => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': latestRole.current },
        body: JSON.stringify({ task_id: id, status: s })
      });
      if (response.ok) {
        setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: s } : t)));
      }
    } catch (err) {
      console.error("Failed to move task", err);
      pushToast('error', 'API Error', 'Failed to update task status in backend.');
    }
  }, [pushToast]);

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

  const activeUserName = useMemo(() => ROLES.find(r => r.id === activeRole)?.user || 'Unknown', [activeRole]);

  const value: AppState = {
    screen, navigate,
    draft, setDraft, applied, result, baseResult, dirty, phase, lastRun,
    runSimulation, resetBaseline, presetSurge,
    actions, approveAction, modifyAndApprove, rejectAction, restoreAction, approveAll, pendingCount,
    tasks, moveTask, hasTask, openTaskIds,
    toasts, pushToast, dismissToast,
    assistantOpen, setAssistantOpen,
    alertState, setAlertState,
    resolvedReviews, resolveReview,
    now,
    sidebarCollapsed, setSidebarCollapsed,
    mobileMenuOpen, setMobileMenuOpen,
    activeRole, setActiveRole, activeUserName,
    reviews, fetchReviews,
    staff, fetchStaff,
    fetchTasks, fetchActions,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside provider');
  return v;
}
