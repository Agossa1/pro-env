import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type IconButtonSize    = 'sm' | 'md' | 'lg';
type IconButtonVariant = 'default' | 'danger' | 'ghost';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon:       ReactNode;
  label?:     string;
  size?:      IconButtonSize;
  variant?:   IconButtonVariant;
}

const SIZES: Record<IconButtonSize, string> = {
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
};

const VARIANTS: Record<IconButtonVariant, string> = {
  default: 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
  danger:  'text-gray-500 hover:text-benin-red hover:bg-benin-red/10',
  ghost:   'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
};

function IconButton({
  icon,
  label,
  size    = 'md',
  variant = 'default',
  className = '',
  disabled,
  ...rest
}: IconButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center shrink-0 border border-transparent rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-benin-green/50';

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={`${baseClasses} ${SIZES[size]} ${VARIANTS[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      {...rest}
    >
      <span aria-hidden>{icon}</span>
    </button>
  );
}

export default IconButton;
