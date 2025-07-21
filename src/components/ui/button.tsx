import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  loading?: boolean;
  className?: string;
  asChild?: boolean;
}

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default', 
  loading = false,
  disabled,
  className = '',
  asChild = false,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center rounded-md font-medium
    transition-colors duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
    ring-offset-background
  `;
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500',
    ghost: 'hover:bg-gray-100 focus-visible:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
  };
  
  const sizes = {
    default: 'h-10 py-2 px-4 text-sm',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8 text-base'
  };

  const isDisabled = disabled || loading;
  const Comp = asChild ? Slot : 'button';

  // When asChild is true and loading, we can't show the loader
  // because Slot expects exactly one child element
  if (asChild) {
    return (
      <Comp
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 
          size={16} 
          className="mr-2 animate-spin" 
          aria-hidden="true"
        />
      )}
      {children}
    </Comp>
  );
}
