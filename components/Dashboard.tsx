import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, CheckCircle2, Clock, ArrowUpRight, Leaf, Users, MapPin, Server } from 'lucide-react';
import { getOrders } from '../services/storage';
import { SaleOrder, PaymentStatus } from '../types';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const metrics = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const paidAmount = orders.filter(o => o.paymentStatus === PaymentStatus.PAID).reduce((sum, o) => sum + o.totalPrice, 0);
    const pendingAmount = orders.filter(o => o.paymentStatus === PaymentStatus.PENDING).reduce((sum, o) => sum + o.totalPrice, 0);
    const totalQty = orders.reduce((sum, o) => sum + o.quantity, 0);
    const uniqueCustomers = new Set(orders.map(o => o.customerName)).size;
    return { totalSales, paidAmount, pendingAmount, totalQty, uniqueCustomers };
  }, [orders]);

  const trendData = useMemo(() => {
    const data: Record<string, number> = {};
    orders.forEach(o => {
      data[o.date] = (data[o.date] || 0) + o.totalPrice;
    });
    return Object.entries(data)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-10)
      .map(([date, value]) => ({ 
        date: date.split('-').slice(1).reverse().join('/'), 
        value 
      }));
  }, [orders]);

  const productPerformance = useMemo(() => {
    const data: Record<string, number> = {};
    orders.forEach(o => {
      data[o.product] = (data[o.product] || 0) + o.totalPrice;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const StatCard = ({ icon: Icon, label, value, subValue, color, iconColor }: any) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 ${color}`}></div>
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${color} ${iconColor}`}>
          <Icon size={24} />
        </div>
        <div className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-full">
          <ArrowUpRight size={10} className="mr-0.5" />
          <span>Real-time</span>
        </div>
      </div>
      <div className="mt-5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</p>
        <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
        {subValue && <p className="text-xs font-bold text-slate-500 mt-1.5 opacity-80">{subValue}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-50 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf size={24} className="text-emerald-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-400 font-black tracking-[0.1em] uppercase text-xs">Synchronizing Ledgers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Market Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Operational intelligence for your bean crop enterprise.</p>
        </div>
        <div className="flex flex-col items-end">
           <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 mb-2">
             <Server size={14} className="text-indigo-600" />
             <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest truncate max-w-[200px]">
                API: {API_BASE_URL.replace('https://', '')}
             </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={TrendingUp} 
          label="Gross Revenue" 
          value={`₹${metrics.totalSales.toLocaleString()}`} 
          subValue={`${orders.length} Total Sales`}
          color="bg-emerald-50" 
          iconColor="text-emerald-600" 
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Settled Amount" 
          value={`₹${metrics.paidAmount.toLocaleString()}`} 
          subValue="Ready for reinvestment"
          color="bg-blue-50" 
          iconColor="text-blue-600" 
        />
        <StatCard 
          icon={Clock} 
          label="Outstanding" 
          value={`₹${metrics.pendingAmount.toLocaleString()}`} 
          subValue="Actionable credit"
          color="bg-rose-50" 
          iconColor="text-rose-600" 
        />
        <StatCard 
          icon={Package} 
          label="Total Volume" 
          value={`${metrics.totalQty} Pkgs`} 
          subValue={`${metrics.uniqueCustomers} Unique Clients`}
          color="bg-amber-50" 
          iconColor="text-amber-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Dynamics</h3>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Last 10 Sale Days</p>
            </div>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dx={-10} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                <Tooltip cursor={{stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4 4'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px', fontWeight: 900 }} />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Crop Distribution</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">Revenue by Variety</p>
          <div className="h-[280px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={productPerformance} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value">
                  {productPerformance.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;