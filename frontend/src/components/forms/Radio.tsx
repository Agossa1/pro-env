import { forwardRef, type InputHTMLAttributes } from 'react';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hasError?: boolean;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className = '', label, hasError, ...rest }, ref) => {
    return (
      <label className="inline-flex items-start gap-3 cursor-pointer">
        <input
          type="radio"
          ref={ref}
          className={`shrink-0 w-5 h-5 mt-0.5 rounded-full border appearance-none transition-colors checked:bg-benin-green checked:border-benin-green focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-benin-green/50 disabled:opacity-50 disabled:cursor-not-allowed
            ${hasError ? 'border-benin-red' : 'border-gray-300'}
            ${className}
          `}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3.5'/%3e%3c/svg%3e")`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          aria-invalid={hasError ? 'true' : undefined}
          {...rest}
        />
        <span className="text-base text-gray-900 select-none">
          {label}
        </span>
      </label>
    );
  }
);

Radio.displayName = 'Radio';

export default Radio;
