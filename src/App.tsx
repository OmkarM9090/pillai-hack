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

function Shell() {
  const { screen, mobileMenuOpen, setMobileMenuOpen } = useApp();
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
          {screen === 'overview' && <CommandCenter />}
          {screen === 'sandbox' && <Sandbox />}
          {screen === 'forecast' && <DemandForecast />}
          {screen === 'guests' && <GuestIntelligence />}
          {screen === 'actions' && <ActionPlan />}
          {screen === 'scheduler' && <StaffScheduler />}
          {screen === 'tasks' && <TaskBoard />}
          {screen === 'history' && <ScenarioHistory />}
          {screen === 'accuracy' && <FeedbackAccuracy />}
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
