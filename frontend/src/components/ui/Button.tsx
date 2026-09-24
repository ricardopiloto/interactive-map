import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import './ui.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'secondary',
      size = 'md',
      block = false,
      className = '',
      type = 'button',
      children,
      ...rest
    },
    ref,
  ) {
    const sizeClass = size === 'sm' ? 'ui-btn--sm' : ''
    const blockClass = block ? 'ui-btn--block' : ''
    return (
      <button
        ref={ref}
        type={type}
        className={`ui-btn ui-touch ui-btn--${variant} ${sizeClass} ${blockClass} ${className}`.trim()}
        {...rest}
      >
        {children}
      </button>
    )
  },
)
