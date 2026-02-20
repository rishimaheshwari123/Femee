import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FaWallet, 
  FaChartLine, 
  FaLink, 
  FaSpinner,
  FaExclamationCircle
} from 'react-icons/fa';
import { Card, Button, Badge } from '../components/ui';
import ProductTreeCard from '../components/features/ProductTreeCard';
import BinaryTreeVisualizationEnhanced from '../components/features/BinaryTreeVisualizationEnhanced';
import {
  getMemberProductTrees,
  generateReferralLink,
  copyReferralLink
} from '../services/operations/binaryTree';
import { toast } from 'react-toastify';

/**
 * MemberDashboard Page
 * Main dashboard for members to view their product-wise binary trees
 * - Shows all product trees with stats
 * - Displays wallet balance and earnings
 * - Shows transaction history
 * - Allows referral link generation
 * 
 * Requirements: 7.1, 7.2
 */
const MemberDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [productTrees, setProductTrees] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [binaryTreeData, setBinaryTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview'); // overview, tree
  const [generatingLink, setGeneratingLink] = useState(null);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Fetch product trees on mount
  useEffect(() => {
    if (user?._id) {
      fetchProductTrees();
    }
  }, [user?._id]);

  // Fetch product trees
  const fetchProductTrees = async () => {
    setLoading(true);
    try {
      const trees = await getMemberProductTrees(user._id);
      setProductTrees(trees);
    } catch (error) {
      console.error('Error fetching product trees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view product tree details
  const handleViewTreeDetails = async (productTree) => {
    setSelectedProduct(productTree);
    setViewMode('tree');
  };

  // Handle generate referral link
  const handleGenerateReferralLink = async (productId) => {
    if (!productId) {
      toast.error('Product ID not found');
      return;
    }
    
    setGeneratingLink(productId);
    try {
      const linkData = await generateReferralLink(productId, user._id);
      if (linkData) {
        const success = await copyReferralLink(linkData);
        if (success) {
          toast.success('Referral link copied to clipboard!');
        } else {
          toast.error('Failed to copy link. Please try again.');
        }
      } else {
        toast.error('Failed to generate referral link');
      }
    } catch (error) {
      console.error('Error generating referral link:', error);
      toast.error('Error generating referral link');
    } finally {
      setGeneratingLink(null);
    }
  };

  // Handle back to overview
  const handleBackToOverview = () => {
    setViewMode('overview');
    setSelectedProduct(null);
    setBinaryTreeData(null);
  };

  // Calculate total stats
  const totalStats = React.useMemo(() => {
    return productTrees.reduce((acc, tree) => {
      // Handle ROOT-based system
      if (tree.systemType === 'ROOT' && tree.roots) {
        const totalBonus = tree.roots.reduce((sum, root) => 
          sum + (root.binaryStats?.totalMatchingBonus || 0), 0
        );
        const totalPairs = tree.roots.reduce((sum, root) => 
          sum + (root.binaryStats?.totalMatchedPairs || 0), 0
        );
        
        return {
          totalEarnings: acc.totalEarnings + totalBonus,
          totalPairs: acc.totalPairs + totalPairs,
          totalDownline: acc.totalDownline + (tree.stats?.totalDownline || 0),
          totalSpent: acc.totalSpent + (tree.stats?.totalSpent || 0)
        };
      }
      
      // Handle old flat system
      return {
        totalEarnings: acc.totalEarnings + (tree.binaryStats?.totalMatchingBonus || 0),
        totalPairs: acc.totalPairs + (tree.binaryStats?.totalMatchedPairs || 0),
        totalDownline: acc.totalDownline + (tree.stats?.totalDownline || 0),
        totalSpent: acc.totalSpent + (tree.stats?.totalSpent || 0)
      };
    }, { totalEarnings: 0, totalPairs: 0, totalDownline: 0, totalSpent: 0 });
  }, [productTrees]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-dark-900 mb-2">
              {viewMode === 'overview' ? 'My Binary Trees' : 'Binary Tree Visualization'}
            </h1>
            <p className="text-dark-600">
              {viewMode === 'overview' 
                ? `Welcome back, ${user?.fName || user?.userName}! Track your product networks.`
                : selectedProduct?.productId?.title || 'Product Details'}
            </p>
          </div>
          {viewMode !== 'overview' && (
            <Button onClick={handleBackToOverview} variant="outline">
              ← Back to Overview
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-primary-500" />
          </div>
        )}

        {/* Overview Mode */}
        {!loading && viewMode === 'overview' && (
          <>
            {/* Wallet & Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card hover className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 opacity-10"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-2xl">
                      <FaWallet className="text-2xl" />
                    </div>
                    <div>
                      <p className="text-sm text-dark-600">Wallet Balance</p>
                      <p className="text-2xl font-bold text-dark-900">
                        {formatCurrency(user?.wallet || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card hover className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-500 to-green-600 opacity-10"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-secondary-500 to-green-600 text-white rounded-2xl">
                      <FaChartLine className="text-2xl" />
                    </div>
                    <div>
                      <p className="text-sm text-dark-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-dark-900">
                        {formatCurrency(totalStats.totalEarnings)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card hover>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-2xl">
                    <FaChartLine className="text-2xl text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-600">Matched Pairs</p>
                    <p className="text-2xl font-bold text-dark-900">
                      {totalStats.totalPairs}
                    </p>
                  </div>
                </div>
              </Card>

              <Card hover>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-2xl">
                    <FaChartLine className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-600">Total Downline</p>
                    <p className="text-2xl font-bold text-dark-900">
                      {totalStats.totalDownline}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Product Trees */}
            {productTrees.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-dark-900">
                    Your Product Networks
                  </h2>
                  <Badge variant="primary" size="lg">
                    {productTrees.length} {productTrees.length === 1 ? 'Product' : 'Products'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {productTrees.map((tree, index) => {
                    // Extract productId properly (handle both string and object)
                    const productId = typeof tree.productId === 'object' 
                      ? tree.productId?._id 
                      : tree.productId;
                    
                    return (
                      <div key={productId || index} className="space-y-3">
                        <ProductTreeCard
                          productTree={tree}
                          onViewDetails={handleViewTreeDetails}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          fullWidth
                          onClick={() => handleGenerateReferralLink(productId)}
                          loading={generatingLink === productId}
                          icon={<FaLink />}
                        >
                          Get Link
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <FaExclamationCircle className="mx-auto text-5xl text-dark-300 mb-4" />
                  <h3 className="text-xl font-semibold text-dark-900 mb-2">
                    No Product Trees Yet
                  </h3>
                  <p className="text-dark-600 mb-6">
                    Start by making your first purchase to join a product network
                  </p>
                  <Button to="/shop" variant="primary">
                    Browse Products
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Tree Visualization Mode */}
        {!loading && viewMode === 'tree' && selectedProduct && (
          <div className="space-y-6">
            {/* Product Info Header */}
            <Card>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <img
                  src={selectedProduct.productImage}
                  alt={selectedProduct.productName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-2xl font-bold text-dark-900 truncate">
                    {selectedProduct.productName}
                  </h3>
                  <p className="text-xs sm:text-sm text-dark-600 line-clamp-2">
                    Binary tree structure and network visualization
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const productId = typeof selectedProduct.productId === 'object' 
                      ? selectedProduct.productId?._id 
                      : selectedProduct.productId;
                    handleGenerateReferralLink(productId);
                  }}
                  loading={generatingLink === (typeof selectedProduct.productId === 'object' 
                    ? selectedProduct.productId?._id 
                    : selectedProduct.productId)}
                  icon={<FaLink />}
                  className="w-full sm:w-auto flex-shrink-0 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Share Product</span>
                  <span className="sm:hidden">Share</span>
                </Button>
              </div>
            </Card>

            {/* Binary Tree Visualization */}
            <BinaryTreeVisualizationEnhanced
              key={`${user._id}-${selectedProduct.productId}`}
              memberId={user._id}
              productId={selectedProduct.productId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
