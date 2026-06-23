"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parsedDate = value ? new Date(value) : new Date();
  const [currentYear, setCurrentYear] = useState(parsedDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(parsedDate.getMonth()); // 0-indexed
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "Select Date";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const startDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...
  };

  const handlePrevMonth = () => {
    setDirection(-1);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setDirection(1);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    const selectedMonthStr = (currentMonth + 1).toString().padStart(2, "0");
    const selectedDayStr = day.toString().padStart(2, "0");
    const dateStr = `${currentYear}-${selectedMonthStr}-${selectedDayStr}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Generate calendar grid array
  const totalDays = daysInMonth(currentYear, currentMonth);
  const startDay = startDayOfMonth(currentYear, currentMonth);
  const calendarCells = [];

  // Padding cells before first day of month
  // Monday is 1, so adjust padding. If Sunday is 0, we can pad startDay cells.
  for (let i = 0; i < startDay; i++) {
    calendarCells.push(null);
  }

  // Active days cells
  for (let i = 1; i <= totalDays; i++) {
    calendarCells.push(i);
  }

  const weekdaysShort = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 12 : dir < 0 ? -12 : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -12 : dir < 0 ? 12 : 0,
      opacity: 0,
    }),
  };

  return (
    <div ref={containerRef} className={`flex flex-col gap-2 relative w-full ${className}`}>
      {label && (
        <span className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
          {label}
        </span>
      )}

      {/* Date Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 bg-bg border border-border-subtle hover:border-accent-muted text-text-primary text-sm rounded-sm transition-all duration-200 outline-none text-left select-none cursor-pointer"
      >
        <span>{formatDateDisplay(value)}</span>
        <svg
          className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-300 ${
            isOpen ? "rotate-180 text-text-accent" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Calendar dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 bg-surface-raised border border-border-strong rounded-sm shadow-elevated p-4 flex flex-col gap-3 min-w-[280px]"
          >
            {/* Header: Month & Year Selector */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-surface border border-border-subtle rounded-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="text-xs font-bold font-mono tracking-wider text-text-primary uppercase">
                {months[currentMonth]} {currentYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-surface border border-border-subtle rounded-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Grid weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekdaysShort.map((day) => (
                <span key={day} className="text-[8px] font-bold text-text-muted font-mono tracking-wider">
                  {day}
                </span>
              ))}
            </div>

            {/* Grid Days with slider animation */}
            <div className="relative overflow-hidden min-h-[168px]">
              <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                <motion.div
                  key={`${currentYear}-${currentMonth}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="grid grid-cols-7 gap-1 text-center w-full"
                >
                  {calendarCells.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} />;
                    }

                    // Check if current cell matches the selected value
                    const cellMonthStr = (currentMonth + 1).toString().padStart(2, "0");
                    const cellDayStr = day.toString().padStart(2, "0");
                    const isSelected = value === `${currentYear}-${cellMonthStr}-${cellDayStr}`;

                    return (
                      <button
                        key={`day-${day}`}
                        type="button"
                        onClick={() => handleDateSelect(day)}
                        className={`h-7 w-7 text-[10px] font-mono font-semibold rounded-xs transition-colors flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? "bg-accent text-bg font-bold"
                            : "text-text-secondary hover:bg-surface hover:text-text-primary"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
