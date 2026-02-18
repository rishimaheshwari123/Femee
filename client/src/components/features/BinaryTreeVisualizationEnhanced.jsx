import React, { useState, useEffect } from 'react';
import { FaUser, FaChevronDown, FaChevronUp, FaUsers, FaSpinner, FaTrophy } from 'react-icons/fa';
import { Card } from '../ui';
import { getBinaryTreeStructure } from '../../services/operations/binaryTree';
import ALMLClaimsModal from './ALMLClaimsModal';

/**
 * Enhanced Binary Tree Visualization Component
 * Shows complete tree with usernames and parent-child relationships
 */
const BinaryTreeVisualizationEnhanced = ({ 
  memberId, 
  productId
}) => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // 'tree', 'list', 'levels'
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showClaimsModal, setShowClaimsModal] = useState(false);

  // Fetch tree data
  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Clear previous data when memberId changes to prevent showing stale data
        setTreeData(null);
        setSelectedRoot(null);
        setExpandedNodes(new Set());
        
        const response = await getBinaryTreeStructure(memberId, productId);
        
        if (response.success) {
          setTreeData(response.data);
          // Select first ROOT by default
          if (response.data.trees && response.data.trees.length > 0) {
            setSelectedRoot(response.data.trees[0]);
            // Expand root node by default
            setExpandedNodes(new Set([response.data.rootMember.id]));
          }
        } else {
          setError(response.message || 'Failed to load tree data');
        }
      } catch (err) {
        console.error('Error fetching tree data:', err);
        setError('Failed to load tree data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (memberId && productId) {
      fetchTreeData();
    }
  }, [memberId, productId]);

  // Toggle node expansion
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Expand all nodes
  const expandAll = () => {
    if (!selectedRoot || !selectedRoot.treeStructure) return;
    
    const allNodes = new Set();
    const traverse = (node) => {
      if (!node) return;
      allNodes.add(node.id);
      if (node.left) traverse(node.left);
      if (node.right) traverse(node.right);
    };
    
    traverse(selectedRoot.treeStructure);
    setExpandedNodes(allNodes);
  };

  // Collapse all nodes
  const collapseAll = () => {
    if (treeData) {
      setExpandedNodes(new Set([treeData.rootMember.id]));
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Body>
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-primary-500 mb-4" />
            <p className="text-dark-600">Loading binary tree...</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center py-12">
            <FaUsers className="mx-auto text-4xl text-red-300 mb-4" />
            <p className="text-red-600 font-medium mb-2">Error Loading Tree</p>
            <p className="text-dark-600 text-sm">{error}</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!treeData || !treeData.trees || treeData.trees.length === 0) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center py-12">
            <FaUsers className="mx-auto text-4xl text-dark-300 mb-4" />
            <p className="text-dark-600 font-medium mb-2">No Product Trees Yet</p>
            <p className="text-dark-500 text-sm">Start by making your first purchase to join a product network</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Check if selected ROOT is empty (no members in tree)
  const isEmptyRoot = selectedRoot && selectedRoot.totalMembers === 0;

  return (
    <div className="space-y-1.5 md:space-y-2">
      {/* Header Card */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between flex-wrap gap-1.5 md:gap-2">
            <div>
              <Card.Title className="text-xs md:text-base">My Binary Tree</Card.Title>
              <Card.Description className="text-[10px] md:text-xs">
                {treeData.totalRoots} ROOT{treeData.totalRoots > 1 ? 's' : ''} • 
                Active ROOT: {treeData.currentActiveRoot}
              </Card.Description>
            </div>
            
            {/* View Mode Selector */}
            <div className="flex gap-0.5 md:gap-1">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[9px] md:text-xs font-medium transition-colors ${
                  viewMode === 'tree'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-100 text-dark-700 hover:bg-dark-200'
                }`}
              >
                Tree
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[9px] md:text-xs font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-100 text-dark-700 hover:bg-dark-200'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('levels')}
                className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[9px] md:text-xs font-medium transition-colors ${
                  viewMode === 'levels'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-100 text-dark-700 hover:bg-dark-200'
                }`}
              >
                Step
              </button>
            </div>
          </div>
        </Card.Header>
      </Card>

      {/* ROOT Selector */}
      {treeData.trees.length > 1 && (
        <Card>
          <Card.Body>
            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
              <span className="text-[10px] md:text-xs font-medium text-dark-700">Select ROOT:</span>
              {treeData.trees.map((root) => (
                <button
                  key={root.rootNumber}
                  onClick={() => setSelectedRoot(root)}
                  className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[9px] md:text-xs font-medium transition-colors ${
                    selectedRoot?.rootNumber === root.rootNumber
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-100 text-dark-700 hover:bg-dark-200'
                  }`}
                >
                  ROOT {root.rootNumber} ({root.totalMembers}/{root.maxCapacity})
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* ROOT Stats */}
      {selectedRoot && (
        <Card>
          <Card.Body>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-1 md:gap-2 text-xs">
              <div className="text-center">
                <p className="text-sm md:text-base font-bold text-primary-600">{selectedRoot.totalMembers}</p>
                <p className="text-[8px] md:text-[10px] text-dark-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-sm md:text-base font-bold text-dark-900">{selectedRoot.levels.level1.filled}/{selectedRoot.levels.level1.capacity}</p>
                <p className="text-[8px] md:text-[10px] text-dark-600">S1</p>
              </div>
              <div className="text-center">
                <p className="text-sm md:text-base font-bold text-dark-900">{selectedRoot.levels.level2.filled}/{selectedRoot.levels.level2.capacity}</p>
                <p className="text-[8px] md:text-[10px] text-dark-600">S2</p>
              </div>
              <div className="text-center">
                <p className="text-sm md:text-base font-bold text-dark-900">{selectedRoot.levels.level3.filled}/{selectedRoot.levels.level3.capacity}</p>
                <p className="text-[8px] md:text-[10px] text-dark-600">S3</p>
              </div>
              <div className="text-center">
                <p className="text-sm md:text-base font-bold text-dark-900">{selectedRoot.levels.level4.filled}/{selectedRoot.levels.level4.capacity}</p>
                <p className="text-[8px] md:text-[10px] text-dark-600">S4</p>
              </div>
              <div className="text-center">
                <p className="text-sm md:text-base font-bold text-dark-900">{selectedRoot.levels.level5.filled}/{selectedRoot.levels.level5.capacity}</p>
                <p className="text-[8px] md:text-[10px] text-dark-600">S5</p>
              </div>
              <div className="text-center">
                <span className={`inline-block px-1 md:px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-medium ${
                  selectedRoot.status === 'COMPLETE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedRoot.status}
                </span>
                <p className="text-[8px] md:text-[10px] text-dark-600 mt-0.5">Status</p>
              </div>
              <div className="text-center">
                <button
                  onClick={() => setShowClaimsModal(true)}
                  className="inline-flex items-center gap-0.5 md:gap-1 px-1 md:px-2 py-0.5 md:py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded text-[8px] md:text-[10px] font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <FaTrophy className="text-[8px] md:text-xs" />
                  <span className="hidden md:inline">Claims</span>
                </button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* ALML Claims Modal */}
      {showClaimsModal && selectedRoot && (
        <ALMLClaimsModal
          isOpen={showClaimsModal}
          onClose={() => setShowClaimsModal(false)}
          memberId={memberId}
          productId={productId}
          rootNumber={selectedRoot.rootNumber}
          productTitle={treeData.productName || 'Product'}
        />
      )}

      {/* Tree Content */}
      {selectedRoot && (
        <>
          {isEmptyRoot ? (
            <Card>
              <Card.Body>
                <div className="text-center py-12">
                  <FaUsers className="mx-auto text-5xl text-dark-300 mb-4" />
                  <h3 className="text-xl font-semibold text-dark-900 mb-2">
                    No Downline Yet
                  </h3>
                  <p className="text-dark-600 mb-4">
                    Your ROOT {selectedRoot.rootNumber} is empty. Start building your network by sharing your referral link!
                  </p>
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-primary-700 mb-2">
                      <span className="font-semibold">How to build your network:</span>
                    </p>
                    <ol className="text-sm text-primary-600 text-left space-y-1">
                      <li>1. Share your referral link with others</li>
                      <li>2. When they purchase using your link, they join your ROOT</li>
                      <li>3. Your tree will grow automatically</li>
                      <li>4. Earn matching bonus as your network grows</li>
                    </ol>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <>
              {viewMode === 'tree' && (
                <TreeView
                  treeStructure={selectedRoot.treeStructure}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                  expandAll={expandAll}
                  collapseAll={collapseAll}
                  rootMemberId={treeData.rootMember.id}
                />
              )}

              {viewMode === 'list' && (
                <ListView
                  parentChildList={selectedRoot.parentChildList}
                />
              )}

              {viewMode === 'levels' && (
                <LevelView
                  levelWiseData={selectedRoot.levelWiseData}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Tree View Component
 */
const TreeView = ({ treeStructure, expandedNodes, toggleNode, expandAll, collapseAll, rootMemberId }) => {
  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <Card.Title className="text-xs md:text-sm">Tree Structure</Card.Title>
          <div className="flex gap-0.5 md:gap-1">
            <button
              onClick={expandAll}
              className="px-1.5 md:px-2 py-0.5 text-[9px] md:text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
            >
              Expand
            </button>
            <button
              onClick={collapseAll}
              className="px-1.5 md:px-2 py-0.5 text-[9px] md:text-xs bg-dark-100 text-dark-700 rounded hover:bg-dark-200 transition-colors"
            >
              Collapse
            </button>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="overflow-x-auto pb-1 md:pb-2">
          <div className="inline-block min-w-full">
            <TreeNode
              node={treeStructure}
              isExpanded={expandedNodes.has(treeStructure?.id)}
              onToggle={toggleNode}
              expandedNodes={expandedNodes}
              isRoot={true}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

/**
 * Tree Node Component
 */
const TreeNode = ({ node, isExpanded, onToggle, expandedNodes, isRoot = false }) => {
  if (!node) return null;

  const hasChildren = node.left || node.right;

  return (
    <div className="flex flex-col items-center">
      {/* Current Node */}
      <div className="relative">
        <div
          className={`
            relative px-2 md:px-3 py-1.5 md:py-2 rounded-lg shadow transition-all duration-300
            ${isRoot 
              ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white scale-105 shadow-glow' 
              : 'bg-white border border-dark-200 hover:border-primary-300 hover:shadow-md'
            }
            ${hasChildren ? 'cursor-pointer' : ''}
          `}
          onClick={() => hasChildren && onToggle(node.id)}
        >
          <div className="flex items-center gap-1 md:gap-2">
            <div className={`
              p-0.5 md:p-1 rounded-full
              ${isRoot ? 'bg-white/20' : 'bg-primary-100'}
            `}>
              <FaUser className={`
                text-[8px] md:text-xs
                ${isRoot ? 'text-white' : 'text-primary-600'}
              `} />
            </div>
            <div>
              <p className={`
                font-semibold text-[9px] md:text-xs
                ${isRoot ? 'text-white' : 'text-dark-900'}
              `}>
                {node.name}
              </p>
              <p className={`
                text-[7px] md:text-[10px]
                ${isRoot ? 'text-white/80' : 'text-dark-600'}
              `}>
                S{node.level} • {node.position}
              </p>
            </div>
          </div>

          {hasChildren && (
            <div className={`
              absolute -bottom-1.5 md:-bottom-2 left-1/2 transform -translate-x-1/2
              w-3 h-3 md:w-4 md:h-4 rounded-full flex items-center justify-center
              ${isRoot ? 'bg-white text-primary-600' : 'bg-primary-500 text-white'}
              shadow
            `}>
              {isExpanded ? (
                <FaChevronUp className="text-[6px] md:text-[8px]" />
              ) : (
                <FaChevronDown className="text-[6px] md:text-[8px]" />
              )}
            </div>
          )}
        </div>

        {isRoot && (
          <div className="absolute -top-0.5 md:-top-1 -right-0.5 md:-right-1 px-1 md:px-1.5 py-0.5 bg-accent-500 text-white text-[7px] md:text-[9px] font-semibold rounded-full shadow">
            ROOT
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <>
          {/* Connecting Lines */}
          <div className="relative w-full h-6 md:h-8 flex items-center justify-center">
            <div className="absolute top-0 left-1/2 w-0.5 h-3 md:h-4 bg-dark-300"></div>
            {node.left && node.right && (
              <div className="absolute top-3 md:top-4 left-1/4 right-1/4 h-0.5 bg-dark-300"></div>
            )}
            {node.left && (
              <div className="absolute top-3 md:top-4 left-1/4 w-0.5 h-3 md:h-4 bg-dark-300"></div>
            )}
            {node.right && (
              <div className="absolute top-3 md:top-4 right-1/4 w-0.5 h-3 md:h-4 bg-dark-300"></div>
            )}
          </div>

          {/* Child Nodes */}
          <div className="flex gap-2 md:gap-4 items-start">
            <div className="flex-1 flex justify-end">
              {node.left ? (
                <TreeNode
                  node={node.left}
                  isExpanded={expandedNodes.has(node.left.id)}
                  onToggle={onToggle}
                  expandedNodes={expandedNodes}
                />
              ) : (
                <EmptyNode position="LEFT" />
              )}
            </div>

            <div className="flex-1 flex justify-start">
              {node.right ? (
                <TreeNode
                  node={node.right}
                  isExpanded={expandedNodes.has(node.right.id)}
                  onToggle={onToggle}
                  expandedNodes={expandedNodes}
                />
              ) : (
                <EmptyNode position="RIGHT" />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Empty Node Component
 */
const EmptyNode = ({ position }) => {
  return (
    <div className="px-2 md:px-3 py-1 md:py-2 rounded border border-dashed border-dark-200 bg-dark-50">
      <div className="flex items-center gap-0.5 md:gap-1 text-dark-400">
        <FaUser className="text-[7px] md:text-[10px]" />
        <span className="text-[8px] md:text-[10px] font-medium">Empty</span>
      </div>
    </div>
  );
};

/**
 * List View Component - Shows parent-child relationships
 */
const ListView = ({ parentChildList }) => {
  // Group by level
  const groupedByLevel = {};
  parentChildList.forEach(rel => {
    if (!groupedByLevel[rel.level]) {
      groupedByLevel[rel.level] = [];
    }
    groupedByLevel[rel.level].push(rel);
  });

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-xs md:text-sm">Parent-Child Relationships</Card.Title>
        <Card.Description className="text-[10px] md:text-xs">Complete list showing who is under whom</Card.Description>
      </Card.Header>
      <Card.Body>
        <div className="space-y-2 md:space-y-3">
          {Object.keys(groupedByLevel).sort((a, b) => a - b).map(level => (
            <div key={level}>
              <h3 className="text-xs md:text-sm font-semibold text-dark-900 mb-1 md:mb-1.5">
                Step {level} ({groupedByLevel[level].length})
              </h3>
              <div className="space-y-0.5 md:space-y-1">
                {groupedByLevel[level].map((rel, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 md:gap-2 p-1.5 md:p-2 bg-dark-50 rounded hover:bg-dark-100 transition-colors text-[10px] md:text-xs"
                  >
                    <span className="font-medium text-dark-900 truncate">{rel.parent}</span>
                    <span className="text-dark-500">→</span>
                    <span className={`px-1 md:px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-medium ${
                      rel.leg === 'LEFT' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {rel.leg}
                    </span>
                    <span className="text-dark-500">→</span>
                    <span className="font-medium text-primary-600 truncate">{rel.child}</span>
                    <span className="ml-auto text-[8px] md:text-[10px] text-dark-500">[{rel.position}]</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

/**
 * Step View Component - Shows members organized by level
 */
const LevelView = ({ levelWiseData }) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-xs md:text-sm">Step-wise Members</Card.Title>
        <Card.Description className="text-[10px] md:text-xs">All members organized by their level in the tree</Card.Description>
      </Card.Header>
      <Card.Body>
        <div className="space-y-2 md:space-y-3">
          {[1, 2, 3, 4, 5].map(level => {
            const members = levelWiseData[level] || [];
            const capacity = level === 1 ? 1 : Math.pow(2, level - 1);
            
            return (
              <div key={level}>
                <h3 className="text-xs md:text-sm font-semibold text-dark-900 mb-1 md:mb-1.5">
                  Step {level} ({members.length}/{capacity})
                </h3>
                {members.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 md:gap-2">
                    {members.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 bg-white border border-dark-200 rounded hover:border-primary-300 hover:shadow-sm transition-all"
                      >
                        <div className="p-0.5 md:p-1 rounded-full bg-primary-100">
                          <FaUser className="text-primary-600 text-[8px] md:text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-dark-900 text-[10px] md:text-xs truncate">{member.name}</p>
                          <p className="text-[8px] md:text-[10px] text-dark-600 truncate">{member.position}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-dark-500 text-[10px] md:text-xs">No members at this level yet</p>
                )}
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
};

export default BinaryTreeVisualizationEnhanced;
