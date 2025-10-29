import { ButtonHTMLAttributes, forwardRef } from 'react'
import LoadingSpinner  from './LoadingSpinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors'
    const sizeStyles = {
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    }
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
    }

    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className} ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
      </button>
    )
  }
)