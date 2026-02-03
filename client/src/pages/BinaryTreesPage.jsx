import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { Card } from '../components/ui';
import BinaryTreeVisualizationEnhanced from '../components/features/BinaryTreeVisualizationEnhanced';
import { getMemberProductTrees } from '../services/operations/binaryTree';
import { getMembersProfileApi } from '../services/operations/memeber';

/**
 * Binary Trees Page
 * Shows all product trees with enhanced visualization
 * Can be used by members (own trees) or admin (any member's trees)
 */
const BinaryTreesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { memberId } = useParams(); // For admin viewing other member's trees
  const [productTrees, setProductTrees] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingMember, setViewingMember] = useState(null);

  // Determine which member's trees to show
  const isAdminView = user?.role === 'admin' && memberId && memberId !== user?._id;
  const targetMemberId = isAdminView ? memberId : user?._id;

  console.log('=== BinaryTreesPage Debug ===');
  console.log('User:', user);
  console.log('URL memberId param:', memberId);
  console.log('isAdminView:', isAdminView);
  console.log('targetMemberId:', targetMemberId);
  console.log('===========================');

  // Fetch product trees
  useEffect(() => {
    const fetchTrees = async () => {
      if (!targetMemberId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Always fetch member info for display
        let memberInfo = null;
        if (isAdminView && memberId) {
          // Admin viewing another member
          console.log('Admin viewing member ID:', memberId);
          memberInfo = await getMembersProfileApi(memberId);
          console.log('Fetched member info:', memberInfo);
          if (memberInfo) {
            setViewingMember(memberInfo);
          } else {
            console.error('Failed to fetch member info');
            setViewingMember(null);
          }
        } else {
          // Member viewing their own trees
          console.log('Member viewing own trees');
          setViewingMember(user);
        }
        
        // Fetch product trees
        console.log('Fetching trees for member ID:', targetMemberId);
        const trees = await getMemberProductTrees(targetMemberId);
        console.log('Product trees fetched:', trees);
        setProductTrees(trees || []);
        
        // Auto-select first product if available
        if (trees && trees.length > 0) {
          setSelectedProduct(trees[0]);
        } else {
          setSelectedProduct(null);
        }
        
      } catch (error) {
        console.error('Error fetching trees:', error);
        setProductTrees([]);
        setSelectedProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTrees();
  }, [targetMemberId, isAdminView, memberId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-primary-500 mb-4 mx-auto" />
            <p className="text-dark-600">Loading binary trees...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          {isAdminView ? (
            viewingMember ? (
              <>
                <h1 className="text-4xl font-display font-bold text-dark-900 mb-2">
                  {viewingMember.fName} {viewingMember.lName}'s Binary Trees
                </h1>
                <p className="text-dark-600">
                  Viewing @{viewingMember.userName}'s product networks
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-display font-bold text-dark-900 mb-2">
                  Loading Member Info...
                </h1>
                <p className="text-dark-600">Please wait...</p>
              </>
            )
          ) : (
            <>
              <h1 className="text-4xl font-display font-bold text-dark-900 mb-2">
                My Binary Trees
              </h1>
              <p className="text-dark-600">
                Welcome back, {user?.userName}! Track your product networks.
              </p>
            </>
          )}
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
            memberId={targetMemberId}
            productId={selectedProduct.productId}
          />
        ) : (
          <Card>
            <Card.Body>
              <div className="text-center py-12">
                <p className="text-dark-600 font-medium mb-2">No Product Trees Yet</p>
                <p className="text-dark-500 text-sm">
                  {isAdminView 
                    ? 'This member has not joined any product networks yet'
                    : 'Start by making your first purchase to join a product network'
                  }
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
