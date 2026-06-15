import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`px-4 py-3 bg-surface border ${error ? "border-danger focus:border-danger" : "border-border-subtle focus:border-accent"} text-text-primary text-sm rounded-sm transition-all duration-200 outline-none placeholder-text-muted focus:ring-1 focus:ring-accent-glow ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-danger tracking-wide mt-1">{error}</span>}
    </div>
  );
};
