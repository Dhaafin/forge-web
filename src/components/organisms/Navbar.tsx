"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "../../contexts/AuthContext";
import { Spinner } from "../atoms/Spinner";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    <header className="border-b border-border-subtle bg-surface/30 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xl font-bold tracking-[0.3em] text-text-primary hover:text-accent transition-colors">
            FORGE
          </Link>
          <span className="px-1.5 py-0.5 border border-accent text-[8px] font-bold tracking-widest text-text-accent rounded-xs">
            MEMBER
          </span>
        </div>

        <nav className="flex items-center gap-6 text-[10px] font-bold tracking-widest uppercase">
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
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 border border-border-subtle hover:border-accent hover:text-text-accent transition-all duration-300 rounded-xs cursor-pointer flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? <Spinner size="sm" /> : "DISCONNECT"}
          </button>
        </nav>
      </div>
    </header>
  );
};

