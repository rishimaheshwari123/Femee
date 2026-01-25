import React, { useState, useEffect } from 'react';
import { FaUser, FaChevronDown, FaChevronUp, FaUsers } from 'react-icons/fa';
import { Card } from '../ui';

/**
 * BinaryTreeVisualization Component
 * Renders a visual representation of the binary tree structure
 * - Shows member nodes with names and positions
 * - Highlights current member's position
 * - Supports expand/collapse for large trees
 * 
 * Requirements: 7.7
 */
const BinaryTreeVisualization = ({ 
  rootMemberId, 
  productId, 
  currentMemberId,
  treeData 
}) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set([rootMemberId]));
  const [loading, setLoading] = useState(false);

  // Toggle node expansion
  const toggleNode = (memberId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  // Expand all nodes up to a certain depth
  const expandToDepth = (depth) => {
    const nodesToExpand = new Set();
    
    const traverse = (node, currentDepth) => {
      if (!node || currentDepth > depth) return;
      nodesToExpand.add(node.memberId);
      
      if (node.leftChild) traverse(node.leftChild, currentDepth + 1);
      if (node.rightChild) traverse(node.rightChild, currentDepth + 1);
    };
    
    if (treeData) {
      traverse(treeData, 0);
    }
    
    setExpandedNodes(nodesToExpand);
  };

  // Collapse all nodes
  const collapseAll = () => {
    setExpandedNodes(new Set([rootMemberId]));
  };

  return (
    <Card className="overflow-hidden">
      <Card.Header>
        <div className="flex items-center justify-between">
          <div>
            <Card.Title>Binary Tree Structure</Card.Title>
            <Card.Description>Visual representation of your product network</Card.Description>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => expandToDepth(2)}
              className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
            >
              Expand Level 2
            </button>
            <button
              onClick={() => expandToDepth(3)}
              className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
            >
              Expand Level 3
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1 text-sm bg-dark-100 text-dark-700 rounded-lg hover:bg-dark-200 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : treeData ? (
          <div className="overflow-x-auto pb-4">
            <div className="inline-block min-w-full">
              <TreeNode
                node={treeData}
                isExpanded={expandedNodes.has(treeData.memberId)}
                onToggle={toggleNode}
                currentMemberId={currentMemberId}
                expandedNodes={expandedNodes}
                level={0}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaUsers className="mx-auto text-4xl text-dark-300 mb-4" />
            <p className="text-dark-600">No tree data available</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

/**
 * TreeNode Component
 * Renders individual node in the binary tree
 */
const TreeNode = ({ 
  node, 
  isExpanded, 
  onToggle, 
  currentMemberId, 
  expandedNodes,
  level 
}) => {
  if (!node) return null;

  const isCurrentMember = node.memberId === currentMemberId;
  const hasChildren = node.leftChild || node.rightChild;
  const leftExpanded = node.leftChild && expandedNodes.has(node.leftChild.memberId);
  const rightExpanded = node.rightChild && expandedNodes.has(node.rightChild.memberId);

  return (
    <div className="flex flex-col items-center">
      {/* Current Node */}
      <div className="relative">
        <div
          className={`
            relative px-6 py-4 rounded-2xl shadow-lg transition-all duration-300
            ${isCurrentMember 
              ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white scale-110 shadow-glow' 
              : 'bg-white border-2 border-dark-200 hover:border-primary-300 hover:shadow-xl'
            }
            ${hasChildren ? 'cursor-pointer' : ''}
          `}
          onClick={() => hasChildren && onToggle(node.memberId)}
        >
          {/* Member Info */}
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-full
              ${isCurrentMember ? 'bg-white/20' : 'bg-primary-100'}
            `}>
              <FaUser className={`
                text-lg
                ${isCurrentMember ? 'text-white' : 'text-primary-600'}
              `} />
            </div>
            <div>
              <p className={`
                font-semibold text-sm
                ${isCurrentMember ? 'text-white' : 'text-dark-900'}
              `}>
                {node.memberName || 'Member'}
              </p>
              <p className={`
                text-xs
                ${isCurrentMember ? 'text-white/80' : 'text-dark-600'}
              `}>
                {node.userName || 'N/A'}
              </p>
            </div>
          </div>

          {/* Stats */}
          {node.stats && (
            <div className={`
              mt-2 pt-2 border-t
              ${isCurrentMember ? 'border-white/20' : 'border-dark-200'}
            `}>
              <div className="flex gap-4 text-xs">
                <div>
                  <span className={isCurrentMember ? 'text-white/80' : 'text-dark-600'}>
                    Left: {node.stats.leftCount || 0}
                  </span>
                </div>
                <div>
                  <span className={isCurrentMember ? 'text-white/80' : 'text-dark-600'}>
                    Right: {node.stats.rightCount || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Expand/Collapse Indicator */}
          {hasChildren && (
            <div className={`
              absolute -bottom-3 left-1/2 transform -translate-x-1/2
              w-6 h-6 rounded-full flex items-center justify-center
              ${isCurrentMember ? 'bg-white text-primary-600' : 'bg-primary-500 text-white'}
              shadow-lg
            `}>
              {isExpanded ? (
                <FaChevronUp className="text-xs" />
              ) : (
                <FaChevronDown className="text-xs" />
              )}
            </div>
          )}
        </div>

        {/* Current Member Badge */}
        {isCurrentMember && (
          <div className="absolute -top-2 -right-2 px-2 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full shadow-lg">
            You
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <>
          {/* Connecting Lines */}
          <div className="relative w-full h-12 flex items-center justify-center">
            <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-dark-300"></div>
            {node.leftChild && node.rightChild && (
              <div className="absolute top-6 left-1/4 right-1/4 h-0.5 bg-dark-300"></div>
            )}
            {node.leftChild && (
              <div className="absolute top-6 left-1/4 w-0.5 h-6 bg-dark-300"></div>
            )}
            {node.rightChild && (
              <div className="absolute top-6 right-1/4 w-0.5 h-6 bg-dark-300"></div>
            )}
          </div>

          {/* Child Nodes */}
          <div className="flex gap-8 items-start">
            {/* Left Child */}
            <div className="flex-1 flex justify-end">
              {node.leftChild ? (
                <TreeNode
                  node={node.leftChild}
                  isExpanded={leftExpanded}
                  onToggle={onToggle}
                  currentMemberId={currentMemberId}
                  expandedNodes={expandedNodes}
                  level={level + 1}
                />
              ) : (
                <EmptyNode position="left" />
              )}
            </div>

            {/* Right Child */}
            <div className="flex-1 flex justify-start">
              {node.rightChild ? (
                <TreeNode
                  node={node.rightChild}
                  isExpanded={rightExpanded}
                  onToggle={onToggle}
                  currentMemberId={currentMemberId}
                  expandedNodes={expandedNodes}
                  level={level + 1}
                />
              ) : (
                <EmptyNode position="right" />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * EmptyNode Component
 * Represents an empty position in the tree
 */
const EmptyNode = ({ position }) => {
  return (
    <div className="px-6 py-4 rounded-2xl border-2 border-dashed border-dark-200 bg-dark-50">
      <div className="flex items-center gap-2 text-dark-400">
        <FaUser className="text-sm" />
        <span className="text-xs font-medium">Empty {position}</span>
      </div>
    </div>
  );
};

export default BinaryTreeVisualization;
