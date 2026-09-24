import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import './ui.css'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, className = '', type = 'button', children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={`ui-btn ui-touch ui-icon-btn ui-btn--ghost ${className}`.trim()}
        {...rest}
      >
        {children}
      </button>
    )
  },
)
