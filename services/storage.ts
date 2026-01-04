
import { SaleOrder, PaymentStatus } from '../types';

/**
 * PRODUCTION URL LOGIC
 * If VITE_API_URL is provided by Vercel, use it. Otherwise, fallback to localhost.
 */
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
const STORAGE_KEY = 'bean_sales_tracker_orders_v2';

export const saveOrder = async (order: SaleOrder): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API server error');
    }
  } catch (error) {
    console.error("Sync Error - Saving Locally:", error);
    const orders = getOrdersSync();
    orders.push(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
};

export const getOrders = async (): Promise<SaleOrder[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`);
    if (!response.ok) throw new Error('API unreachable');
    const data = await response.json();
    
    return data.map((o: any) => ({
      id: o.Id || o.id,
      product: o.Product || o.product,
      date: o.SaleDate ? new Date(o.SaleDate).toISOString().split('T')[0] : o.date,
      customerName: o.CustomerName || o.customerName || 'Customer',
      customerPhone: o.CustomerPhone || o.customerPhone,
      area: o.Area || o.area,
      weight: o.Weight || o.weight,
      quantity: o.Quantity || o.quantity,
      totalPackages: o.TotalPackages || o.totalPackages,
      totalPrice: typeof o.TotalPrice === 'string' ? parseFloat(o.TotalPrice) : (o.TotalPrice || o.totalPrice),
      paymentStatus: (o.PaymentStatus || o.paymentStatus || PaymentStatus.PAID) as PaymentStatus,
      notes: o.Notes || o.notes,
      createdAt: o.CreatedAt ? new Date(o.CreatedAt).getTime() : o.createdAt
    }));
  } catch (error) {
    console.warn("Offline Mode - Fetching from Local Storage");
    return getOrdersSync();
  }
};

const getOrdersSync = (): SaleOrder[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearAllOrders = async () => {
  try {
    await fetch(`${API_BASE_URL}/api/orders`, { method: 'DELETE' });
  } catch (err) {
    console.error("Failed to clear remote data:", err);
  }
  localStorage.removeItem(STORAGE_KEY);
};
