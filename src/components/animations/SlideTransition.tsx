import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SlideTransitionProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  className?: string;
}

export const SlideTransition = ({
  children,
  direction = "right",
  className = "",
}: SlideTransitionProps) => {
  const variants = {
    enter: (direction: string) => {
      switch (direction) {
        case "left":
          return { x: -100, opacity: 0 };
        case "right":
          return { x: 100, opacity: 0 };
        case "up":
          return { y: -100, opacity: 0 };
        case "down":
          return { y: 100, opacity: 0 };
        default:
          return { x: 100, opacity: 0 };
      }
    },
    center: {
      x: 0,
      y: 0,
      opacity: 1,
    },
    exit: (direction: string) => {
      switch (direction) {
        case "left":
          return { x: 100, opacity: 0 };
        case "right":
          return { x: -100, opacity: 0 };
        case "up":
          return { y: 100, opacity: 0 };
        case "down":
          return { y: -100, opacity: 0 };
        default:
          return { x: -100, opacity: 0 };
      }
    },
  };

  return (
    <motion.div
      initial="enter"
      animate="center"
      exit="exit"
      variants={variants}
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        y: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className = "" }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};


