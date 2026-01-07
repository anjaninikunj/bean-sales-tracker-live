import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, ShoppingCart, Leaf, Cloud, CloudOff, ShieldCheck } from 'lucide-react';
import OrderForm from './components/OrderForm';
import Reports from './components/Reports';
import Dashboard from './components/Dashboard';

const SidebarLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-emerald-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const Navigation = () => {
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'loading'>('loading');
  
  const getApiUrl = () => {
    try {
      const env = (import.meta as any).env;
      return (env && env.VITE_API_URL) || 'http://localhost:3001';
    } catch (e) {
      return 'http://localhost:3001';
    }
  };
  
  const API_BASE_URL = getApiUrl();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        if (res.ok) {
          const data = await res.json();
          setDbStatus(data.status === 'connected' ? 'connected' : 'loading');
        } else {
          setDbStatus('error');
        }
      } catch (e) {
        setDbStatus('error');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [API_BASE_URL]);

  return (
    <nav className="bg-white border-r border-slate-200 w-64 min-h-screen p-6 hidden md:flex flex-col">
      <div className="flex items-center space-x-2 mb-10 text-emerald-700">
        <Leaf className="fill-emerald-600" size={32} />
        <h1 className="text-xl font-bold tracking-tight">BeanTracker</h1>
      </div>
      
      <div className="space-y-2 flex-1">
        <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
        <SidebarLink to="/order" icon={ShoppingCart} label="Sales Entry" />
        <SidebarLink to="/reports" icon={FileText} label="Reports" />
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-100">
        <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
          dbStatus === 'connected' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'
        }`}>
          {dbStatus === 'connected' ? <Cloud size={18} /> : <CloudOff size={18} />}
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest">Azure Cloud</span>
            <span className="text-xs font-bold">{dbStatus === 'connected' ? 'Live & Synced' : 'Connecting...'}</span>
          </div>
        </div>

        <div className="px-4 py-2 bg-slate-50 rounded-lg flex items-center space-x-2">
           <ShieldCheck size={12} className="text-slate-400" />
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">v1.3.2 Stable</span>
        </div>
      </div>
    </nav>
  );
};

const MobileNav = () => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50">
    <Link to="/" className="flex flex-col items-center text-slate-500 text-xs">
      <LayoutDashboard size={24} />
      <span>Dash</span>
    </Link>
    <Link to="/order" className="flex flex-col items-center text-emerald-600 text-xs font-bold">
      <ShoppingCart size={24} />
      <span>New Order</span>
    </Link>
    <Link to="/reports" className="flex flex-col items-center text-slate-500 text-xs">
      <FileText size={24} />
      <span>Reports</span>
    </Link>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Navigation />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/order" element={<OrderForm />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
        <MobileNav />
      </div>
    </HashRouter>
  );
};

export default App;