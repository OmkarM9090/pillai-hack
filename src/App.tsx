import { AppProvider, useApp } from '@/store/app';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { AIAssistant } from '@/components/AIAssistant';
import { Toasts } from '@/components/Toasts';
import { CommandCenter } from '@/screens/CommandCenter';
import { Sandbox } from '@/screens/Sandbox';
import { DemandForecast } from '@/screens/DemandForecast';
import { GuestIntelligence } from '@/screens/GuestIntelligence';
import { ActionPlan } from '@/screens/ActionPlan';
import { StaffScheduler } from '@/screens/StaffScheduler';
import { TaskBoard } from '@/screens/TaskBoard';
import { ScenarioHistory } from '@/screens/ScenarioHistory';
import { FeedbackAccuracy } from '@/screens/FeedbackAccuracy';

const routePermissions = {
  overview: ['gm', 'ops', 'hk', 'fb', 'eng'],
  sandbox: ['gm', 'ops'],
  forecast: ['gm', 'ops'],
  guests: ['gm', 'ops'],
  actions: ['gm', 'ops', 'fb'],
  scheduler: ['gm', 'ops', 'hk', 'fb', 'eng'],
  tasks: ['gm', 'ops', 'hk', 'fb', 'eng', 'staff'],
  history: ['gm', 'ops'],
  accuracy: ['gm', 'ops']
};

function Shell() {
  const { screen, mobileMenuOpen, setMobileMenuOpen, activeRole } = useApp();
  const isAllowed = routePermissions[screen as keyof typeof routePermissions]?.includes(activeRole);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50 text-slate-900">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto" key={screen}>
          {activeRole === 'guest' ? (
            <div className="p-8 flex flex-col items-center justify-center h-full text-slate-500">
              <h2 className="text-xl font-bold mb-2 text-slate-700">Guest Portal</h2>
              <p>Welcome to your stay. Guest self-service features are under construction.</p>
            </div>
          ) : isAllowed ? (
            <>
              {screen === 'overview' && <CommandCenter />}
              {screen === 'sandbox' && <Sandbox />}
              {screen === 'forecast' && <DemandForecast />}
              {screen === 'guests' && <GuestIntelligence />}
              {screen === 'actions' && <ActionPlan />}
              {screen === 'scheduler' && <StaffScheduler />}
              {screen === 'tasks' && <TaskBoard />}
              {screen === 'history' && <ScenarioHistory />}
              {screen === 'accuracy' && <FeedbackAccuracy />}
            </>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center h-full text-slate-500">
              <h2 className="text-xl font-bold mb-2 text-slate-700">Access Denied</h2>
              <p>Your current role does not have permission to view this section.</p>
            </div>
          )}
        </main>
      </div>
      <AIAssistant />
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
