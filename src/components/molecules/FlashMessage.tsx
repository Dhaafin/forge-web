"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export type FlashType = "success" | "error" | "warning" | "info";

interface FlashMessageProps {
  message: string;
  type: FlashType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const FlashMessage: React.FC<FlashMessageProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const typeStyles = {
    success: "bg-success/10 border-success/30 text-success",
    error: "bg-danger/10 border-danger/30 text-danger",
    warning: "bg-warning/10 border-warning/30 text-warning",
    info: "bg-info/10 border-info/30 text-info",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠️",
    info: "ℹ",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 border rounded-xs shadow-elevated backdrop-blur-md max-w-sm w-[90%] text-xs font-semibold uppercase tracking-wider ${typeStyles[type]}`}
        >
          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full border border-current text-[10px]">
            {icons[type]}
          </span>
          <span className="flex-1">{message}</span>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
