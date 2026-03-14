import { SaleOrder, PaymentStatus } from '../types';

const CLOUD_URL = 'https://bean-sales-tracker-live.vercel.app'; // Update this to your exact Vercel URL if different!

const getApiBaseUrl = (): string => {
  const env = (import.meta as any).env;
  if (env && env.VITE_API_URL) return env.VITE_API_URL;

  // If running in browser natively on Vercel, use relative URL (so it dynamically hits the correct API)
  if (typeof window !== 'undefined' &&
    !window.location.hostname.includes('localhost') &&
    !window.location.protocol.includes('capacitor') &&
    !window.location.protocol.includes('file')) {
    return '';
  }

  // GLOBAL CLOUD DEPLOYMENT ADDRESS (For APK / Mobile app to connect to)
  return CLOUD_URL;
};

export const API_BASE_URL = getApiBaseUrl();

export const saveOrder = async (order: SaleOrder): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server error');
    }
  } catch (error) {
    console.warn("[Storage] Offline Mode Active:", error);
    const orders = getOrdersSync();
    orders.push(order);
    localStorage.setItem('bean_sales_cache', JSON.stringify(orders));
  }
};

export const getOrders = async (retries = 12): Promise<SaleOrder[]> => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[API] Wake-up Attempt ${i + 1} to Render...`);
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (!Array.isArray(data)) throw new Error("Format error");

      return data.map((o: any) => ({
        id: o.Id || o.id || Math.random().toString(),
        product: o.Product || o.product || 'Unknown',
        date: o.SaleDate ? new Date(o.SaleDate).toISOString().split('T')[0] : (o.date || new Date().toISOString().split('T')[0]),
        customerName: o.CustomerName || o.customerName || 'Anonymous',
        customerPhone: o.CustomerPhone || o.customerPhone || '',
        area: o.Area || o.area || 'Unknown',
        weight: o.Weight || o.weight || '0',
        quantity: o.Quantity || o.quantity || 0,
        totalPackages: o.TotalPackages || o.totalPackages || 0,
        totalPrice: typeof o.TotalPrice === 'string' ? parseFloat(o.TotalPrice) : (Number(o.TotalPrice) || 0),
        paymentStatus: (o.PaymentStatus || o.paymentStatus || PaymentStatus.PAID) as PaymentStatus,
        notes: o.Notes || o.notes || '',
        createdAt: o.CreatedAt ? new Date(o.CreatedAt).getTime() : Date.now()
      })).filter(item => item !== null) as SaleOrder[];
    } catch (error: any) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      // Wait 5 seconds (5 * 12 = 60 seconds total)
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  return [];
};

const getOrdersSync = (): SaleOrder[] => {
  try {
    const data = localStorage.getItem('bean_sales_cache');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const clearAllOrders = async () => {
  try {
    await fetch(`${API_BASE_URL}/api/orders`, { method: 'DELETE' });
  } catch (err) { }
  localStorage.removeItem('bean_sales_cache');
};

export const deleteOrder = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete');
  } catch (err) {
    // Handle offline delete logic if needed
    console.warn("Offline delete not fully supported yet", err);
  }
};

export const updateOrder = async (order: SaleOrder) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error('Failed to update');
  } catch (err) {
    console.warn("Offline update not fully supported yet", err);
    throw err;
  }
};