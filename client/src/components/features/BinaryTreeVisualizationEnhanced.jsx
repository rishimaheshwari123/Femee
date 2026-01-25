import React, { useState, useEffect } from 'react';
import { FaUser, FaChevronDown, FaChevronUp, FaUsers, FaSpinner } from 'react-icons/fa';
import { Card } from '../ui';
import { getBinaryTreeStructure } from '../../services/operations/binaryTree';

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
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Card.Title>My Binary Tree</Card.Title>
              <Card.Description>
                {treeData.totalRoots} ROOT{treeData.totalRoots > 1 ? 's' : ''} • 
                Active ROOT: {treeData.currentActiveRoot}
              </Card.Description>
            </div>
            
            {/* View Mode Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'tree'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-100 text-dark-700 hover:bg-dark-200'
                }`}
              >
                Tree View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-100 text-dark-700 hover:bg-dark-200'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('levels')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'levels'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-100 text-dark-700 hover:bg-dark-200'
                }`}
              >
                Level View
              </button>
            </div>
          </div>
        </Card.Header>
      </Card>

      {/* ROOT Selector */}
      {treeData.trees.length > 1 && (
        <Card>
          <Card.Body>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-dark-700">Select ROOT:</span>
              {treeData.trees.map((root) => (
                <button
                  key={root.rootNumber}
                  onClick={() => setSelectedRoot(root)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{selectedRoot.totalMembers}</p>
                <p className="text-sm text-dark-600">Total Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-dark-900">{selectedRoot.levels.level1.filled}/{selectedRoot.levels.level1.capacity}</p>
                <p className="text-sm text-dark-600">Level 1</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-dark-900">{selectedRoot.levels.level2.filled}/{selectedRoot.levels.level2.capacity}</p>
                <p className="text-sm text-dark-600">Level 2</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-dark-900">{selectedRoot.levels.level3.filled}/{selectedRoot.levels.level3.capacity}</p>
                <p className="text-sm text-dark-600">Level 3</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-dark-900">{selectedRoot.levels.level4.filled}/{selectedRoot.levels.level4.capacity}</p>
                <p className="text-sm text-dark-600">Level 4</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-dark-900">{selectedRoot.levels.level5.filled}/{selectedRoot.levels.level5.capacity}</p>
                <p className="text-sm text-dark-600">Level 5</p>
              </div>
              <div className="text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  selectedRoot.status === 'COMPLETE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedRoot.status}
                </span>
                <p className="text-sm text-dark-600 mt-1">Status</p>
              </div>
            </div>
          </Card.Body>
        </Card>
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
          <Card.Title>Hierarchical Tree Structure</Card.Title>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
            >
              Expand All
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
        <div className="overflow-x-auto pb-4">
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
            relative px-6 py-4 rounded-2xl shadow-lg transition-all duration-300
            ${isRoot 
              ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white scale-110 shadow-glow' 
              : 'bg-white border-2 border-dark-200 hover:border-primary-300 hover:shadow-xl'
            }
            ${hasChildren ? 'cursor-pointer' : ''}
          `}
          onClick={() => hasChildren && onToggle(node.id)}
        >
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-full
              ${isRoot ? 'bg-white/20' : 'bg-primary-100'}
            `}>
              <FaUser className={`
                text-lg
                ${isRoot ? 'text-white' : 'text-primary-600'}
              `} />
            </div>
            <div>
              <p className={`
                font-semibold text-sm
                ${isRoot ? 'text-white' : 'text-dark-900'}
              `}>
                {node.name}
              </p>
              <p className={`
                text-xs
                ${isRoot ? 'text-white/80' : 'text-dark-600'}
              `}>
                Level {node.level} • {node.position}
              </p>
            </div>
          </div>

          {hasChildren && (
            <div className={`
              absolute -bottom-3 left-1/2 transform -translate-x-1/2
              w-6 h-6 rounded-full flex items-center justify-center
              ${isRoot ? 'bg-white text-primary-600' : 'bg-primary-500 text-white'}
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

        {isRoot && (
          <div className="absolute -top-2 -right-2 px-2 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full shadow-lg">
            ROOT
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <>
          {/* Connecting Lines */}
          <div className="relative w-full h-12 flex items-center justify-center">
            <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-dark-300"></div>
            {node.left && node.right && (
              <div className="absolute top-6 left-1/4 right-1/4 h-0.5 bg-dark-300"></div>
            )}
            {node.left && (
              <div className="absolute top-6 left-1/4 w-0.5 h-6 bg-dark-300"></div>
            )}
            {node.right && (
              <div className="absolute top-6 right-1/4 w-0.5 h-6 bg-dark-300"></div>
            )}
          </div>

          {/* Child Nodes */}
          <div className="flex gap-8 items-start">
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
    <div className="px-6 py-4 rounded-2xl border-2 border-dashed border-dark-200 bg-dark-50">
      <div className="flex items-center gap-2 text-dark-400">
        <FaUser className="text-sm" />
        <span className="text-xs font-medium">Empty {position}</span>
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
        <Card.Title>Parent-Child Relationships</Card.Title>
        <Card.Description>Complete list showing who is under whom</Card.Description>
      </Card.Header>
      <Card.Body>
        <div className="space-y-6">
          {Object.keys(groupedByLevel).sort((a, b) => a - b).map(level => (
            <div key={level}>
              <h3 className="text-lg font-semibold text-dark-900 mb-3">
                Level {level} ({groupedByLevel[level].length} members)
              </h3>
              <div className="space-y-2">
                {groupedByLevel[level].map((rel, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors"
                  >
                    <span className="font-medium text-dark-900">{rel.parent}</span>
                    <span className="text-dark-500">→</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rel.leg === 'LEFT' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {rel.leg}
                    </span>
                    <span className="text-dark-500">→</span>
                    <span className="font-medium text-primary-600">{rel.child}</span>
                    <span className="ml-auto text-xs text-dark-500">[{rel.position}]</span>
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
 * Level View Component - Shows members organized by level
 */
const LevelView = ({ levelWiseData }) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Level-wise Members</Card.Title>
        <Card.Description>All members organized by their level in the tree</Card.Description>
      </Card.Header>
      <Card.Body>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map(level => {
            const members = levelWiseData[level] || [];
            const capacity = level === 1 ? 1 : Math.pow(2, level - 1);
            
            return (
              <div key={level}>
                <h3 className="text-lg font-semibold text-dark-900 mb-3">
                  Level {level} ({members.length}/{capacity})
                </h3>
                {members.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {members.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white border border-dark-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                      >
                        <div className="p-2 rounded-full bg-primary-100">
                          <FaUser className="text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-dark-900">{member.name}</p>
                          <p className="text-xs text-dark-600">{member.position}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-dark-500 text-sm">No members at this level yet</p>
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
