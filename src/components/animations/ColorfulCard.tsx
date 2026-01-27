import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ColorfulCardProps {
  children: ReactNode;
  className?: string;
  gradient?: "ocean" | "sunset" | "purple" | "emerald" | "gold" | "navy";
  hoverEffect?: boolean;
  delay?: number;
}

export const ColorfulCard = ({
  children,
  className = "",
  gradient = "ocean",
  hoverEffect = true,
  delay = 0,
}: ColorfulCardProps) => {
  const gradientClasses = {
    ocean: "bg-gradient-ocean",
    sunset: "bg-gradient-sunset",
    purple: "bg-gradient-purple",
    emerald: "bg-gradient-emerald",
    gold: "bg-gradient-gold",
    navy: "bg-gradient-luxury",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverEffect ? { scale: 1.02, y: -5 } : {}}
      className={cn("relative overflow-hidden rounded-lg", className)}
    >
      <Card className={cn("h-full border-0", gradientClasses[gradient])}>
        <div className="relative z-10 p-6 text-white">{children}</div>
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </Card>
    </motion.div>
  );
};



