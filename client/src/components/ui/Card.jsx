import React from 'react';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-3xl transition-all duration-300';

  const variants = {
    default: 'border border-dark-200 shadow-soft',
    elevated: 'shadow-xl',
    outlined: 'border-2 border-dark-300',
    flat: 'border border-dark-100',
    gradient: 'bg-gradient-to-br from-primary-50 to-accent-50 border-0 shadow-lg',
    glass: 'bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const hoverStyles = hover ? 'hover:shadow-2xl hover:-translate-y-2 cursor-pointer hover:border-primary-200' : '';
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  const classes = `
    ${baseStyles}
    ${variants[variant]}
    ${paddings[padding]}
    ${hoverStyles}
    ${clickableStyles}
    ${className}
  `.trim();

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

// Card Sub-components with modern styling
Card.Header = ({ children, className = '' }) => (
  <div className={`border-b border-dark-200 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`border-t border-dark-200 pt-4 mt-4 ${className}`}>
    {children}
  </div>
);

Card.Title = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-display font-bold text-dark-900 ${className}`}>
    {children}
  </h3>
);

Card.Description = ({ children, className = '' }) => (
  <p className={`text-base text-dark-600 leading-relaxed ${className}`}>
    {children}
  </p>
);

export default Card;
