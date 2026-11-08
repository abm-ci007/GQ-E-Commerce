import type { OrderStatus } from "@/lib/api/types";
import { Check, Clock, Package, Truck } from "lucide-react";

const STEPS: { key: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Check },
];

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const colors: Record<OrderStatus, string> = {
    pending: "bg-cream-deep text-ink",
    processing: "bg-ochre text-ink",
    shipped: "bg-olive text-cream",
    delivered: "surface-terracotta",
    cancelled: "bg-destructive text-cream",
  };
  return (
    <span className={`text-micro rounded-full px-3 py-1 ${colors[status]}`}>
      {status}
    </span>
  );
}

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  const idx = STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="grid grid-cols-4 gap-2">
      {STEPS.map((s, i) => {
        const done = i <= idx;
        const Icon = s.icon;
        return (
          <li key={s.key} className={`bento p-4 text-center ${done ? "surface-ink text-cream" : "surface-cream-deep text-ink/50"}`}>
            <Icon className="mx-auto h-5 w-5" />
            <div className="text-micro mt-2">{s.label}</div>
          </li>
        );
      })}
    </ol>
  );
}
