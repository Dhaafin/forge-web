"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "../../contexts/AuthContext";
import { Spinner } from "../atoms/Spinner";
import { CoachChatPanel } from "./chat/CoachChatPanel";
import { AnimatePresence, motion } from "motion/react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "DASHBOARD" },
    { href: "/dashboard/exercises", label: "EXERCISES" },
    { href: "/dashboard/workouts", label: "WORKOUTS" },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="border-b border-border-subtle bg-surface/30 backdrop-blur-md sticky top-0 z-50 h-[69px] flex items-center">
        <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xl font-bold tracking-[0.3em] text-text-primary hover:text-accent transition-colors">
              FORGE
            </Link>
            <span className="px-1.5 py-0.5 border border-accent text-[8px] font-bold tracking-widest text-text-accent rounded-xs">
              MEMBER
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-[10px] font-bold tracking-widest uppercase">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors ${
                    isActive ? "text-text-accent" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`px-4 py-2 border transition-all duration-300 rounded-xs cursor-pointer ${
                isChatOpen
                  ? "border-accent text-text-accent bg-accent/5"
                  : "border-border-subtle hover:border-accent hover:text-text-accent"
              }`}
            >
              COACH
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 border border-border-subtle hover:border-accent hover:text-text-accent transition-all duration-300 rounded-xs cursor-pointer flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? <Spinner size="sm" /> : "DISCONNECT"}
            </button>
          </nav>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden items-center justify-center p-2 text-text-primary hover:text-accent transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed top-[69px] inset-x-0 bottom-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
            />
            {/* Drawer container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="fixed top-[69px] bottom-0 right-0 z-40 w-64 bg-surface-raised/95 backdrop-blur-md border-l border-border-subtle p-6 flex flex-col justify-between md:hidden shadow-2xl"
            >
              <div className="flex flex-col gap-8">

                {/* Links stack */}
                <nav className="flex flex-col gap-6 text-xs font-bold tracking-widest uppercase">
                  {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`transition-colors ${
                          isActive ? "text-text-accent" : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Actions inside drawer */}
              <div className="flex flex-col gap-4 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsChatOpen(true);
                  }}
                  className={`w-full py-3 border text-center transition-all duration-300 rounded-xs cursor-pointer text-xs font-bold tracking-widest uppercase ${
                    isChatOpen
                      ? "border-accent text-text-accent bg-accent/5"
                      : "border-border-subtle hover:border-accent hover:text-text-accent"
                  }`}
                >
                  COACH
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full py-3 border border-border-subtle hover:border-accent hover:text-text-accent transition-all duration-300 rounded-xs cursor-pointer flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? <Spinner size="sm" /> : "DISCONNECT"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Chat Panel overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-full sm:max-w-[380px] h-[100dvh] sm:h-auto shadow-2xl rounded-none sm:rounded-lg overflow-hidden bg-bg/95"
          >
            <div className="absolute top-4 right-4 z-50">
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="text-text-secondary hover:text-text-primary text-[9px] font-mono tracking-widest uppercase cursor-pointer bg-surface/50 px-1.5 py-0.5 rounded-xs border border-border-subtle"
              >
                Close
              </button>
            </div>
            <CoachChatPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


