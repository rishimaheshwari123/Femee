import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHeart, FaShoppingCart, FaEye } from 'react-icons/fa';
import { displayMoney } from '../../helper/utills';
import Badge from '../ui/Badge';

const ProductCard = ({ product, className = '' }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { user, token } = useSelector((state) => state.auth);

  const { _id, images, title, price, highPrice, sizes } = product;

  // Determine which price to show based on user role
  const displayPrice = !token || user?.role === 'user' ? highPrice : price;
  const showDiscount = highPrice > price;
  const discountPercent = showDiscount
    ? Math.round(((highPrice - price) / highPrice) * 100)
    : 0;

  return (
    <div 
      className={`group relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${_id}`}>
        <div className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary-50 to-accent-50">
            {/* Main Image */}
            <img
              src={images[0]?.url}
              alt={title}
              className={`w-full h-full object-cover transition-all duration-700 ${
                isHovered && images[1]?.url ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
              }`}
            />
            
            {/* Hover Image */}
            {images[1]?.url && (
              <img
                src={images[1]?.url}
                alt={title}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                }`}
              />
            )}

            {/* Discount Badge */}
            {showDiscount && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                  {discountPercent}% OFF
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                <button className="bg-white text-primary-600 p-3 rounded-full hover:bg-primary-600 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-lg">
                  <FaHeart />
                </button>
                <button className="bg-white text-primary-600 p-3 rounded-full hover:bg-primary-600 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-lg">
                  <FaShoppingCart />
                </button>
                <button className="bg-white text-primary-600 p-3 rounded-full hover:bg-primary-600 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-lg">
                  <FaEye />
                </button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-5 space-y-3">
            <h3 className="font-display font-semibold text-lg text-dark-900 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
              {title}
            </h3>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                {displayMoney(displayPrice)}
              </span>
              {showDiscount && (
                <span className="text-sm text-dark-400 line-through">
                  {displayMoney(highPrice)}
                </span>
              )}
            </div>

            {/* Sizes */}
            {sizes && (
              <div className="flex flex-wrap gap-2">
                {sizes.split(',').slice(0, 4).map((size, index) => (
                  <span
                    key={index}
                    className="text-xs px-3 py-1 bg-dark-100 text-dark-700 rounded-full font-medium hover:bg-primary-100 hover:text-primary-700 transition-colors duration-300"
                  >
                    {size.trim()}
                  </span>
                ))}
                {sizes.split(',').length > 4 && (
                  <span className="text-xs px-3 py-1 bg-dark-100 text-dark-700 rounded-full font-medium">
                    +{sizes.split(',').length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
