import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  fieldSize?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-14 px-5 text-lg',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', hasError, fieldSize = 'md', ...rest }, ref) => {
    const baseClasses = 'block w-full bg-white border rounded font-normal text-gray-900 placeholder-gray-400 appearance-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:border-benin-green disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed';
    
    const errorClasses = hasError
      ? 'border-benin-red focus-visible:ring-benin-red/20 focus-visible:border-benin-red'
      : 'border-gray-300 focus-visible:ring-benin-green/20';

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${SIZES[fieldSize]} ${errorClasses} ${className}`}
        aria-invalid={hasError ? 'true' : undefined}
        {...rest}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
