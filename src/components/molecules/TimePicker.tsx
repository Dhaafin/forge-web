"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface TimePickerProps {
  label?: string;
  value: string; // HH:MM (24-hour format)
  onChange: (value: string) => void;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse time
  const [hour24, minuteStr] = value ? value.split(":") : ["12", "00"];
  const initialHour = parseInt(hour24, 10);
  const initialMinute = parseInt(minuteStr, 10);

  // Convert to 12-hour format for display/ui
  const isPM = initialHour >= 12;
  const displayHour = initialHour % 12 === 0 ? 12 : initialHour % 12;
  const displayMinute = initialMinute.toString().padStart(2, "0");
  const displayPeriod = isPM ? "PM" : "AM";

  const [selectedHour, setSelectedHour] = useState(displayHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(displayPeriod);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update parent value when state changes
  useEffect(() => {
    let hour = selectedHour;
    if (selectedPeriod === "PM" && hour < 12) {
      hour += 12;
    } else if (selectedPeriod === "AM" && hour === 12) {
      hour = 0;
    }
    const finalTimeStr = `${hour.toString().padStart(2, "0")}:${selectedMinute
      .toString()
      .padStart(2, "0")}`;
    if (value !== finalTimeStr) {
      onChange(finalTimeStr);
    }
  }, [selectedHour, selectedMinute, selectedPeriod]);

  // Options arrays
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10 ... 55

  return (
    <div ref={containerRef} className={`flex flex-col gap-2 relative w-full ${className}`}>
      {label && (
        <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase font-mono">
          {label}
        </span>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 bg-bg border border-border-subtle hover:border-accent-muted text-text-primary text-xs rounded-sm transition-all duration-200 outline-none text-left select-none cursor-pointer"
      >
        <span>{`${displayHour.toString().padStart(2, "0")}:${displayMinute} ${displayPeriod}`}</span>
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
            strokeWidth="2.5"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Timepicker Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 bg-surface-raised border border-border-strong rounded-sm shadow-elevated p-4 flex flex-col gap-4 min-w-[280px]"
          >
            {/* Pickers Columns */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Hour Selection Column */}
              <div className="flex flex-col gap-1 border-r border-border-subtle pr-1">
                <span className="text-[8px] font-bold text-text-muted font-mono tracking-widest uppercase mb-1">
                  Hour
                </span>
                <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto py-1">
                  {hours.map((h) => {
                    const isSelected = selectedHour === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setSelectedHour(h)}
                        className={`py-1 text-[11px] font-mono rounded-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-accent text-bg font-bold"
                            : "text-text-secondary hover:bg-surface hover:text-text-primary"
                        }`}
                      >
                        {h.toString().padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minute Selection Column */}
              <div className="flex flex-col gap-1 border-r border-border-subtle px-1">
                <span className="text-[8px] font-bold text-text-muted font-mono tracking-widest uppercase mb-1">
                  Min
                </span>
                <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto py-1">
                  {/* Let's list individual minutes but in 5 min steps mainly, plus let user change via keypress or scrolling */}
                  {minutes.map((m) => {
                    const isSelected = selectedMinute === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMinute(m)}
                        className={`py-1 text-[11px] font-mono rounded-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-accent text-bg font-bold"
                            : "text-text-secondary hover:bg-surface hover:text-text-primary"
                        }`}
                      >
                        {m.toString().padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AM/PM Toggle Column */}
              <div className="flex flex-col gap-2 justify-center pl-1">
                <span className="text-[8px] font-bold text-text-muted font-mono tracking-widest uppercase mb-1">
                  Period
                </span>
                <div className="flex flex-col gap-2">
                  {(["AM", "PM"] as const).map((period) => {
                    const isSelected = selectedPeriod === period;
                    return (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setSelectedPeriod(period)}
                        className={`py-2 text-[10px] font-bold tracking-widest font-mono rounded-xs border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-accent border-accent text-bg font-bold"
                            : "bg-surface border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary"
                        }`}
                      >
                        {period}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick action Close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-1.5 bg-surface hover:bg-surface-hover border border-border-subtle rounded-xs text-[10px] font-bold tracking-widest uppercase text-text-primary transition-colors cursor-pointer"
            >
              Set Time
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
