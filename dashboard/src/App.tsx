import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TrafficTable from './components/TrafficTable';
import ReportEditor from './components/ReportEditor';
import LoginPage from './components/LoginPage';
import { type Incident } from './types';
import './App.css';

function App() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const user = localStorage.getItem('chat_dashboard_user');
    const token = localStorage.getItem('chat_dashboard_token');
    if (user && token) {
      setIsAuthenticated(true);
      setCurrentUser(user);
    }
  }, []);

  const handleLoginSuccess = (user: string, token: string) => {
    localStorage.setItem('chat_dashboard_user', user);
    localStorage.setItem('chat_dashboard_token', token);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_dashboard_user');
    localStorage.removeItem('chat_dashboard_token');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncidentId(incident.incident_id);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-6 py-3 shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined text-3xl">shield_with_heart</span>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">CyberGuard Dash</h2>
          </div>
          <nav className="flex items-center gap-6">
            
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input className="w-64 rounded-lg border-none bg-slate-100 dark:bg-slate-800 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500 focus:outline-none" placeholder="Search incidents..." type="text" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold hidden md:block">{currentUser}</span>
            <button
              onClick={handleLogout}
              className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 transition-colors"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-primary text-xl hover:text-red-500">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedIncidentId={selectedIncidentId}
          onSelectIncident={handleSelectIncident}
        />

        {/* Main Content: Split Vertical */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-background-dark/50">
          <TrafficTable incidentId={selectedIncidentId} />
          <ReportEditor incidentId={selectedIncidentId} />
        </div>
      </main>
    </div>
  );
}

export default App;
