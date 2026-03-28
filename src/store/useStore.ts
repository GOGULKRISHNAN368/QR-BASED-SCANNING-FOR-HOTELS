import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dish, Order, OrderStatus, Staff, Expense } from '@/types/menu';

interface AppState {
  dishes: Dish[];
  orders: Order[];
  staff: Staff[];
  expenses: Expense[];
  addDish: (dish: Dish) => void;
  updateDish: (id: string, updates: Partial<Dish>) => void;
  removeDish: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addStaff: (member: Staff) => void;
  removeStaff: (id: string) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  getTodayOrders: () => Order[];
  getTodayRevenue: () => number;
  getTotalExpenses: () => number;
  fetchData: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => {
      const API_BASE = `http://${window.location.hostname}:5000/api`;
      
      return {
        dishes: [],
        orders: [],
        staff: [],
        expenses: [
          { id: '1', description: 'Fresh Produce', amount: 1200, category: 'Supplies', date: new Date().toISOString() },
          { id: '2', description: 'Electricity Bill', amount: 4500, category: 'Utilities', date: new Date().toISOString() },
          { id: '3', description: 'Kitchen Repair', amount: 2500, category: 'Maintenance', date: new Date().toISOString() },
        ],
        addDish: async (dish) => {
          // Optimistic update
          const previousDishes = get().dishes;
          set((s) => ({ dishes: [...s.dishes, dish] }));

          try {
            const res = await fetch(`${API_BASE}/dishes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dish),
            });
            if (res.ok) {
              const fromServer = await res.json();
              // Replace the optimistic dish with the official one from server
              const newDish = { ...fromServer, id: fromServer.id || fromServer._id };
              set((s) => ({ 
                dishes: s.dishes.map(d => d.id === dish.id ? newDish : d) 
              }));
            } else {
              set({ dishes: previousDishes });
              console.error('Failed to add dish to server:', await res.text());
            }
          } catch (error) {
            set({ dishes: previousDishes });
            console.error('Failed to add dish:', error);
          }
        },
        updateDish: async (id, updates) => {
          // Optimistic update
          const previousDishes = get().dishes;
          set((s) => ({
            dishes: s.dishes.map((d) => 
              (d.id === id || (d as any)._id === id) ? { ...d, ...updates } : d
            ),
          }));

          try {
            const res = await fetch(`${API_BASE}/dishes/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            });
            if (res.ok) {
              let updated = await res.json();
              // Ensure consistent ID format
              if (!updated.id && updated._id) updated.id = updated._id;
              
              set((s) => ({
                dishes: s.dishes.map((d) => 
                  (d.id === id || (d as any)._id === id) ? updated : d
                ),
              }));
            } else {
              set({ dishes: previousDishes });
              console.error('Failed to update dish on server');
            }
          } catch (error) {
            set({ dishes: previousDishes });
            console.error('Failed to update dish:', error);
          }
        },
        removeDish: async (id) => {
          // Optimistic update
          const previousDishes = get().dishes;
          set((s) => ({ 
            dishes: s.dishes.filter((d) => d.id !== id && (d as any)._id !== id) 
          }));

          try {
            const res = await fetch(`${API_BASE}/dishes/${id}`, {
              method: 'DELETE',
            });
            if (!res.ok) {
              // If it's a 404, maybe it was already deleted or was a temp ID?
              // Only rollback if it's a real server error (500 etc)
              if (res.status >= 500) {
                set({ dishes: previousDishes });
                console.error('Failed to remove dish from server due to error');
              } else {
                console.warn('Dish remove result:', res.status);
              }
            }
          } catch (error) {
            set({ dishes: previousDishes });
            console.error('Failed to remove dish:', error);
          }
        },
        addOrder: async (order) => {
          try {
            const res = await fetch(`${API_BASE}/orders`, {
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
            const res = await fetch(`${API_BASE}/orders/${id}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status }),
            });
            if (res.ok) {
              const updated = await res.json();
              set((s) => ({
                orders: s.orders.map((o) => (o.id === id || (o as any)._id === id ? updated : o)),
              }));
            }
          } catch (error) {
            console.error('Failed to update order status:', error);
          }
        },
        addStaff: async (member) => {
          try {
            const res = await fetch(`${API_BASE}/staff`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(member),
            });
            if (res.ok) {
              const newMember = await res.json();
              set((s) => ({ staff: [...s.staff, newMember] }));
            }
          } catch (error) {
            console.error('Failed to add staff member:', error);
          }
        },
        removeStaff: async (id) => {
          try {
            const res = await fetch(`${API_BASE}/staff/${id}`, {
              method: 'DELETE',
            });
            if (res.ok) {
              set((s) => ({ staff: s.staff.filter((m) => m.id !== id && (m as any)._id !== id) }));
            }
          } catch (error) {
            console.error('Failed to remove staff member:', error);
          }
        },
        addExpense: (expense) => {
          set((s) => ({ expenses: [expense, ...s.expenses] }));
        },
        removeExpense: (id) => {
          set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id && (e as any)._id !== id) }));
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
        getTotalExpenses: () => {
          return get().expenses.reduce((sum, e) => sum + e.amount, 0);
        },
        fetchData: async () => {
          const fetchOne = async (path: string) => {
            try {
              const res = await fetch(`${API_BASE}${path}`);
              if (res.ok) return await res.json();
              console.error(`Fetch failed for ${path}:`, res.status);
              return null;
            } catch (e) {
              console.error(`Error fetching ${path}:`, e);
              return null;
            }
          };

          const [dishesData, ordersData, staffData] = await Promise.all([
            fetchOne('/dishes'),
            fetchOne('/orders'),
            fetchOne('/staff'),
          ]);

          const updates: AppState = { ...get() };
          let changed = false;
          
          if (dishesData) {
            updates.dishes = dishesData.map((d: any) => ({ ...d, id: d.id || d._id }));
            changed = true;
          }
          if (ordersData) {
            updates.orders = ordersData.map((o: any) => ({ ...o, id: o.id || o._id }));
            changed = true;
          }
          if (staffData) {
            updates.staff = staffData.map((s: any) => ({ ...s, id: s.id || s._id }));
            changed = true;
          }

          if (changed) {
            set(updates);
            console.log(">>> [fetchData] Store updated successfully.");
          }
        },
      };
    },
    { name: 'hotel-admin-store' }
  )
);

// Call fetchData right after store creation to load from MongoDB
useStore.getState().fetchData();
