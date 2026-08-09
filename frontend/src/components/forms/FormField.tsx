import { type ReactNode } from 'react';

interface FormFieldProps {
  id?:         string;
  label:       string;
  children:    ReactNode;
  error?:      string;
  helpText?:   string;
  required?:   boolean;
}

function FormField({ id, label, children, error, helpText, required }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2 mb-5">
      <label htmlFor={id} className="text-base font-semibold text-gray-900 block">
        {label}
        {required && <span className="text-benin-red ml-1" aria-hidden="true">*</span>}
      </label>
      
      {children}
      
      {error && (
        <p className="text-sm font-medium text-benin-red m-0" role="alert" id={id ? `${id}-error` : undefined}>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500 m-0" id={id ? `${id}-help` : undefined}>
          {helpText}
        </p>
      )}
    </div>
  );
}

export default FormField;
