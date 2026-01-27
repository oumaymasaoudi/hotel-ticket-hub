import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AnimatedBadgeProps {
  children: ReactNode;
  variant?: "default" | "gold" | "emerald" | "rose" | "purple";
  className?: string;
  pulse?: boolean;
}

export const AnimatedBadge = ({
  children,
  variant = "default",
  className = "",
  pulse = false,
}: AnimatedBadgeProps) => {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    gold: "bg-gold-600 text-white",
    emerald: "bg-emerald-500 text-white",
    rose: "bg-rose-500 text-white",
    purple: "bg-purple-500 text-white",
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
    >
      <Badge
        className={cn(
          variantClasses[variant],
          pulse && "animate-pulse-custom",
          className
        )}
      >
        {children}
      </Badge>
    </motion.div>
  );
};

