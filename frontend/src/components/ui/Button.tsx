import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary: 'bg-primary-900 text-white hover:bg-primary-800 focus:ring-primary-900 shadow-sm active:scale-[0.98]',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-400 active:scale-[0.98]',
      outline: 'border border-slate-300 bg-transparent text-slate-800 hover:bg-slate-50 focus:ring-slate-400 active:scale-[0.98]',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm active:scale-[0.98]',
      accent: 'bg-brand-accent text-white hover:bg-orange-600 focus:ring-orange-500 shadow-md font-semibold active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
