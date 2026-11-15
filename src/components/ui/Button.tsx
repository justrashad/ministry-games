import { forwardRef, type ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'gold' | 'success' | 'danger' | 'ghost' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, block = false, className = '', children, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={`btn btn-${variant} btn-${size} ${block ? 'w-full' : ''} ${className}`} {...rest}>
      {Icon && <Icon aria-hidden className="btn-icon" />}
      {children !== undefined && children !== null && children !== false && <span>{children}</span>}
      {IconRight && <IconRight aria-hidden className="btn-icon" />}
    </button>
  );
});
