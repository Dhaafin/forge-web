import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  fullWidth = false,
  ...props
}) => {
  const baseStyle = "px-6 py-3 text-sm font-semibold tracking-wide uppercase transition-all duration-300 select-none cursor-pointer focus:outline-none rounded-sm border";
  
  const variants = {
    primary: "bg-accent border-accent text-bg hover:bg-accent-hover hover:border-accent-hover hover:shadow-[0_0_20px_rgba(212,175,138,0.3)]",
    secondary: "bg-surface-raised border-border-subtle text-text-primary hover:bg-surface-hover hover:border-border-strong",
    outline: "bg-transparent border-accent text-text-accent hover:bg-accent hover:text-bg hover:shadow-[0_0_20px_rgba(212,175,138,0.3)]",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
