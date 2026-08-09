import { type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning';
export type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  isLoading?: boolean;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:   'bg-benin-green text-white hover:bg-benin-green-dark border-transparent',
  secondary: 'bg-transparent text-benin-green border-benin-green hover:bg-benin-green/10',
  ghost:     'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-100',
  danger:    'bg-benin-red text-white hover:bg-benin-red-dark border-transparent',
  warning:   'bg-benin-yellow text-gray-900 hover:bg-benin-yellow-dark border-transparent',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-14 px-8 text-lg',
};

function Button({
  variant  = 'primary',
  size     = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium border rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-benin-green/50 whitespace-nowrap select-none';
  
  return (
    <button
      className={`${baseClasses} ${SIZES[size]} ${VARIANTS[variant]} ${
        disabled || isLoading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        leftIcon && <span className="shrink-0" aria-hidden>{leftIcon}</span>
      )}
      
      {children}
      
      {!isLoading && rightIcon && (
        <span className="shrink-0" aria-hidden>{rightIcon}</span>
      )}
    </button>
  );
}

export default Button;
