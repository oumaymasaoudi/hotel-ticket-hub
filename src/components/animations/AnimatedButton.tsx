import { ReactNode, ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "gold" | "gradient" | "glow";
  className?: string;
}

export const AnimatedButton = ({
  children,
  variant = "default",
  className = "",
  ...props
}: AnimatedButtonProps) => {
  const baseClasses = "px-6 py-3 rounded-lg font-semibold transition-all duration-300";
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    gold: "bg-gradient-gold text-white hover:shadow-gold",
    gradient: "bg-gradient-ocean text-white hover:shadow-lg",
    glow: "bg-primary text-primary-foreground hover:animate-glow-pulse",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
};


