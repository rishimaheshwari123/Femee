import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  to,
  className = '',
  ...props
}) => {
  // Base styles with modern design
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95';

  // Variant styles with gradients and modern effects
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 focus:ring-primary-300 shadow-lg hover:shadow-glow hover:scale-105',
    secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 focus:ring-secondary-300 shadow-lg hover:shadow-xl hover:scale-105',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-300 hover:border-primary-600 hover:scale-105',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-300 hover:scale-105',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-300 shadow-lg hover:shadow-xl hover:scale-105',
    success: 'bg-gradient-to-r from-secondary-500 to-green-600 text-white hover:from-secondary-600 hover:to-green-700 focus:ring-secondary-300 shadow-lg hover:shadow-xl hover:scale-105',
    warning: 'bg-gradient-to-r from-accent-500 to-yellow-500 text-white hover:from-accent-600 hover:to-yellow-600 focus:ring-accent-300 shadow-lg hover:shadow-xl hover:scale-105',
    dark: 'bg-gradient-to-r from-dark-800 to-dark-900 text-white hover:from-dark-900 hover:to-black focus:ring-dark-500 shadow-lg hover:shadow-xl hover:scale-105',
  };

  // Size styles
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const classes = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && iconPosition === 'left' && !loading && <span className="mr-2 text-lg">{icon}</span>}
      <span className="font-display font-semibold">{children}</span>
      {icon && iconPosition === 'right' && !loading && <span className="ml-2 text-lg">{icon}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
