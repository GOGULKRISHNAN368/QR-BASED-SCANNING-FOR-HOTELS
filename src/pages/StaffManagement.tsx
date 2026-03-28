import { useState } from 'react';
import { Plus, Trash2, User, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import type { Staff } from '@/types/menu';

export default function StaffManagement() {
  const { staff, addStaff, removeStaff } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;

    const newMember: Staff = {
      id: crypto.randomUUID(),
      name,
      role,
      imageUrl: imageUrl || undefined,
      joinedAt: new Date().toISOString(),
    };

    addStaff(newMember);
    toast.success(`${name} added to the team!`);
    setName('');
    setRole('');
    setImageUrl('');
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Team Dashboard</h1>
          <p className="mt-1 text-muted-foreground">{staff.length} active team members</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>

      {formOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border bg-card p-6 shadow-sm"
        >
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={name} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Executive Chef" required />
            </div>
            <div className="space-y-2">
              <Label>Photo URL (Optional)</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Save</Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {staff.map((member) => (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative flex flex-col items-center rounded-2xl border bg-card p-6 text-center shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative mb-4">
                <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-muted ring-offset-2">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <User className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 h-8 w-8 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all"
                  onClick={() => removeStaff(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <h3 className="font-display text-lg font-bold text-foreground">{member.name}</h3>
              <p className="text-sm font-medium text-primary mb-4">{member.role}</p>
              
              <div className="flex w-full gap-2 border-t pt-4 mt-2">
                 <div className="flex-1 flex flex-col items-center">
                    <Phone className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Call</span>
                 </div>
                 <div className="flex-1 flex flex-col items-center border-l border-r">
                    <Mail className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</span>
                 </div>
                 <div className="flex-1 flex flex-col items-center">
                    <User className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Profile</span>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {staff.length === 0 && (
          <div className="col-span-full py-12 text-center rounded-2xl border-2 border-dashed border-muted">
            <User className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No staff members found</h3>
            <p className="text-muted-foreground">Add your first team member to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
