
import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Download, Sparkles, RefreshCcw, FileSpreadsheet, MapPin, Tag, Calendar, ChevronRight } from 'lucide-react';
import { getOrders, clearAllOrders } from '../services/storage';
import { SaleOrder, AreaType, ProductType, PaymentStatus } from '../types';
import { AREAS, PRODUCTS } from '../constants';
import { getSalesInsight } from '../services/gemini';

const Reports: React.FC = () => {
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  // Default to today's date
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterArea, setFilterArea] = useState<string>('All');
  const [filterProduct, setFilterProduct] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesDate = !filterDate || order.date === filterDate;
    const matchesArea = filterArea === 'All' || order.area === filterArea;
    const matchesProduct = filterProduct === 'All' || order.product === filterProduct;
    const matchesStatus = filterStatus === 'All' || order.paymentStatus === filterStatus;
    const matchesSearch = !searchTerm ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.notes && order.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDate && matchesArea && matchesProduct && matchesStatus && matchesSearch;
  });

  const totals = filteredOrders.reduce((acc, curr) => ({
    qty: acc.qty + curr.quantity,
    price: acc.price + curr.totalPrice
  }), { qty: 0, price: 0 });

  const handleClear = async () => {
    if (confirm('Are you sure you want to wipe all transaction data? This action is irreversible.')) {
      await clearAllOrders();
      setOrders([]);
      setAiInsight('');
    }
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Customer', 'Product', 'Area', 'Weight', 'Qty', 'Total Price', 'Status'];
    const rows = filteredOrders.map(o => [
      o.date,
      o.customerName.replace(/,/g, ''),
      o.product,
      o.area,
      o.weight,
      o.quantity,
      o.totalPrice,
      o.paymentStatus
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bean_sales_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateInsight = async () => {
    setLoadingAi(true);
    const insight = await getSalesInsight(orders);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-slate-500 font-medium">Historical transaction records and automated market auditing.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchOrders}
            className="p-3.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
            title="Reload Records"
          >
            <RefreshCcw size={22} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={downloadCSV}
            disabled={filteredOrders.length === 0}
            className="bg-white text-slate-700 border border-slate-200 px-6 py-3.5 rounded-2xl hover:border-emerald-200 hover:text-emerald-700 transition flex items-center space-x-2 disabled:opacity-50 font-black text-xs uppercase tracking-widest shadow-sm"
          >
            <FileSpreadsheet size={16} />
            <span>CSV Export</span>
          </button>
          <button
            onClick={handleGenerateInsight}
            disabled={loadingAi || orders.length === 0}
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl hover:bg-indigo-700 transition flex items-center space-x-2 disabled:opacity-50 font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
          >
            <Sparkles size={16} />
            <span>{loadingAi ? 'Analyzing...' : 'AI Intelligence'}</span>
          </button>
          <button
            onClick={handleClear}
            className="hidden bg-rose-50 text-rose-600 border border-rose-100 px-6 py-3.5 rounded-2xl hover:bg-rose-100 transition flex items-center space-x-2 font-black text-xs uppercase tracking-widest"
          >
            <Trash2 size={16} />
            <span>Reset Database</span>
          </button>
        </div>
      </div>

      {aiInsight && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/40">
                <Sparkles size={20} />
              </div>
              <h4 className="text-xs font-black tracking-[0.2em] uppercase text-emerald-400">Market Intelligence Strategy</h4>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg md:text-xl font-medium leading-relaxed text-slate-200 whitespace-pre-wrap">
                {aiInsight}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold transition-all placeholder:text-slate-300"
          />
        </div>
        <div className="relative">
          <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold transition-all"
          />
        </div>
        <div className="relative">
          <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold transition-all appearance-none"
          >
            <option value="All">All Varieties</option>
            {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="relative">
          <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold transition-all appearance-none"
          >
            <option value="All">All Regions</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold transition-all appearance-none"
          >
            <option value="All">Settlement Status</option>
            {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20 backdrop-blur-[1px]">
            <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Market & Client</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Crop Specification</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Volume (Pkgs)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Total Payable</th>
                <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <div className="p-6 bg-slate-50 rounded-[2rem] mb-6">
                        <Search size={48} className="opacity-20" />
                      </div>
                      <p className="text-xl font-black tracking-tight text-slate-400">No matching records found.</p>
                      <button
                        onClick={() => { setFilterDate(''); setFilterArea('All'); setFilterProduct('All'); setFilterStatus('All'); setSearchTerm(''); }}
                        className="mt-6 text-emerald-600 font-black text-xs uppercase tracking-widest hover:text-emerald-700 underline underline-offset-8 transition-all"
                      >
                        Reset Audit Parameters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-slate-50/80 transition-all duration-300 cursor-default">
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-500 tracking-tight">{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{order.customerName}</span>
                            <div className={`w-2 h-2 rounded-full ${order.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 flex items-center mt-1 uppercase tracking-widest">
                            <MapPin size={10} className="mr-1.5 text-emerald-500" /> {order.area}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${order.product === 'Papadi' ? 'bg-emerald-50 text-emerald-700' :
                            order.product === 'Tuver' ? 'bg-amber-50 text-amber-700' :
                              'bg-indigo-50 text-indigo-700'
                            }`}>
                            {order.product}
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                            {order.weight}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-slate-900 text-right">{order.quantity}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-black text-slate-900">₹{order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${order.paymentStatus === PaymentStatus.PAID ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-6 text-center">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm('Delete this order?')) {
                              await import('../services/storage').then(m => m.deleteOrder(order.id!));
                              fetchOrders();
                            }
                          }}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length > 0 && (
                    <tr className="bg-slate-900 text-white font-black sticky bottom-0">
                      <td colSpan={4} className="px-8 py-8 text-xs uppercase tracking-[0.3em] text-slate-400">Audit Ledger Summary</td>
                      <td className="px-8 py-8 text-xl text-right">{totals.qty} <span className="text-[10px] opacity-40">PKGS</span></td>
                      <td className="px-8 py-8 text-2xl text-emerald-400 text-right">₹{totals.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
