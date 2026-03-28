import { useState } from 'react';
import { Plus, Trash2, Receipt, Wallet, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import type { Expense } from '@/types/menu';

const CATEGORIES = ['Supplies', 'Utilities', 'Maintenance', 'Other'] as const;

export default function ExpenseManagement() {
  const { expenses, addExpense, removeExpense, getTotalExpenses } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('Supplies');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description,
      amount: Number(amount),
      category,
      date: new Date().toISOString(),
    };

    addExpense(newExpense);
    toast.success('Expense recorded successfully');
    setDescription('');
    setAmount('');
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Expense Tracker</h1>
          <p className="mt-1 text-muted-foreground">Monitor your daily operational costs</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Log Expense
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            ₹{getTotalExpenses().toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Current monthly cycle</div>
        </div>
        
        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Latest Transaction</span>
            <Receipt className="h-4 w-4 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {expenses[0]?.description || 'No data'}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {expenses[0] ? `₹${expenses[0].amount.toLocaleString()}` : 'Log an expense to start'}
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Active Categories</span>
            <Filter className="h-4 w-4 text-info" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {new Set(expenses.map(e => e.category)).size}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Operational silos tracked</div>
        </div>
      </div>

      {formOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border bg-card p-6 shadow-sm"
        >
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Electricity Bill" required />
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Save</Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <AnimatePresence mode="popLayout">
              {expenses.map((expense) => (
                <motion.tr 
                  key={expense.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{expense.description}</td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="font-normal">
                      {expense.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-foreground">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        
        {expenses.length === 0 && (
          <div className="py-12 text-center">
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No expenses recorded</h3>
            <p className="text-muted-foreground">Start tracking your operational costs today.</p>
          </div>
        )}
      </div>
    </div>
  );
}
