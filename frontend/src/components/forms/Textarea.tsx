import { forwardRef, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', hasError, ...rest }, ref) => {
    const baseClasses = 'block w-full bg-white border rounded font-normal text-gray-900 placeholder-gray-400 p-4 text-base min-h-[120px] resize-y transition-colors focus:outline-none focus-visible:ring-2 focus-visible:border-benin-green disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed';
    
    const errorClasses = hasError
      ? 'border-benin-red focus-visible:ring-benin-red/20 focus-visible:border-benin-red'
      : 'border-gray-300 focus-visible:ring-benin-green/20';

    return (
      <textarea
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${className}`}
        aria-invalid={hasError ? 'true' : undefined}
        {...rest}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
