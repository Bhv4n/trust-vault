import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "primary" | "success" | "destructive";
  hoverable?: boolean;
}

export function GlowCard({ children, className, glowColor, hoverable = true }: GlowCardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "rounded-2xl border border-border bg-card p-6 transition-shadow duration-300",
        glowColor === "primary" && "hover:glow-primary hover:border-primary/30",
        glowColor === "success" && "hover:glow-success hover:border-success/30",
        glowColor === "destructive" && "hover:glow-destructive hover:border-destructive/30",
        !glowColor && "hover:glow-primary hover:border-primary/30",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
