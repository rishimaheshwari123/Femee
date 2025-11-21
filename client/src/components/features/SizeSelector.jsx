import React from 'react';

const SizeSelector = ({
  sizes,
  selectedSize,
  onSizeSelect,
  disabled = false,
  className = '',
}) => {
  if (!sizes || sizes.length === 0) return null;

  const sizeArray = typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()) : sizes;

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Select Size
      </label>
      <div className="flex flex-wrap gap-2">
        {sizeArray.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onSizeSelect(size)}
            disabled={disabled}
            className={`
              px-4 py-2 border-2 rounded-lg font-medium transition-all duration-200
              ${
                selectedSize === size
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
