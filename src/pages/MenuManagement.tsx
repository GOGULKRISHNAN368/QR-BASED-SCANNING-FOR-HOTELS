import { useState } from 'react';
import { Plus, Pencil, Trash2, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { DishForm } from '@/components/DishForm';
import { getEffectivePrice } from '@/types/menu';
import type { Dish, TimeSlot } from '@/types/menu';
import { toast } from 'sonner';

export default function MenuManagement() {
  const { dishes, addDish, updateDish, removeDish } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | undefined>();

  const handleAdd = async (data: Omit<Dish, 'id' | 'createdAt'>) => {
    const tempId = crypto.randomUUID();
    const newDish: Dish = {
      ...data,
      id: tempId,
      createdAt: new Date().toISOString(),
    };
    
    try {
      addDish(newDish);
      toast.success(`${newDish.name} added!`);
    } catch (error) {
      toast.error("Failed to add dish.");
    }
  };

  const handleEdit = (data: Omit<Dish, 'id' | 'createdAt'>) => {
    if (!editingDish) return;
    updateDish(editingDish.id, data);
    toast.success(`${data.name} updated!`);
    setEditingDish(undefined);
  };

  const handleDelete = (dish: Dish) => {
    removeDish(dish.id);
    toast.success(`${dish.name} removed from menu.`);
  };

  const slotLabel = (s: TimeSlot) =>
    s === 'morning' ? '🌅 Morning' : s === 'evening' ? '☀️ Afternoon' : '🌙 Night';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Menu Management</h1>
          <p className="mt-1 text-muted-foreground">{dishes.length} dishes in your menu</p>
        </div>
        <Button onClick={() => { setEditingDish(undefined); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Dish
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {dishes.map((dish) => {
            return (
              <motion.div
                key={dish.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative rounded-lg border bg-card overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
              >
                {/* Image area */}
                <div className="h-36 bg-muted flex items-center justify-center relative">
                  {dish.imageUrl ? (
                    <img src={dish.imageUrl} alt={dish.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                  )}
                </div>

                {dish.offer && (
                  <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">{dish.offer}</Badge>
                )}

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-card-foreground">{dish.name}</h3>
                      <p className="text-xs text-muted-foreground">{dish.category}</p>
                      {dish.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 italic">
                          {dish.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {dish.offerPercent ? (
                        <>
                          <span className="text-xs text-muted-foreground line-through">₹{dish.price}</span>
                          <p className="font-bold text-primary">₹{getEffectivePrice(dish).toFixed(0)}</p>
                        </>
                      ) : (
                        <p className="font-bold text-card-foreground">₹{dish.price}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {dish.timeSlots.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">{slotLabel(s)}</Badge>
                    ))}
                    {dish.timeSlots.length === 0 && (
                      <Badge variant="outline" className="text-xs">All Day</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={dish.available}
                        onCheckedChange={(v) => updateDish(dish.id, { available: v })}
                      />
                      <span className="text-xs text-muted-foreground">{dish.available ? 'Available' : 'Hidden'}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setEditingDish(dish); setFormOpen(true); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(dish)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <DishForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingDish(undefined); }}
        onSubmit={editingDish ? handleEdit : handleAdd}
        initial={editingDish}
      />
    </div>
  );
}
