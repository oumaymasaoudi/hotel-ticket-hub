import { ReactNode } from "react";
import { motion } from "framer-motion";
import { FadeIn } from "./FadeIn";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  withFade?: boolean;
}

export const PageWrapper = ({
  children,
  className = "",
  withFade = true,
}: PageWrapperProps) => {
  if (!withFade) {
    return <div className={className}>{children}</div>;
  }

  return (
    <FadeIn direction="up" duration={0.5} className={className}>
      {children}
    </FadeIn>
  );
};



