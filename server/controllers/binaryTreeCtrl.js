/**
 * Binary Tree Controller
 * APIs for binary tree visualization
 */

const Member = require('../models/memeberModel');
const mongoose = require('mongoose');

exports.getBinaryTreeStructure = async (req, res) => {
  try {
    const { memberId, productId } = req.params;
    const { rootNumber } = req.query; // Optional: specific ROOT number

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Get member (this is the ROOT member for their own tree)
    const member = await Member.findById(memberId).select('userName fName lName productBinaryTrees');
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Get product tree
    const productTree = member.productBinaryTrees.find(
      tree => tree.productId.toString() === productId.toString()
    );

    if (!productTree) {
      return res.status(404).json({
        success: false,
        message: 'No product tree found for this product'
      });
    }

    // Get specific ROOT or all ROOTs
    let rootsToProcess = productTree.roots;
    if (rootNumber) {
      const specificRoot = productTree.roots.find(r => r.rootNumber === parseInt(rootNumber));
      if (!specificRoot) {
        return res.status(404).json({
          success: false,
          message: `ROOT ${rootNumber} not found`
        });
      }
      rootsToProcess = [specificRoot];
    }

    // Build tree structure for each ROOT
    const treeData = [];

    for (const root of rootsToProcess) {
      const treeStructure = await buildTreeStructure(
        memberId,
        productId,
        root.rootNumber
      );

      const levelWiseData = await getLevelWiseData(
        memberId,
        productId,
        root.rootNumber
      );

      const parentChildList = await getParentChildList(
        memberId,
        productId,
        root.rootNumber
      );

      // Count actual members in tree structure (recursive count)
      // ROOT is excluded from level counting
      const countTreeMembers = (node, levelCounts = {}, isRoot = false) => {
        if (!node) return { total: 0, levels: levelCounts };
        
        let total = 1; // Count this node in total
        
        // Don't count ROOT in level stats, but count its children as Level 1
        if (!isRoot) {
          // Shift levels: node.level 2 becomes Level 1, node.level 3 becomes Level 2, etc.
          const actualLevel = node.level - 1;
          if (!levelCounts[actualLevel]) {
            levelCounts[actualLevel] = 0;
          }
          levelCounts[actualLevel]++;
        }
        
        // Count children
        if (node.left) {
          const leftCount = countTreeMembers(node.left, levelCounts, false);
          total += leftCount.total;
        }
        if (node.right) {
          const rightCount = countTreeMembers(node.right, levelCounts, false);
          total += rightCount.total;
        }
        
        return { total, levels: levelCounts };
      };
      
      // Call with isRoot = true for ROOT node
      const treeCounts = countTreeMembers(treeStructure, {}, true);
      
      // Update levels with actual counts from tree
      // Level 1 = 2 capacity (ROOT's direct children)
      // Level 2 = 4 capacity, Level 3 = 8, Level 4 = 16, Level 5 = 32
      const updatedLevels = {
        level1: { 
          filled: treeCounts.levels[1] || 0, 
          capacity: 2  // ROOT's left and right
        },
        level2: { 
          filled: treeCounts.levels[2] || 0, 
          capacity: 4  // 2 × 2
        },
        level3: { 
          filled: treeCounts.levels[3] || 0, 
          capacity: 8  // 4 × 2
        },
        level4: { 
          filled: treeCounts.levels[4] || 0, 
          capacity: 16  // 8 × 2
        },
        level5: { 
          filled: treeCounts.levels[5] || 0, 
          capacity: 32  // 16 × 2
        }
      };

      treeData.push({
        rootNumber: root.rootNumber,
        status: root.status,
        totalMembers: treeCounts.total, // Use actual tree count
        maxCapacity: root.maxCapacity,
        levels: updatedLevels, // Use actual level counts
        treeStructure: treeStructure,
        levelWiseData: levelWiseData,
        parentChildList: parentChildList
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        rootMember: {
          id: member._id,
          userName: member.userName,
          name: `${member.fName} ${member.lName}`
        },
        productId: productId,
        currentActiveRoot: productTree.currentActiveRoot,
        totalRoots: productTree.roots.length,
        trees: treeData
      }
    });

  } catch (error) {
    console.error('Error in getBinaryTreeStructure:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Build hierarchical tree structure
 * Optimized with level-by-level batch fetching
 */
const buildTreeStructure = async (rootMemberId, productId, rootNumber) => {
  try {
    // Get the ROOT member
    const rootMember = await Member.findById(rootMemberId)
      .select('userName fName lName productBinaryTrees');
    
    if (!rootMember) return null;

    const rootMemberName = rootMember.userName || `${rootMember.fName} ${rootMember.lName}`;
    
    const productTree = rootMember.productBinaryTrees.find(
      tree => tree.productId.toString() === productId.toString()
    );

    if (!productTree) {
      return {
        id: rootMemberId.toString(),
        name: rootMemberName,
        level: 1,
        position: 'ROOT',
        left: null,
        right: null
      };
    }

    const root = productTree.roots.find(r => r.rootNumber === rootNumber);
    
    if (!root) {
      return {
        id: rootMemberId.toString(),
        name: rootMemberName,
        level: 1,
        position: 'ROOT',
        left: null,
        right: null
      };
    }

    // Collect all member IDs level by level (max 5 levels for binary tree)
    const allMemberIds = new Set();
    let currentLevel = new Set();
    
    // Add direct children from root
    for (const leg of root.binaryPosition.leftLeg) {
      allMemberIds.add(leg.memberId.toString());
      currentLevel.add(leg.memberId.toString());
    }
    for (const leg of root.binaryPosition.rightLeg) {
      allMemberIds.add(leg.memberId.toString());
      currentLevel.add(leg.memberId.toString());
    }

    // Fetch children level by level (5 levels max)
    for (let level = 0; level < 5 && currentLevel.size > 0; level++) {
      const levelMembers = await Member.find({ 
        _id: { $in: Array.from(currentLevel) } 
      }).select('_id productBinaryTrees');
      
      const nextLevel = new Set();
      
      for (const member of levelMembers) {
        const memberProductTree = member.productBinaryTrees.find(
          tree => tree.productId.toString() === productId.toString()
        );
        
        if (memberProductTree && memberProductTree.roots && memberProductTree.roots.length > 0) {
          const memberRoot = memberProductTree.roots[0];
          
          for (const leg of memberRoot.binaryPosition.leftLeg) {
            const childId = leg.memberId.toString();
            if (!allMemberIds.has(childId)) {
              allMemberIds.add(childId);
              nextLevel.add(childId);
            }
          }
          
          for (const leg of memberRoot.binaryPosition.rightLeg) {
            const childId = leg.memberId.toString();
            if (!allMemberIds.has(childId)) {
              allMemberIds.add(childId);
              nextLevel.add(childId);
            }
          }
        }
      }
      
      currentLevel = nextLevel;
    }

    // Fetch all members at once
    const allMembers = await Member.find({ 
      _id: { $in: Array.from(allMemberIds) } 
    }).select('_id userName fName lName productBinaryTrees');

    // Create maps
    const memberDataMap = new Map();
    const memberTreeMap = new Map();
    
    for (const member of allMembers) {
      const memberName = member.userName || `${member.fName} ${member.lName}`;
      memberDataMap.set(member._id.toString(), memberName);
      
      const memberProductTree = member.productBinaryTrees.find(
        tree => tree.productId.toString() === productId.toString()
      );
      
      if (memberProductTree && memberProductTree.roots && memberProductTree.roots.length > 0) {
        memberTreeMap.set(member._id.toString(), memberProductTree.roots[0]);
      }
    }

    // Build tree recursively
    const buildNode = (memberId, displayLevel, position) => {
      const memberName = memberDataMap.get(memberId.toString());
      if (!memberName) return null;

      const node = {
        id: memberId.toString(),
        name: memberName,
        level: displayLevel,
        position: position,
        left: null,
        right: null
      };

      const memberRoot = memberTreeMap.get(memberId.toString());
      
      if (memberRoot) {
        const allChildren = [];
        for (const leg of memberRoot.binaryPosition.leftLeg) {
          allChildren.push({ position: leg.position, memberId: leg.memberId.toString() });
        }
        for (const leg of memberRoot.binaryPosition.rightLeg) {
          allChildren.push({ position: leg.position, memberId: leg.memberId.toString() });
        }
        
        if (allChildren.length > 0) {
          allChildren.sort((a, b) => a.position.length - b.position.length);
          
          const minLength = allChildren[0].position.length;
          const directChildren = allChildren.filter(c => c.position.length === minLength);
          
          const leftChildren = directChildren.filter(c => c.position.endsWith('L'));
          const rightChildren = directChildren.filter(c => c.position.endsWith('R'));
          
          if (leftChildren.length > 0) {
            node.left = buildNode(leftChildren[0].memberId, displayLevel + 1, position + 'L');
          }
          
          if (rightChildren.length > 0) {
            node.right = buildNode(rightChildren[0].memberId, displayLevel + 1, position + 'R');
          }
        }
      }

      return node;
    };

    // Build root node
    const rootNode = {
      id: rootMemberId.toString(),
      name: rootMemberName,
      level: 1,
      position: 'ROOT',
      left: null,
      right: null
    };

    const leftChild = root.binaryPosition.leftLeg.find(leg => leg.position === 'L');
    const rightChild = root.binaryPosition.rightLeg.find(leg => leg.position === 'R');
    
    if (leftChild) {
      rootNode.left = buildNode(leftChild.memberId.toString(), 2, 'L');
    }
    
    if (rightChild) {
      rootNode.right = buildNode(rightChild.memberId.toString(), 2, 'R');
    }

    // Handle empty Level 2
    if (!rootNode.left && !rootNode.right) {
      const allChildren = [
        ...root.binaryPosition.leftLeg.map(l => ({ pos: l.position, id: l.memberId.toString() })),
        ...root.binaryPosition.rightLeg.map(l => ({ pos: l.position, id: l.memberId.toString() }))
      ];
      
      if (allChildren.length > 0) {
        allChildren.sort((a, b) => a.pos.length - b.pos.length);
        const minLen = allChildren[0].pos.length;
        const closest = allChildren.filter(c => c.pos.length === minLen);
        
        const left = closest.filter(c => c.pos.endsWith('L'));
        const right = closest.filter(c => c.pos.endsWith('R'));
        
        if (left.length > 0) {
          rootNode.left = buildNode(left[0].id, 2, 'L');
        }
        if (right.length > 0) {
          rootNode.right = buildNode(right[0].id, 2, 'R');
        }
      }
    }

    return rootNode;
  } catch (error) {
    console.error('Error in buildTreeStructure:', error);
    return null;
  }
};

/**
 * Get level-wise member data for a specific ROOT
 */
const getLevelWiseData = async (rootMemberId, productId, rootNumber) => {
  try {
    const membersByLevel = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    };

    // Get the ROOT member
    const rootMember = await Member.findById(rootMemberId)
      .select('_id userName fName lName productBinaryTrees');
    
    if (!rootMember) {
      return membersByLevel;
    }

    const productTree = rootMember.productBinaryTrees.find(
      tree => tree.productId.toString() === productId.toString()
    );

    if (!productTree) {
      return membersByLevel;
    }

    const root = productTree.roots.find(r => r.rootNumber === rootNumber);
    
    if (!root) {
      return membersByLevel;
    }

    // Add ROOT member to Level 1
    const rootMemberName = rootMember.userName || `${rootMember.fName} ${rootMember.lName}`;
    membersByLevel[1].push({
      id: rootMember._id.toString(),
      name: rootMemberName,
      position: 'ROOT'
    });

    // Collect from left and right legs
    const allLegs = [...root.binaryPosition.leftLeg, ...root.binaryPosition.rightLeg];
    
    for (const leg of allLegs) {
      const legMember = await Member.findById(leg.memberId).select('userName fName lName');
      if (legMember) {
        const name = legMember.userName || `${legMember.fName} ${legMember.lName}`;
        membersByLevel[leg.level].push({
          id: leg.memberId.toString(),
          name: name,
          position: leg.position
        });
      }
    }

    // Remove duplicates and sort
    for (let level = 2; level <= 5; level++) {
      const seen = new Set();
      membersByLevel[level] = membersByLevel[level].filter(m => {
        const key = `${m.id}-${m.position}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      membersByLevel[level].sort((a, b) => a.position.localeCompare(b.position));
    }

    return membersByLevel;
  } catch (error) {
    console.error('Error in getLevelWiseData:', error);
    return {};
  }
};

/**
 * Get parent-child relationship list for a specific ROOT
 */
const getParentChildList = async (rootMemberId, productId, rootNumber) => {
  try {
    const relationships = [];

    // Get the ROOT member
    const rootMember = await Member.findById(rootMemberId)
      .select('_id userName fName lName productBinaryTrees');
    
    if (!rootMember) {
      return relationships;
    }

    const rootMemberName = rootMember.userName || `${rootMember.fName} ${rootMember.lName}`;
    
    const productTree = rootMember.productBinaryTrees.find(
      tree => tree.productId.toString() === productId.toString()
    );

    if (!productTree) {
      return relationships;
    }

    const root = productTree.roots.find(r => r.rootNumber === rootNumber);
    
    if (!root) {
      return relationships;
    }

    // Get all children from left leg
    for (const child of root.binaryPosition.leftLeg) {
      const childMember = await Member.findById(child.memberId).select('userName fName lName');
      if (childMember) {
        const childName = childMember.userName || `${childMember.fName} ${childMember.lName}`;
        relationships.push({
          parentId: rootMember._id.toString(),
          parent: rootMemberName,
          childId: child.memberId.toString(),
          child: childName,
          leg: 'LEFT',
          level: child.level,
          position: child.position
        });
      }
    }

    // Get all children from right leg
    for (const child of root.binaryPosition.rightLeg) {
      const childMember = await Member.findById(child.memberId).select('userName fName lName');
      if (childMember) {
        const childName = childMember.userName || `${childMember.fName} ${childMember.lName}`;
        relationships.push({
          parentId: rootMember._id.toString(),
          parent: rootMemberName,
          childId: child.memberId.toString(),
          child: childName,
          leg: 'RIGHT',
          level: child.level,
          position: child.position
        });
      }
    }

    // Sort by level and position
    relationships.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.position.localeCompare(b.position);
    });

    return relationships;
  } catch (error) {
    console.error('Error in getParentChildList:', error);
    return [];
  }
};
