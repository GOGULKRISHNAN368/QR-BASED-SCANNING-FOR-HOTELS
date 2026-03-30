import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/store/useStore';
import type { OrderStatus } from '@/types/menu';

const STATUS_OPTIONS: OrderStatus[] = ['waiting', 'pending', 'preparing', 'served', 'completed'];

const statusStyle: Record<OrderStatus, string> = {
  waiting: 'bg-muted/10 text-muted-foreground border-muted/20',
  pending: 'bg-destructive/10 text-destructive border-destructive/20',
  preparing: 'bg-warning/10 text-warning border-warning/20',
  served: 'bg-info/10 text-info border-info/20',
  completed: 'bg-success/10 text-success border-success/20',
};

import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderManagement() {
  const { orders, updateOrderStatus, sendWhatsAppMessage } = useStore();

  const handleSendWhatsApp = async (order: any) => {
    if (!order.customerPhoneNumber) {
      toast.error('No phone number for this order');
      return;
    }
    
    // Default message
    const message = `Hello! Your order ${order.id} for Table ${order.tableNumber} is currently ${order.status.toUpperCase()}. Thank you for choosing MenuMagic!`;
    
    const success = await sendWhatsAppMessage(order.id, message);
    if (success) {
      toast.success('WhatsApp message sent!');
    } else {
      toast.error('Failed to send WhatsApp message');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Orders</h1>
        <p className="mt-1 text-muted-foreground">{orders.length} total orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border bg-card p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-foreground">{order.id}</span>
                  <Badge variant="outline">Table {order.tableNumber}</Badge>
                  <Badge className={statusStyle[order.status]}>{order.status}</Badge>
                  {order.customerPhoneNumber && (
                    <span className="text-xs text-muted-foreground">{order.customerPhoneNumber}</span>
                  )}
                </div>
                <div className="space-y-1">
                  {order.items.map((item, j) => (
                    <p key={j} className="text-sm text-muted-foreground">
                      {item.quantity}× {item.dishName} — <span className="text-foreground">₹{item.price * item.quantity}</span>
                    </p>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-display text-xl font-bold text-foreground">₹{order.totalPrice}</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => handleSendWhatsApp(order)}
                    title="Send WhatsApp Update"
                  >
                    <MessageSquare size={18} />
                  </Button>
                  <Select
                    value={order.status}
                    onValueChange={(v) => updateOrderStatus(order.id, v as OrderStatus)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
