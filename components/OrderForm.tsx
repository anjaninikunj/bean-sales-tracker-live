import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, CheckCircle, AlertCircle, User, Tag, CreditCard } from 'lucide-react';
import { ProductType, AreaType, WeightType, SaleOrder, PaymentStatus } from '../types';
import { PRODUCTS, AREAS, WEIGHTS } from '../constants';
import { saveOrder } from '../services/storage';

const OrderForm: React.FC = () => {
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<ProductType | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [area, setArea] = useState<AreaType | ''>('');
  const [weight, setWeight] = useState<WeightType | ''>('');
  const [quantity, setQuantity] = useState<string>('');
  const [pricePerUnit, setPricePerUnit] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PAID);
  const [notes, setNotes] = useState('');
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = useMemo(() => {
    const qty = parseInt(quantity) || 0;
    const price = parseFloat(pricePerUnit) || 0;
    return qty * price;
  }, [quantity, pricePerUnit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError("Customer Name is required.");
      return;
    }
    if (!product) {
      setError("Please select a Product.");
      return;
    }
    if (!area) {
      setError("Please select an Area.");
      return;
    }
    if (!weight) {
      setError("Please select a Weight category.");
      return;
    }
    if (!pricePerUnit || parseFloat(pricePerUnit) <= 0) {
      setError("Price per Unit is required.");
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      setError("Quantity is required.");
      return;
    }

    // Modern browser check with fallback
    const orderId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newOrder: SaleOrder = {
      id: orderId,
      product: product as ProductType,
      date,
      customerName,
      customerPhone,
      area: area as AreaType,
      weight: weight as WeightType,
      quantity: parseInt(quantity),
      totalPackages: parseInt(quantity),
      totalPrice,
      paymentStatus,
      notes,
      createdAt: Date.now()
    };

    saveOrder(newOrder);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/reports');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-emerald-700 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-white">
            <div className="p-2 bg-emerald-600/50 rounded-lg">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h2 className="font-bold text-xl">New Sales Order</h2>
              <p className="text-emerald-100 text-xs">Register a new crop transaction</p>
            </div>
          </div>
          <div className="text-emerald-100 text-sm font-medium">
            Step 1 of 1
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl flex items-center space-x-2 border border-rose-100 animate-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {showSuccess && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl flex items-center space-x-2 border border-emerald-100 animate-bounce">
              <CheckCircle size={20} />
              <span className="text-sm font-medium">Order saved successfully!</span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-slate-900 font-bold flex items-center space-x-2">
              <User size={18} className="text-emerald-600" />
              <span>Customer Details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 absolute left-3 top-2">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pt-6 pb-2.5 px-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-900"
                />
              </div>
              <div className="relative">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 absolute left-3 top-2">Phone (Optional)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 00000 00000"
                  className="w-full pt-6 pb-2.5 px-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-slate-900 font-bold flex items-center space-x-2">
              <Tag size={18} className="text-emerald-600" />
              <span>Product Selection</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 absolute left-3 top-2">Crop Type</label>
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value as ProductType)}
                  className="w-full pt-6 pb-2.5 px-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-900 appearance-none"
                >
                  <option value="" disabled>Select...</option>
                  {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="relative">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 absolute left-3 top-2">Area / Mandi</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as AreaType)}
                  className="w-full pt-6 pb-2.5 px-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-900 appearance-none"
                >
                  <option value="" disabled>Select...</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="relative">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 absolute left-3 top-2">Date of Sale</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pt-6 pb-2.5 px-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="relative">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 absolute left-3 top-2">Weight Variant</label>
                <select
                  value={weight}
                  onChange={(e) => setWeight(e.target.value as WeightType)}
                  className="w-full pt-6 pb-2.5 px-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-900 appearance-none"
                >
                  <option value="" disabled>Select...</option>
                  {WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div className="relative">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 absolute left-3 top-2">Unit Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  placeholder="0.00"
                  className="w-full pt-6 pb-2.5 px-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-900"
                />
              </div>

              <div className="relative">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 absolute left-3 top-2">Quantity (Pkgs)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full pt-6 pb-2.5 px-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-slate-900 font-bold flex items-center space-x-2 mb-3">
                  <CreditCard size={18} className="text-emerald-600" />
                  <span>Payment Status</span>
                </h3>
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                  {Object.values(PaymentStatus).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPaymentStatus(status)}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                        paymentStatus === status 
                          ? 'bg-white text-emerald-700 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 relative">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 absolute left-3 top-2">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full pt-6 pb-2 px-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-900"
                  placeholder="Add details about delivery, credit terms..."
                />
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-emerald-800 text-sm font-medium">Order Total Estimation</p>
              <p className="text-emerald-900 text-3xl font-black">₹{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <button
              type="submit"
              className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-black text-lg hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
            >
              Finish & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;