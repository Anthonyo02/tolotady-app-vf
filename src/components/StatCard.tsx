import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: "success" | "warning" | "error" | "yellow";
  description?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  variant = "success",
  description,
}: StatCardProps) => {
  // 🎨 Bordure
  const variantStyles = {
    success: "border-green-500/30",
    warning: "border-orange-500/30",
    yellow: "border-yellow-500/30",
    error: "border-red-500/30",
  };

  // 🎯 Icône
  const iconStyles = {
    success: "text-green-500",
    warning: "text-orange-500",
    yellow: "text-yellow-500",
    error: "text-red-500",
  };

  // ✨ Glow décoratif
  const glowStyles = {
    success: "bg-green-500",
    warning: "bg-orange-500",
    yellow: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-glow hover:-translate-y-1 animate-fade-in",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-4xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        <div className={cn("rounded-lg bg-secondary p-3", iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* 🌈 Decorative glow */}
      <div
        className={cn(
          "absolute -bottom-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-20",
          glowStyles[variant]
        )}
      />
    </div>
  );
};

export default StatCard;
