import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: "lift" | "glow" | "scale" | "rotate";
  delay?: number;
  onClick?: () => void;
}

export const AnimatedCard = ({
  children,
  className = "",
  hoverEffect = "lift",
  delay = 0,
  onClick,
}: AnimatedCardProps) => {
  const hoverVariants = {
    lift: {
      scale: 1.02,
      y: -8,
      transition: { duration: 0.3 },
    },
    glow: {
      boxShadow: "0 0 30px rgba(255, 215, 0, 0.5)",
      transition: { duration: 0.3 },
    },
    scale: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
    rotate: {
      rotate: 2,
      scale: 1.02,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverVariants[hoverEffect]}
      className={cn("cursor-pointer", className)}
      onClick={onClick}
    >
      <Card className="h-full transition-all duration-300">{children}</Card>
    </motion.div>
  );
};
