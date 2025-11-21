import React from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';

const QuantitySelector = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const sizes = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-11 w-11 text-base',
  };

  const buttonClass = `
    ${sizes[size]}
    flex items-center justify-center
    border border-gray-300 rounded
    hover:bg-gray-100 active:bg-gray-200
    transition-colors duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || quantity <= min}
        className={buttonClass}
        aria-label="Decrease quantity"
      >
        <FaMinus />
      </button>

      <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled || quantity >= max}
        className={buttonClass}
        aria-label="Increase quantity"
      >
        <FaPlus />
      </button>
    </div>
  );
};

export default QuantitySelector;
