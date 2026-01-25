const Member = require("../models/memeberModel");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

/**
 * Get all product trees for a member
 * @route GET /api/member/:memberId/product-trees
 * @access Private
 */
exports.getAllProductTrees = async (req, res) => {
    try {
        const { memberId } = req.params;

        // Validate member ID
        if (!mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid member ID"
            });
        }

        // Find member and populate product details
        const member = await Member.findById(memberId)
            .select('fName lName userName wallet totalEarnings productBinaryTrees')
            .lean();

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // If no product trees, return empty array
        if (!member.productBinaryTrees || member.productBinaryTrees.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No product trees found for this member",
                data: {
                    member: {
                        _id: memberId,
                        fName: member.fName,
                        lName: member.lName,
                        userName: member.userName,
                        wallet: member.wallet || 0,
                        totalEarnings: member.totalEarnings || 0
                    },
                    productTrees: []
                }
            });
        }

        // Get all product IDs from member's trees
        const productIds = member.productBinaryTrees.map(tree => tree.productId);

        // Fetch product details
        const products = await Product.find({ _id: { $in: productIds } })
            .select('title price images')
            .lean();

        // Create a map for quick product lookup
        const productMap = {};
        products.forEach(product => {
            productMap[product._id.toString()] = product;
        });

        // Format product trees with product details and ROOT stats
        const productTrees = member.productBinaryTrees.map(tree => {
            const product = productMap[tree.productId.toString()];
            
            // Check if this tree has ROOT structure (new format)
            const hasRootStructure = tree.roots && tree.roots.length > 0;
            
            if (hasRootStructure) {
                // NEW FORMAT: ROOT-based system
                const roots = tree.roots.map(root => ({
                    rootNumber: root.rootNumber,
                    status: root.status,
                    totalMembers: root.totalMembers,
                    maxCapacity: root.maxCapacity,
                    
                    levels: {
                        level1: root.levels?.level1 || { filled: 0, capacity: 1 },
                        level2: root.levels?.level2 || { filled: 0, capacity: 2 },
                        level3: root.levels?.level3 || { filled: 0, capacity: 4 },
                        level4: root.levels?.level4 || { filled: 0, capacity: 8 },
                        level5: root.levels?.level5 || { filled: 0, capacity: 16 }
                    },
                    
                    binaryStats: {
                        leftLegCount: root.binaryPosition?.leftLeg?.length || 0,
                        rightLegCount: root.binaryPosition?.rightLeg?.length || 0,
                        leftVolume: root.binaryPosition?.leftVolume || 0,
                        rightVolume: root.binaryPosition?.rightVolume || 0,
                        carryForwardLeft: root.binaryPosition?.carryForward?.left || 0,
                        carryForwardRight: root.binaryPosition?.carryForward?.right || 0,
                        totalMatchedPairs: root.binaryPosition?.totalMatchedPairs || 0,
                        totalMatchingBonus: root.binaryPosition?.totalMatchingBonus || 0,
                        lastMatchingDate: root.binaryPosition?.lastMatchingDate || null
                    },
                    
                    createdAt: root.createdAt,
                    completedAt: root.completedAt
                }));
                
                return {
                    productId: tree.productId,
                    productName: product ? product.title : 'Unknown Product',
                    productImage: product && product.images && product.images.length > 0 
                        ? product.images[0].url 
                        : null,
                    productPrice: product ? product.price : 0,
                    
                    // ROOT system data
                    systemType: 'ROOT',
                    currentActiveRoot: tree.currentActiveRoot,
                    totalRoots: roots.length,
                    roots: roots,
                    
                    // Purchase history
                    purchaseHistory: tree.purchases || [],
                    
                    // Product-specific stats
                    stats: {
                        totalPurchases: tree.totalPurchases || 0,
                        totalSpent: tree.totalSpent || 0,
                        firstPurchaseDate: tree.firstPurchaseDate || null,
                        lastPurchaseDate: tree.lastPurchaseDate || null,
                        isActive: tree.isActive || false,
                        directReferrals: tree.directReferrals || 0,
                        totalDownline: tree.totalDownline || 0
                    }
                };
            } else {
                // OLD FORMAT: Flat binary tree (backward compatibility)
                return {
                    productId: tree.productId,
                    productName: product ? product.title : 'Unknown Product',
                    productImage: product && product.images && product.images.length > 0 
                        ? product.images[0].url 
                        : null,
                    productPrice: product ? product.price : 0,
                    
                    // Old system data
                    systemType: 'FLAT',
                    binaryStats: {
                        leftLegCount: tree.binaryPosition?.leftLeg?.length || 0,
                        rightLegCount: tree.binaryPosition?.rightLeg?.length || 0,
                        leftVolume: tree.binaryPosition?.leftVolume || 0,
                        rightVolume: tree.binaryPosition?.rightVolume || 0,
                        carryForwardLeft: tree.binaryPosition?.carryForward?.left || 0,
                        carryForwardRight: tree.binaryPosition?.carryForward?.right || 0,
                        totalMatchedPairs: tree.binaryPosition?.totalMatchedPairs || 0,
                        totalMatchingBonus: tree.binaryPosition?.totalMatchingBonus || 0,
                        lastMatchingDate: tree.binaryPosition?.lastMatchingDate || null
                    },
                    
                    // Purchase history
                    purchaseHistory: tree.purchases || [],
                    
                    // Product-specific stats
                    stats: {
                        totalPurchases: tree.totalPurchases || 0,
                        totalSpent: tree.totalSpent || 0,
                        firstPurchaseDate: tree.firstPurchaseDate || null,
                        lastPurchaseDate: tree.lastPurchaseDate || null,
                        isActive: tree.isActive || false,
                        directReferrals: tree.directReferrals || 0,
                        totalDownline: tree.totalDownline || 0
                    }
                };
            }
        });

        return res.status(200).json({
            success: true,
            message: "Product trees retrieved successfully",
            data: {
                member: {
                    _id: memberId,
                    fName: member.fName,
                    lName: member.lName,
                    userName: member.userName,
                    wallet: member.wallet || 0,
                    totalEarnings: member.totalEarnings || 0
                },
                productTrees: productTrees
            }
        });
    } catch (error) {
        console.error("Error getting product trees:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve product trees"
        });
    }
};

/**
 * Get specific product tree for a member
 * @route GET /api/member/:memberId/product-tree/:productId
 * @access Private
 */
exports.getProductTree = async (req, res) => {
    try {
        const { memberId, productId } = req.params;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid member ID"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Find member
        const member = await Member.findById(memberId)
            .select('fName lName userName tier productBinaryTrees')
            .lean();

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // Find specific product tree
        const productTree = member.productBinaryTrees?.find(
            tree => tree.productId.toString() === productId.toString()
        );

        if (!productTree) {
            return res.status(404).json({
                success: false,
                message: "Product tree not found for this member"
            });
        }

        // Get product details
        const product = await Product.findById(productId)
            .select('title price images binaryConfig')
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Get member details for left leg
        const leftLegMemberIds = productTree.binaryPosition?.leftLeg?.map(leg => leg.memberId) || [];
        const leftLegMembers = await Member.find({ _id: { $in: leftLegMemberIds } })
            .select('fName lName userName tier')
            .lean();

        // Get member details for right leg
        const rightLegMemberIds = productTree.binaryPosition?.rightLeg?.map(leg => leg.memberId) || [];
        const rightLegMembers = await Member.find({ _id: { $in: rightLegMemberIds } })
            .select('fName lName userName tier')
            .lean();

        // Create member maps for quick lookup
        const leftMemberMap = {};
        leftLegMembers.forEach(m => {
            leftMemberMap[m._id.toString()] = m;
        });

        const rightMemberMap = {};
        rightLegMembers.forEach(m => {
            rightMemberMap[m._id.toString()] = m;
        });

        // Format left leg with member details
        const leftLegDetails = (productTree.binaryPosition?.leftLeg || []).map(leg => {
            const memberDetails = leftMemberMap[leg.memberId.toString()];
            return {
                memberId: leg.memberId,
                memberName: memberDetails ? `${memberDetails.fName} ${memberDetails.lName}` : 'Unknown',
                userName: memberDetails?.userName || 'Unknown',
                tier: memberDetails?.tier || 'Bronze',
                joinedAt: leg.joinedAt,
                placementOrder: leg.placementOrder
            };
        });

        // Format right leg with member details
        const rightLegDetails = (productTree.binaryPosition?.rightLeg || []).map(leg => {
            const memberDetails = rightMemberMap[leg.memberId.toString()];
            return {
                memberId: leg.memberId,
                memberName: memberDetails ? `${memberDetails.fName} ${memberDetails.lName}` : 'Unknown',
                userName: memberDetails?.userName || 'Unknown',
                tier: memberDetails?.tier || 'Bronze',
                joinedAt: leg.joinedAt,
                placementOrder: leg.placementOrder
            };
        });

        return res.status(200).json({
            success: true,
            message: "Product tree retrieved successfully",
            data: {
                member: {
                    _id: memberId,
                    fName: member.fName,
                    lName: member.lName,
                    userName: member.userName,
                    tier: member.tier
                },
                product: {
                    _id: product._id,
                    title: product.title,
                    price: product.price,
                    image: product.images && product.images.length > 0 ? product.images[0].url : null
                },
                binaryPosition: {
                    leftLeg: leftLegDetails,
                    rightLeg: rightLegDetails,
                    leftVolume: productTree.binaryPosition?.leftVolume || 0,
                    rightVolume: productTree.binaryPosition?.rightVolume || 0,
                    carryForward: {
                        left: productTree.binaryPosition?.carryForward?.left || 0,
                        right: productTree.binaryPosition?.carryForward?.right || 0
                    },
                    totalMatchedPairs: productTree.binaryPosition?.totalMatchedPairs || 0,
                    totalMatchingBonus: productTree.binaryPosition?.totalMatchingBonus || 0,
                    lastMatchingDate: productTree.binaryPosition?.lastMatchingDate || null
                },
                purchases: productTree.purchases || [],
                stats: {
                    totalPurchases: productTree.totalPurchases || 0,
                    totalSpent: productTree.totalSpent || 0,
                    firstPurchaseDate: productTree.firstPurchaseDate || null,
                    lastPurchaseDate: productTree.lastPurchaseDate || null,
                    isActive: productTree.isActive || false,
                    directReferrals: productTree.directReferrals || 0,
                    totalDownline: productTree.totalDownline || 0
                }
            }
        });
    } catch (error) {
        console.error("Error getting product tree:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve product tree"
        });
    }
};

/**
 * Get full binary tree visualization data for a product
 * @route GET /api/product/:productId/binary-tree/:memberId
 * @access Private
 */
exports.getBinaryTreeVisualization = async (req, res) => {
    try {
        const { productId, memberId } = req.params;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid member ID"
            });
        }

        // Get product details
        const product = await Product.findById(productId)
            .select('title price images binaryConfig')
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Recursive function to build tree structure
        const buildTreeNode = async (currentMemberId, depth = 0, maxDepth = 5) => {
            // Limit depth to prevent infinite recursion
            if (depth > maxDepth) {
                return null;
            }

            const member = await Member.findById(currentMemberId)
                .select('fName lName userName tier productBinaryTrees')
                .lean();

            if (!member) {
                return null;
            }

            // Find product tree for this member
            const productTree = member.productBinaryTrees?.find(
                tree => tree.productId.toString() === productId.toString()
            );

            if (!productTree) {
                return {
                    memberId: currentMemberId,
                    memberName: `${member.fName} ${member.lName}`,
                    userName: member.userName,
                    tier: member.tier,
                    hasProductTree: false,
                    leftChild: null,
                    rightChild: null
                };
            }

            // Get first member from each leg (direct children)
            const leftChildId = productTree.binaryPosition?.leftLeg?.[0]?.memberId;
            const rightChildId = productTree.binaryPosition?.rightLeg?.[0]?.memberId;

            // Recursively build children
            const leftChild = leftChildId ? await buildTreeNode(leftChildId, depth + 1, maxDepth) : null;
            const rightChild = rightChildId ? await buildTreeNode(rightChildId, depth + 1, maxDepth) : null;

            return {
                memberId: currentMemberId,
                memberName: `${member.fName} ${member.lName}`,
                userName: member.userName,
                tier: member.tier,
                hasProductTree: true,
                binaryStats: {
                    leftLegCount: productTree.binaryPosition?.leftLeg?.length || 0,
                    rightLegCount: productTree.binaryPosition?.rightLeg?.length || 0,
                    leftVolume: productTree.binaryPosition?.leftVolume || 0,
                    rightVolume: productTree.binaryPosition?.rightVolume || 0,
                    totalMatchedPairs: productTree.binaryPosition?.totalMatchedPairs || 0,
                    totalMatchingBonus: productTree.binaryPosition?.totalMatchingBonus || 0
                },
                leftChild: leftChild,
                rightChild: rightChild,
                depth: depth
            };
        };

        // Build tree starting from the specified member
        const treeData = await buildTreeNode(memberId);

        if (!treeData) {
            return res.status(404).json({
                success: false,
                message: "Could not build tree data"
            });
        }

        // Calculate tree statistics
        const calculateTreeStats = (node) => {
            if (!node) return { depth: 0, nodeCount: 0 };

            const leftStats = calculateTreeStats(node.leftChild);
            const rightStats = calculateTreeStats(node.rightChild);

            return {
                depth: Math.max(leftStats.depth, rightStats.depth) + 1,
                nodeCount: leftStats.nodeCount + rightStats.nodeCount + 1
            };
        };

        const treeStats = calculateTreeStats(treeData);

        return res.status(200).json({
            success: true,
            message: "Binary tree visualization data retrieved successfully",
            data: {
                product: {
                    _id: product._id,
                    title: product.title,
                    price: product.price,
                    image: product.images && product.images.length > 0 ? product.images[0].url : null
                },
                rootMember: {
                    _id: memberId,
                    name: treeData.memberName,
                    userName: treeData.userName
                },
                treeData: treeData,
                treeStats: {
                    maxDepth: treeStats.depth,
                    totalNodes: treeStats.nodeCount
                }
            }
        });
    } catch (error) {
        console.error("Error getting binary tree visualization:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve binary tree visualization"
        });
    }
};

/**
 * Get transaction history for a member and product
 * @route GET /api/member/:memberId/transactions/:productId
 * @access Private
 */
exports.getTransactionHistory = async (req, res) => {
    try {
        const { memberId, productId } = req.params;
        const { transactionType, limit = 50, page = 1 } = req.query;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid member ID"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Build query
        const query = {
            memberId: memberId,
            productId: productId
        };

        // Add transaction type filter if provided
        if (transactionType) {
            query.transactionType = transactionType;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get total count
        const totalCount = await Transaction.countDocuments(query);

        // Get transactions sorted by timestamp descending
        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .populate('productId', 'title price images')
            .populate('orderId', 'orderStatus paidAt')
            .lean();

        // Calculate running totals
        let runningTotal = 0;
        const transactionsWithRunningTotal = transactions.map(transaction => {
            runningTotal += transaction.amount;
            return {
                ...transaction,
                runningTotal: runningTotal
            };
        });

        // Get member details
        const member = await Member.findById(memberId)
            .select('fName lName userName wallet totalEarnings')
            .lean();

        // Calculate summary statistics
        const summary = {
            totalTransactions: totalCount,
            totalEarnings: transactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0),
            totalWithdrawals: transactions.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0),
            currentBalance: member?.wallet || 0,
            lifetimeEarnings: member?.totalEarnings || 0
        };

        return res.status(200).json({
            success: true,
            message: "Transaction history retrieved successfully",
            data: {
                member: {
                    _id: memberId,
                    fName: member?.fName,
                    lName: member?.lName,
                    userName: member?.userName
                },
                transactions: transactionsWithRunningTotal,
                summary: summary,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalRecords: totalCount,
                    recordsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error("Error getting transaction history:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve transaction history"
        });
    }
};
