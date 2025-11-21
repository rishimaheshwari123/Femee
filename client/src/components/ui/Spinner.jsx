import React from 'react';

const Spinner = ({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  className = '',
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colors = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    white: 'border-white',
    gray: 'border-gray-500',
  };

  const spinner = (
    <div
      className={`
        ${sizes[size]}
        border-4 ${colors[color]} border-t-transparent
        rounded-full animate-spin
        ${className}
      `}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Spinner;
