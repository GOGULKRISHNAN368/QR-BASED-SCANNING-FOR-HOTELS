import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dish, Order, OrderStatus } from '@/types/menu';

interface AppState {
  dishes: Dish[];
  orders: Order[];
  addDish: (dish: Dish) => void;
  updateDish: (id: string, updates: Partial<Dish>) => void;
  removeDish: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getTodayOrders: () => Order[];
  getTodayRevenue: () => number;
  fetchData: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      dishes: [],
      orders: [],
      addDish: async (dish) => {
        try {
          const res = await fetch('http://localhost:5000/api/dishes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dish),
          });
          if (res.ok) {
            const newDish = await res.json();
            set((s) => ({ dishes: [...s.dishes, newDish] }));
          }
        } catch (error) {
          console.error('Failed to add dish:', error);
        }
      },
      updateDish: async (id, updates) => {
        try {
          const res = await fetch(`http://localhost:5000/api/dishes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          if (res.ok) {
            const updated = await res.json();
            set((s) => ({
              dishes: s.dishes.map((d) => (d.id === id ? updated : d)),
            }));
          }
        } catch (error) {
          console.error('Failed to update dish:', error);
        }
      },
      removeDish: async (id) => {
        try {
          const res = await fetch(`http://localhost:5000/api/dishes/${id}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            set((s) => ({ dishes: s.dishes.filter((d) => d.id !== id) }));
          }
        } catch (error) {
          console.error('Failed to remove dish:', error);
        }
      },
      addOrder: async (order) => {
        try {
          const res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
          });
          if (res.ok) {
            const newOrder = await res.json();
            set((s) => ({ orders: [newOrder, ...s.orders] }));
          }
        } catch (error) {
          console.error('Failed to add order:', error);
        }
      },
      updateOrderStatus: async (id, status) => {
        try {
          const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          });
          if (res.ok) {
            const updated = await res.json();
            set((s) => ({
              orders: s.orders.map((o) => (o.id === id ? updated : o)),
            }));
          }
        } catch (error) {
          console.error('Failed to update order status:', error);
        }
      },
      getTodayOrders: () => {
        const today = new Date().toDateString();
        return get().orders.filter((o) => new Date(o.createdAt).toDateString() === today);
      },
      getTodayRevenue: () => {
        const today = new Date().toDateString();
        return get()
          .orders.filter((o) => new Date(o.createdAt).toDateString() === today && o.status !== 'pending')
          .reduce((sum, o) => sum + o.totalPrice, 0);
      },
      // Initialization helper to fetch data from MongoDB on mount
      fetchData: async () => {
        try {
          const [dishesRes, ordersRes] = await Promise.all([
            fetch('http://localhost:5000/api/dishes'),
            fetch('http://localhost:5000/api/orders'),
          ]);
          if (dishesRes.ok && ordersRes.ok) {
            const dishes = await dishesRes.json();
            const orders = await ordersRes.json();
            set({ dishes, orders });
          }
        } catch (error) {
          console.error('Failed to fetch initial data:', error);
        }
      },
    }),
    { name: 'hotel-admin-store' }
  )
);

// Call fetchData right after store creation to load from MongoDB
useStore.getState().fetchData();
