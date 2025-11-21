import React from 'react';
import { displayMoney } from '../../helper/utills';

const PriceDisplay = ({
  price,
  originalPrice,
  size = 'md',
  showDiscount = true,
  className = '',
}) => {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const sizes = {
    sm: {
      price: 'text-base',
      original: 'text-sm',
      discount: 'text-xs',
    },
    md: {
      price: 'text-lg',
      original: 'text-base',
      discount: 'text-sm',
    },
    lg: {
      price: 'text-xl',
      original: 'text-lg',
      discount: 'text-base',
    },
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className={`font-semibold text-gray-900 ${sizes[size].price}`}>
        {displayMoney(price)}
      </span>

      {hasDiscount && (
        <>
          <span className={`text-gray-500 line-through ${sizes[size].original}`}>
            {displayMoney(originalPrice)}
          </span>
          {showDiscount && (
            <span className={`text-green-600 font-medium ${sizes[size].discount}`}>
              ({discountPercent}% OFF)
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default PriceDisplay;
