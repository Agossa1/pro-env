import { type ButtonHTMLAttributes } from 'react';
import Button, { type ButtonVariant, type ButtonSize } from './Button';

interface SubmitButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  isLoading?: boolean;
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  label?:     string;
}

function SubmitButton({
  isLoading = false,
  variant   = 'primary',
  size      = 'md',
  label     = 'Enregistrer',
  ...rest
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      isLoading={isLoading}
      {...rest}
    >
      {label}
    </Button>
  );
}

export default SubmitButton;
