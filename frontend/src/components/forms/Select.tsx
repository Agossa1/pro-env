import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  fieldSize?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 'h-9 pl-3 pr-10 text-sm',
  md: 'h-11 pl-4 pr-10 text-base',
  lg: 'h-14 pl-5 pr-10 text-lg',
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', hasError, fieldSize = 'md', children, ...rest }, ref) => {
    const baseClasses = 'block w-full bg-white border rounded font-normal text-gray-900 appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:16px_12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:border-benin-green disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed';
    
    const errorClasses = hasError
      ? 'border-benin-red focus-visible:ring-benin-red/20 focus-visible:border-benin-red'
      : 'border-gray-300 focus-visible:ring-benin-green/20';

    // SVG Chevron Down for background-image
    const chevronSvg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='#6b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M6 8l4 4 4-4'/></svg>`
    );
    const bgImage = `url("data:image/svg+xml;charset=utf-8,${chevronSvg}")`;

    return (
      <select
        ref={ref}
        className={`${baseClasses} ${SIZES[fieldSize]} ${errorClasses} ${className}`}
        style={{ backgroundImage: bgImage }}
        aria-invalid={hasError ? 'true' : undefined}
        {...rest}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

export default Select;
