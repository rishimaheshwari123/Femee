import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaSpinner } from 'react-icons/fa';
import { Card } from '../components/ui';
import BinaryTreeVisualizationEnhanced from '../components/features/BinaryTreeVisualizationEnhanced';
import { getMemberProductTrees } from '../services/operations/binaryTree';

/**
 * Binary Trees Page
 * Shows all product trees with enhanced visualization
 */
const BinaryTreesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [productTrees, setProductTrees] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch product trees
  useEffect(() => {
    const fetchTrees = async () => {
      if (user?._id) {
        setLoading(true);
        const trees = await getMemberProductTrees(user._id);
        setProductTrees(trees);
        
        // Auto-select first product if available
        if (trees.length > 0) {
          setSelectedProduct(trees[0]);
        }
        
        setLoading(false);
      }
    };

    fetchTrees();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 p-6">
        <div className="flex items-center justify-center h-96">
          <FaSpinner className="animate-spin text-4xl text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-display font-bold text-dark-900 mb-2">
            My Binary Trees
          </h1>
          <p className="text-dark-600">
            Welcome back, {user?.userName}! Track your product networks.
          </p>
        </div>

        {/* Product Selector */}
        {productTrees.length > 0 && (
          <Card>
            <Card.Body>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm font-medium text-dark-700">Select Product:</span>
                {productTrees.map((tree) => (
                  <button
                    key={tree.productId}
                    onClick={() => setSelectedProduct(tree)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedProduct?.productId === tree.productId
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-100 text-dark-700 hover:bg-dark-200'
                    }`}
                  >
                    {tree.productName}
                  </button>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Binary Tree Visualization */}
        {selectedProduct ? (
          <BinaryTreeVisualizationEnhanced
            memberId={user._id}
            productId={selectedProduct.productId}
          />
        ) : (
          <Card>
            <Card.Body>
              <div className="text-center py-12">
                <p className="text-dark-600 font-medium mb-2">No Product Trees Yet</p>
                <p className="text-dark-500 text-sm">
                  Start by making your first purchase to join a product network
                </p>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BinaryTreesPage;
