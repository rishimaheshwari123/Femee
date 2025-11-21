import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Alert = ({
  children,
  variant = 'info',
  title,
  onClose,
  icon: customIcon,
  className = '',
}) => {
  const variants = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <FaCheckCircle className="text-green-500" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <FaExclamationCircle className="text-red-500" />,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: <FaExclamationCircle className="text-yellow-500" />,
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <FaInfoCircle className="text-blue-500" />,
    },
  };

  const { container, icon } = variants[variant];
  const displayIcon = customIcon || icon;

  return (
    <div className={`border rounded-lg p-4 ${container} ${className}`}>
      <div className="flex items-start">
        {displayIcon && (
          <div className="flex-shrink-0 mr-3 mt-0.5">
            {displayIcon}
          </div>
        )}
        
        <div className="flex-1">
          {title && (
            <h3 className="font-semibold mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            <FaTimes />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
