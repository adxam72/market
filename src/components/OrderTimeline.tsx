import { Check, Clock, Package, Truck, Home, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

const STEPS: { key: Status; label: string; icon: typeof Check }[] = [
  { key: "pending", label: "Kutilmoqda", icon: Clock },
  { key: "confirmed", label: "Tasdiqlandi", icon: Check },
  { key: "shipped", label: "Yo'lda", icon: Truck },
  { key: "delivered", label: "Yetkazildi", icon: Home },
];

const ORDER: Status[] = ["pending", "confirmed", "shipped", "delivered"];

const OrderTimeline = ({ status }: { status: string }) => {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-destructive">
        <X className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Buyurtma bekor qilingan</p>
          <p className="text-xs opacity-80">Iltimos, qo'llab-quvvatlash xizmatiga murojaat qiling</p>
        </div>
      </div>
    );
  }

  const currentIdx = ORDER.indexOf(status as Status);

  return (
    <div className="relative">
      {/* Track */}
      <div className="absolute left-5 right-5 top-5 h-0.5 -translate-y-1/2 bg-border" />
      <div
        className="absolute left-5 top-5 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500"
        style={{
          width: currentIdx <= 0
            ? "0%"
            : `calc(${(currentIdx / (STEPS.length - 1)) * 100}% - ${(currentIdx / (STEPS.length - 1)) * 40}px)`,
        }}
      />

      <div className="relative flex justify-between">
        {STEPS.map((step, i) => {
          const isDone = i <= currentIdx;
          const isActive = i === currentIdx;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isDone
                    ? "border-primary bg-primary text-primary-foreground shadow-warm"
                    : "border-border bg-background text-muted-foreground",
                  isActive && "ring-4 ring-primary/20 animate-pulse"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium md:text-xs",
                  isDone ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
