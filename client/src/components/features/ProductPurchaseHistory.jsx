import React, { useState } from 'react';
import { FaShoppingCart, FaUser, FaCalendar, FaStar, FaFilter } from 'react-icons/fa';
import { Card, Badge } from '../ui';

/**
 * ProductPurchaseHistory Component
 * Displays purchase history for a specific product
 * - Shows order ID, amount, date, referrer
 * - Highlights first purchase
 * - Supports filtering and sorting
 * 
 * Requirements: 7.6
 */
const ProductPurchaseHistory = ({ purchases, productName }) => {
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc
  const [filterFirstPurchase, setFilterFirstPurchase] = useState(false);

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sort and filter purchases
  const processedPurchases = React.useMemo(() => {
    let filtered = [...(purchases || [])];

    // Apply filter
    if (filterFirstPurchase) {
      filtered = filtered.filter(p => p.isFirstPurchase);
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.purchaseDate) - new Date(a.purchaseDate);
        case 'date-asc':
          return new Date(a.purchaseDate) - new Date(b.purchaseDate);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [purchases, sortBy, filterFirstPurchase]);

  // Calculate totals
  const totalAmount = purchases?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const totalQuantity = purchases?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <div>
            <Card.Title>Purchase History</Card.Title>
            <Card.Description>
              {productName ? `All purchases for ${productName}` : 'Your purchase history'}
            </Card.Description>
          </div>
          <div className="flex items-center gap-2">
            <FaShoppingCart className="text-primary-500 text-xl" />
            <span className="text-2xl font-bold text-dark-900">
              {purchases?.length || 0}
            </span>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-4">
            <p className="text-xs text-dark-600 mb-1">Total Purchases</p>
            <p className="text-2xl font-bold text-dark-900">{purchases?.length || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl p-4">
            <p className="text-xs text-dark-600 mb-1">Total Quantity</p>
            <p className="text-2xl font-bold text-dark-900">{totalQuantity}</p>
          </div>
          <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-4">
            <p className="text-xs text-dark-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-dark-900">{formatCurrency(totalAmount)}</p>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-dark-200">
          <div className="flex items-center gap-2">
            <FaFilter className="text-dark-500" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterFirstPurchase}
                onChange={(e) => setFilterFirstPurchase(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-dark-700">Show only first purchases</span>
            </label>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-dark-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        {/* Purchase List */}
        {processedPurchases.length > 0 ? (
          <div className="space-y-3">
            {processedPurchases.map((purchase, index) => (
              <PurchaseItem
                key={purchase.orderId || index}
                purchase={purchase}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaShoppingCart className="mx-auto text-4xl text-dark-300 mb-4" />
            <p className="text-dark-600">
              {filterFirstPurchase 
                ? 'No first purchases found' 
                : 'No purchases yet'}
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

/**
 * PurchaseItem Component
 * Renders individual purchase entry
 */
const PurchaseItem = ({ purchase, formatCurrency, formatDate }) => {
  const {
    orderId,
    amount,
    quantity,
    purchaseDate,
    referrerId,
    isFirstPurchase
  } = purchase;

  return (
    <div className={`
      relative p-4 rounded-2xl border-2 transition-all duration-300
      ${isFirstPurchase 
        ? 'border-primary-300 bg-gradient-to-br from-primary-50 to-accent-50 shadow-lg' 
        : 'border-dark-200 bg-white hover:border-primary-200 hover:shadow-md'
      }
    `}>
      {/* First Purchase Badge */}
      {isFirstPurchase && (
        <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1">
          <FaStar className="text-xs" />
          <span>First Purchase</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left Section - Order Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`
              p-2 rounded-lg
              ${isFirstPurchase ? 'bg-primary-200' : 'bg-dark-100'}
            `}>
              <FaShoppingCart className={`
                ${isFirstPurchase ? 'text-primary-600' : 'text-dark-600'}
              `} />
            </div>
            <div>
              <p className="font-semibold text-dark-900 text-sm">
                Order #{orderId?._id?.slice(-8) || 'N/A'}
              </p>
              <div className="flex items-center gap-2 text-xs text-dark-600">
                <FaCalendar className="text-xs" />
                <span>{formatDate(purchaseDate)}</span>
              </div>
            </div>
          </div>

          {/* Referrer Info */}
          {referrerId && (
            <div className="flex items-center gap-2 mt-2 text-xs">
              <FaUser className="text-dark-500" />
              <span className="text-dark-600">
                Referred by: <span className="font-semibold text-dark-900">
                  {referrerId.userName || referrerId.fName || 'N/A'}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Right Section - Amount */}
        <div className="text-right">
          <p className={`
            text-2xl font-bold mb-1
            ${isFirstPurchase ? 'text-primary-600' : 'text-dark-900'}
          `}>
            {formatCurrency(amount)}
          </p>
          <p className="text-xs text-dark-600">
            Qty: {quantity || 1}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPurchaseHistory;
