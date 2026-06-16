import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin`}
        style={{ borderColor: "var(--color-border-subtle)", borderTopColor: "var(--color-accent)" }}
      />
    </div>
  );
};
