import React from "react";

interface StatWidgetProps {
  value: string | number;
  label: string;
  subLabel?: string;
  icon?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  value,
  label,
  subLabel,
  icon,
}) => {
  return (
    <div className="flex flex-col p-6 bg-surface border border-border-subtle rounded-md hover:border-accent-muted transition-all duration-300 group shadow-card">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">
          {label}
        </span>
        {icon && <span className="text-base opacity-75 group-hover:scale-110 transition-transform duration-300">{icon}</span>}
      </div>
      <div className="font-display text-5xl tracking-wide text-text-primary leading-none mb-1">
        {value}
      </div>
      {subLabel && (
        <span className="text-[10px] tracking-wider text-text-muted uppercase font-mono">
          {subLabel}
        </span>
      )}
    </div>
  );
};
