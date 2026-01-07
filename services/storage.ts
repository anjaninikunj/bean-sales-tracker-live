import { SaleOrder, PaymentStatus } from '../types';

const getApiBaseUrl = (): string => {
  try {
    // Safer check for environment variables in different contexts
    const env = (import.meta as any).env;
    if (env && env.VITE_API_URL) return env.VITE_API_URL;
  } catch (e) {}
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

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

export const getOrders = async (): Promise<SaleOrder[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`);
    if (!response.ok) throw new Error('Network offline');
    const data = await response.json();
    
    return data.map((o: any) => ({
      id: o.Id || o.id,
      product: o.Product || o.product,
      date: o.SaleDate ? new Date(o.SaleDate).toISOString().split('T')[0] : o.date,
      customerName: o.CustomerName || o.customerName || 'Anonymous',
      customerPhone: o.CustomerPhone || o.customerPhone,
      area: o.Area || o.area,
      weight: o.Weight || o.weight,
      quantity: o.Quantity || o.quantity,
      totalPackages: o.TotalPackages || o.totalPackages,
      totalPrice: typeof o.TotalPrice === 'string' ? parseFloat(o.TotalPrice) : (o.TotalPrice || 0),
      paymentStatus: (o.PaymentStatus || o.paymentStatus || PaymentStatus.PAID) as PaymentStatus,
      notes: o.Notes || o.notes,
      createdAt: o.CreatedAt ? new Date(o.CreatedAt).getTime() : Date.now()
    }));
  } catch (error) {
    return getOrdersSync();
  }
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
  } catch (err) {}
  localStorage.removeItem('bean_sales_cache');
};