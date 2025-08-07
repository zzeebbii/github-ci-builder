import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  title?: string;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  variant = "secondary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  title,
  type = "button",
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary: "text-white bg-blue-600 border border-blue-600 hover:bg-blue-700",
    secondary: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-2",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      title={title}
    >
      {children}
    </button>
  );
}
