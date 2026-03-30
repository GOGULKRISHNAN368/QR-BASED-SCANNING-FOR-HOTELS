import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { Dish, TimeSlot } from '@/types/menu';
import { CATEGORIES } from '@/types/menu';

interface DishFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dish: Omit<Dish, 'id' | 'createdAt'>) => void;
  initial?: Dish;
}

const TIME_OPTIONS: { value: TimeSlot; label: string }[] = [
  { value: 'morning', label: 'Morning (6AM–12PM)' },
  { value: 'evening', label: 'Afternoon (12PM–6PM)' },
  { value: 'night', label: 'Night (6PM–6AM)' },
];

export function DishForm({ open, onClose, onSubmit, initial }: DishFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [available, setAvailable] = useState(true);
  const [offer, setOffer] = useState('');
  const [offerPercent, setOfferPercent] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [customImage, setCustomImage] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null);


  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setDescription(initial?.description ?? '');
      setCategory(initial?.category ?? '');
      setPrice(initial?.price?.toString() ?? '');
      setAvailable(initial?.available ?? true);
      setOffer(initial?.offer ?? '');
      setOfferPercent(initial?.offerPercent?.toString() ?? '');
      setTimeSlots(initial?.timeSlots ?? []);
      setCustomImage(initial?.imageUrl);
    }
  }, [open, initial]);

  const toggleSlot = (slot: TimeSlot) => {
    setTimeSlots((prev) => prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !price) return;
    
    const dishData: any = {
      name,
      description: description || undefined,
      category,
      price: parseFloat(price),
      available,
      offer: offer || undefined,
      offerPercent: offerPercent ? parseFloat(offerPercent) : undefined,
      timeSlots,
      imageUrl: customImage,
    };

    if (imageFile) {
      dishData.imageFile = imageFile;
    }

    onSubmit(dishData);
    onClose();
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{initial ? 'Edit Dish' : 'Add New Dish'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Dish Image (Optional)</Label>
            <div className="mt-1 flex items-center gap-3">
              {customImage && <img src={customImage} alt="Preview" className="h-10 w-10 object-cover rounded shadow" />}
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Leave blank for no image.</p>
          </div>
          <div>
            <Label>Dish Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Butter Chicken" required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe this dish..." 
              className="resize-none"
              rows={3}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price (₹)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" required />
            </div>
            <div>
              <Label>Discount %</Label>
              <Input type="number" value={offerPercent} onChange={(e) => setOfferPercent(e.target.value)} min="0" max="100" placeholder="0" />
            </div>
          </div>
          <div>
            <Label>Offer Label</Label>
            <Input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="e.g. 10% off today!" />
          </div>
          <div>
            <Label className="mb-2 block">Time Availability</Label>
            <div className="flex flex-wrap gap-3">
              {TIME_OPTIONS.map((t) => (
                <label key={t.value} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={timeSlots.includes(t.value)} onCheckedChange={() => toggleSlot(t.value)} />
                  {t.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Available</Label>
            <Switch checked={available} onCheckedChange={setAvailable} />
          </div>
          <Button type="submit" className="w-full">{initial ? 'Update Dish' : 'Add Dish'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
