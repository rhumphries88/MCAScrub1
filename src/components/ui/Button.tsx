import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  isLoading = false,
  loadingText,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50";
  
  const variantStyles = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
    link: "bg-transparent underline text-blue-600 hover:text-blue-800"
  };
  
  const sizeStyles = {
    default: "py-2 px-4 text-sm",
    sm: "py-1 px-3 text-xs",
    lg: "py-3 px-6 text-base",
    icon: "p-2"
  };
  
  const disabledStyles = "opacity-50 cursor-not-allowed";
  
  const buttonClasses = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    disabled || isLoading ? disabledStyles : "",
    className
  ].join(" ");
  
  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {loadingText || children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};