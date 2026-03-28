export type TimeSlot = 'morning' | 'evening' | 'night';

export type OrderStatus = 'pending' | 'preparing' | 'served' | 'completed';

export interface Dish {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  available: boolean;
  offer?: string;
  offerPercent?: number;
  timeSlots: TimeSlot[];
  imageUrl?: string;
  createdAt: string;
}

export interface OrderItem {
  dishId: string;
  dishName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  joinedAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'Supplies' | 'Utilities' | 'Maintenance' | 'Other';
  date: string;
}

export const CATEGORIES = [
  'Appetizers',
  'Main Course',
  'Desserts',
  'Beverages',
  'Soups',
  'Salads',
  'Snacks',
  'Breakfast',
  'Biryani & Rice',
  'Breads',
] as const;

export const TIME_SLOT_HOURS: Record<TimeSlot, [number, number]> = {
  morning: [6, 12],
  evening: [12, 18],
  night: [18, 6],
};

export function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'evening';
  return 'night';
}

export function isDishAvailableNow(dish: Dish): boolean {
  if (!dish || dish.available === false) return false;
  // Safety check for timeSlots being missing or not an array
  if (!dish.timeSlots || !Array.isArray(dish.timeSlots) || dish.timeSlots.length === 0) return true;
  return dish.timeSlots.includes(getCurrentTimeSlot());
}

export function getEffectivePrice(dish: Dish): number {
  if (dish.offerPercent && dish.offerPercent > 0) {
    return dish.price * (1 - dish.offerPercent / 100);
  }
  return dish.price;
}
