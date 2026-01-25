import React from 'react';
import { FaChartLine, FaUsers, FaCoins, FaArrowRight } from 'react-icons/fa';
import { Card, Badge } from '../ui';

/**
 * ProductTreeCard Component
 * Displays product-specific binary tree statistics including:
 * - Product name and image
 * - Left/right leg counts and volumes
 * - Carry forward amounts
 * - Total pairs and bonus earned
 * 
 * Requirements: 7.2, 7.3, 7.4, 7.5
 */
const ProductTreeCard = ({ productTree, onViewDetails }) => {
  const {
    productId,
    productName,
    productImage,
    productPrice,
    systemType,
    currentActiveRoot,
    totalRoots,
    roots,
    stats,
    binaryStats
  } = productTree;

  // Check if this is ROOT-based system or old flat system
  const isRootSystem = systemType === 'ROOT' && roots && roots.length > 0;
  
  // For ROOT system, get active ROOT stats
  const activeRoot = isRootSystem ? roots.find(r => r.rootNumber === currentActiveRoot) : null;
  
  // Extract binary position data (from active ROOT or flat system)
  const leftLegCount = isRootSystem 
    ? (activeRoot?.binaryStats?.leftLegCount || 0)
    : (binaryStats?.leftLegCount || 0);
  const rightLegCount = isRootSystem 
    ? (activeRoot?.binaryStats?.rightLegCount || 0)
    : (binaryStats?.rightLegCount || 0);
  const leftVolume = isRootSystem 
    ? (activeRoot?.binaryStats?.leftVolume || 0)
    : (binaryStats?.leftVolume || 0);
  const rightVolume = isRootSystem 
    ? (activeRoot?.binaryStats?.rightVolume || 0)
    : (binaryStats?.rightVolume || 0);
  const carryForwardLeft = isRootSystem 
    ? (activeRoot?.binaryStats?.carryForwardLeft || 0)
    : (binaryStats?.carryForwardLeft || 0);
  const carryForwardRight = isRootSystem 
    ? (activeRoot?.binaryStats?.carryForwardRight || 0)
    : (binaryStats?.carryForwardRight || 0);
  const totalMatchedPairs = isRootSystem 
    ? (activeRoot?.binaryStats?.totalMatchedPairs || 0)
    : (binaryStats?.totalMatchedPairs || 0);
  const totalMatchingBonus = isRootSystem 
    ? (activeRoot?.binaryStats?.totalMatchingBonus || 0)
    : (binaryStats?.totalMatchingBonus || 0);
  
  // Get stats
  const totalPurchases = stats?.totalPurchases || 0;
  const totalSpent = stats?.totalSpent || 0;
  const firstPurchaseDate = stats?.firstPurchaseDate;
  const lastPurchaseDate = stats?.lastPurchaseDate;
  const isActive = stats?.isActive || false;
  const directReferrals = stats?.directReferrals || 0;
  const totalDownline = stats?.totalDownline || 0;
  
  // Calculate complete ROOTs count
  const completeRootsCount = isRootSystem 
    ? roots.filter(r => r.status === 'COMPLETE').length 
    : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card hover className="relative overflow-hidden group">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        {/* Header with Product Info */}
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-dark-200">
          <img
            src={productImage || 'https://via.placeholder.com/80'}
            alt={productName || 'Product'}
            className="w-20 h-20 rounded-2xl object-cover shadow-lg"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-display font-bold text-dark-900 mb-1">
                  {productName || 'Product Name'}
                </h3>
                <p className="text-sm text-dark-600">
                  {formatCurrency(productPrice || 0)} per unit
                </p>
              </div>
              <Badge variant={isActive ? 'success' : 'secondary'} size="sm">
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        {/* ROOT System Info (if applicable) */}
        {isRootSystem && (
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FaChartLine className="text-primary-600 text-lg" />
              <span className="text-sm font-semibold text-dark-700">ROOT System Status</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-dark-600 mb-1">Total ROOTs</p>
                <p className="text-2xl font-bold text-dark-900">{totalRoots}</p>
              </div>
              <div>
                <p className="text-xs text-dark-600 mb-1">Complete</p>
                <p className="text-2xl font-bold text-green-600">{completeRootsCount}</p>
              </div>
              <div>
                <p className="text-xs text-dark-600 mb-1">Active ROOT</p>
                <p className="text-2xl font-bold text-primary-600">#{currentActiveRoot}</p>
              </div>
            </div>
            {activeRoot && (
              <div className="mt-3 pt-3 border-t border-primary-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-600">Active ROOT Progress:</span>
                  <span className="font-semibold text-dark-900">
                    {activeRoot.totalMembers}/{activeRoot.maxCapacity} members
                  </span>
                </div>
                <div className="mt-2 w-full bg-dark-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(activeRoot.totalMembers / activeRoot.maxCapacity) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Binary Tree Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Left Leg */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-dark-700">Left Leg</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-600">Members</span>
                <span className="text-lg font-bold text-dark-900">{leftLegCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-600">Volume</span>
                <span className="text-sm font-semibold text-dark-900">
                  {formatCurrency(leftVolume)}
                </span>
              </div>
              {carryForwardLeft > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-blue-200">
                  <span className="text-xs text-dark-600">Carry Forward</span>
                  <span className="text-xs font-semibold text-blue-600">
                    {formatCurrency(carryForwardLeft)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Leg */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-dark-700">Right Leg</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-600">Members</span>
                <span className="text-lg font-bold text-dark-900">{rightLegCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-600">Volume</span>
                <span className="text-sm font-semibold text-dark-900">
                  {formatCurrency(rightVolume)}
                </span>
              </div>
              {carryForwardRight > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-green-200">
                  <span className="text-xs text-dark-600">Carry Forward</span>
                  <span className="text-xs font-semibold text-green-600">
                    {formatCurrency(carryForwardRight)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Matching Bonus Stats */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FaCoins className="text-purple-600 text-lg" />
            <span className="text-sm font-semibold text-dark-700">Matching Bonus</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-dark-600 mb-1">Total Pairs</p>
              <p className="text-2xl font-bold text-dark-900">{totalMatchedPairs}</p>
            </div>
            <div>
              <p className="text-xs text-dark-600 mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalMatchingBonus)}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FaUsers className="text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-dark-600">Direct Referrals</p>
              <p className="text-lg font-bold text-dark-900">{directReferrals}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-100 rounded-lg">
              <FaChartLine className="text-accent-600" />
            </div>
            <div>
              <p className="text-xs text-dark-600">Total Downline</p>
              <p className="text-lg font-bold text-dark-900">{totalDownline}</p>
            </div>
          </div>
        </div>

        {/* Purchase Stats */}
        <div className="bg-dark-50 rounded-2xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-dark-600 mb-1">Total Purchases</p>
              <p className="font-semibold text-dark-900">{totalPurchases}</p>
            </div>
            <div>
              <p className="text-xs text-dark-600 mb-1">Total Spent</p>
              <p className="font-semibold text-dark-900">{formatCurrency(totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-dark-600 mb-1">First Purchase</p>
              <p className="font-semibold text-dark-900">{formatDate(firstPurchaseDate)}</p>
            </div>
            <div>
              <p className="text-xs text-dark-600 mb-1">Last Purchase</p>
              <p className="font-semibold text-dark-900">{formatDate(lastPurchaseDate)}</p>
            </div>
          </div>
        </div>

        {/* View Details Button */}
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(productTree)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-2xl hover:from-primary-600 hover:to-accent-600 transition-all duration-300 hover:shadow-lg group"
          >
            <span>View Binary Tree</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </Card>
  );
};

export default ProductTreeCard;
