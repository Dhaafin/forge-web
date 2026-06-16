"use client";

import React, { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className = "",
  maxWidth = "max-w-md",
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop (Fade In/Out) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg/85 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container (Pop In/Out) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`bg-surface border border-border-strong w-full ${maxWidth} p-6 rounded-md shadow-elevated relative z-10 flex flex-col gap-6 ${className}`}
          >
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                {subtitle && (
                  <span className="text-[9px] font-bold text-accent tracking-widest uppercase font-mono">
                    {subtitle}
                  </span>
                )}
                {title && (
                  <h3 className="text-lg font-bold text-text-primary uppercase mt-0.5">
                    {title}
                  </h3>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="flex flex-col gap-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
