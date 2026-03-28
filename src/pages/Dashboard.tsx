import { UtensilsCrossed, Users, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const MOCK_INVENTORY = [
  { name: 'Chicken Breast', stock: 15, unit: 'kg', threshold: 20 },
  { name: 'Basmati Rice', stock: 50, unit: 'kg', threshold: 30 },
  { name: 'Heavy Cream', stock: 2, unit: 'L', threshold: 5 },
  { name: 'Butter', stock: 8, unit: 'kg', threshold: 10 },
  { name: 'Paneer', stock: 12, unit: 'kg', threshold: 15 },
];

export default function Dashboard() {
  const { dishes, staff } = useStore();
  const activeDishes = dishes.filter((d) => d.available !== false).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome to your MenuMagic Admin panel.</p>
        </div>
        {(() => {
          const lowStockCount = MOCK_INVENTORY.filter(item => item.stock <= item.threshold).length;
          return lowStockCount > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-warning/10 border border-warning/20 rounded-full">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium text-warning">{lowStockCount} Items Low in Stock</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/20 rounded-full">
              <span className="text-xs font-medium text-success">All Items in Stock</span>
            </div>
          );
        })()}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Menu Items"
          value={String(activeDishes)}
          subtitle={`${dishes.length} total dishes`}
          icon={UtensilsCrossed}
          accentClass="bg-success/10 text-success"
        />
        <StatCard
          title="Team Dashboard"
          value={String(staff.length)}
          subtitle="Active staff"
          icon={Users}
          accentClass="bg-warning/10 text-warning"
        />
        <StatCard
          title="Categories"
          value={String(new Set(dishes.map(d => d.category)).size)}
          subtitle="Food categories"
          icon={UtensilsCrossed}
          accentClass="bg-info/10 text-info"
        />
        <StatCard
          title="Inventory Items"
          value={String(MOCK_INVENTORY.length)}
          subtitle="Stocked ingredients"
          icon={Package}
          accentClass="bg-primary/10 text-primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">Inventory Alerts</h2>
            <Badge variant="outline" className="text-xs">Sample Data</Badge>
          </div>
          <div className="space-y-6">
            {MOCK_INVENTORY.map((item) => {
              const isLow = item.stock <= item.threshold;
              const percentage = (item.stock / (item.threshold * 2)) * 100;
              
              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className={`font-mono font-bold ${isLow ? 'text-destructive' : 'text-success'}`}>
                      {item.stock} {item.unit}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className={`h-2 ${isLow ? 'bg-destructive/10' : ''}`}
                    indicatorClassName={isLow ? 'bg-destructive' : 'bg-success'}
                  />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                    <span>Stock Level</span>
                    <span>Min Threshold: {item.threshold} {item.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm flex flex-col justify-center">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground">Smart Insights</h2>
            {dishes.length > 0 ? (
              (() => {
                const groups = dishes.reduce((acc, d) => {
                  acc[d.category] = (acc[d.category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                
                const topCategory = Object.entries(groups).sort((a, b) => b[1] - a[1])[0];
                
                return (
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    Your <span className="text-foreground font-semibold">"{topCategory[0]}"</span> category is currently the most diverse with {topCategory[1]} specialized dishes.
                  </p>
                );
              })()
            ) : (
              <p className="text-muted-foreground max-w-xs mx-auto">
                Start adding dishes to your menu to see insights here!
              </p>
            )}
            <Button variant="outline" className="mt-4">View Analytics</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
