const Memeber = require("../models/memeberModel"); // V1 model with ROOT support
const Product = require("../models/Product");
const mongoose = require("mongoose");

/**
 * Binary Tree Service - ROOT-based ML Binary System
 * 
 * Key Concepts:
 * - Each product can have multiple ROOTs
 * - Each ROOT = Only Level 1 (ROOT's direct left and right children)
 * - When Level 1 is complete (2 positions filled), a new ROOT is automatically created
 * - ROOT: 1 member (the sponsor/root member)
 * - Level 1: 2 members maximum (ROOT's direct left and right children)
 * 
 * ROOT Creation Logic:
 * - ROOT 1: Created when member makes first purchase
 * - ROOT 2: Created when ROOT 1's Level 1 is complete (left + right filled)
 * - ROOT 3: Created when ROOT 2's Level 1 is complete
 * - And so on...
 * 
 * Example:
 * ROOT 1:
 *     Anita (ROOT)
 *     ├── Left Child
 *     └── Right Child
 * 
 * When both positions are filled, ROOT 2 is created:
 * ROOT 2:
 *     Anita (ROOT)
 *     ├── (empty - next member goes here)
 *     └── (empty)
 */

class BinaryTreeService {
    
    /**
     * Find or create product tree for a member
     * @param {String} memberId - Member's ObjectId
     * @param {String} productId - Product's ObjectId
     * @returns {Object} Product tree object
     */
    async findOrCreateProductTree(memberId, productId) {
        try {
            // Validate inputs
            if (!mongoose.Types.ObjectId.isValid(memberId)) {
                throw new Error("Invalid member ID");
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("Invalid product ID");
            }

            const member = await Memeber.findById(memberId);
            if (!member) {
                throw new Error("Member not found");
            }

            // Check if product tree exists
            let productTree = member.productBinaryTrees.find(
                tree => tree.productId.toString() === productId.toString()
            );

            // If not exists, create new product tree with ROOT 1
            if (!productTree) {
                productTree = {
                    productId: productId,
                    roots: [{
                        rootNumber: 1,
                        status: 'ACTIVE',
                        binaryPosition: {
                            leftLeg: [],
                            rightLeg: [],
                            leftVolume: 0,
                            rightVolume: 0,
                            carryForward: { left: 0, right: 0 },
                            totalMatchedPairs: 0,
                            totalMatchingBonus: 0
                        },
                        levels: {
                            level1: { filled: 0, capacity: 2 },  // ROOT's children (Level 1) - only level used
                            level2: { filled: 0, capacity: 4 },  // Not used in new logic
                            level3: { filled: 0, capacity: 8 },  // Not used in new logic
                            level4: { filled: 0, capacity: 16 }, // Not used in new logic
                            level5: { filled: 0, capacity: 32 }  // Not used in new logic
                        },
                        totalMembers: 0, // ROOT member excluded from count
                        maxCapacity: 2, // Only 2 positions per ROOT (left + right)
                        createdAt: new Date()
                    }],
                    currentActiveRoot: 1,
                    purchases: [],
                    totalPurchases: 0,
                    totalSpent: 0,
                    isActive: false,
                    directReferrals: 0,
                    totalDownline: 0
                };

                member.productBinaryTrees.push(productTree);
                await member.save();
            }

            return productTree;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get active ROOT for a member's product tree
     * @param {String} memberId - Member's ObjectId
     * @param {String} productId - Product's ObjectId
     * @returns {Object} Active ROOT object
     */
    async getActiveRoot(memberId, productId) {
        try {
            const productTree = await this.findOrCreateProductTree(memberId, productId);
            
            // Find the active ROOT
            const activeRoot = productTree.roots.find(
                root => root.rootNumber === productTree.currentActiveRoot
            );

            if (!activeRoot) {
                throw new Error("Active ROOT not found");
            }

            return activeRoot;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Ensure member has ROOT entry for a specific ROOT number
     * @param {String} memberId - Member's ObjectId
     * @param {String} productId - Product's ObjectId
     * @param {Number} rootNumber - ROOT number
     * @returns {Object} ROOT entry
     */
    async ensureMemberHasRoot(memberId, productId, rootNumber) {
        try {
            const member = await Memeber.findById(memberId);
            if (!member) {
                throw new Error("Member not found");
            }

            // Get or create product tree
            await this.findOrCreateProductTree(memberId, productId);

            // Refresh member data
            const refreshedMember = await Memeber.findById(memberId);
            const productTree = refreshedMember.productBinaryTrees.find(
                tree => tree.productId.toString() === productId.toString()
            );

            if (!productTree) {
                throw new Error("Product tree not found after creation");
            }

            // Check if ROOT entry exists
            let memberRoot = productTree.roots.find(r => r.rootNumber === rootNumber);

            // If ROOT doesn't exist, create it
            if (!memberRoot) {
                memberRoot = {
                    rootNumber: rootNumber,
                    status: 'ACTIVE',
                    binaryPosition: {
                        leftLeg: [],
                        rightLeg: [],
                        leftVolume: 0,
                        rightVolume: 0,
                        carryForward: { left: 0, right: 0 },
                        totalMatchedPairs: 0,
                        totalMatchingBonus: 0
                    },
                    levels: {
                        level1: { filled: 0, capacity: 2 },
                        level2: { filled: 0, capacity: 4 },
                        level3: { filled: 0, capacity: 8 },
                        level4: { filled: 0, capacity: 16 },
                        level5: { filled: 0, capacity: 32 }
                    },
                    totalMembers: 0, // This member is not ROOT, so 0
                    maxCapacity: 2, // Only 2 positions per ROOT (left + right)
                    createdAt: new Date()
                };

                productTree.roots.push(memberRoot);
                await refreshedMember.save();
            }

            return memberRoot;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check if ROOT is full (62 members excluding ROOT)
     * @param {Object} root - ROOT object
     * @returns {Boolean} True if full
     */
    isRootFull(root) {
        return root.totalMembers >= root.maxCapacity; // maxCapacity = 62 (2+4+8+16+32)
    }

    /**
     * Check if ROOT's Level 1 is complete (first left + right positions filled)
     * When Level 1 is complete, new ROOT should be created
     * @param {Object} root - ROOT object
     * @returns {Boolean} True if Level 1 is complete
     */
    isLevel1Complete(root) {
        return root.levels.level1.filled >= root.levels.level1.capacity; // capacity = 2 (left + right)
    }

    /**
     * Create new ROOT for a product tree
     * @param {String} memberId - Member's ObjectId
     * @param {String} productId - Product's ObjectId
     * @returns {Object} New ROOT object
     */
    async createNewRoot(memberId, productId) {
        try {
            const member = await Memeber.findById(memberId);
            const productTree = member.productBinaryTrees.find(
                tree => tree.productId.toString() === productId.toString()
            );

            if (!productTree) {
                throw new Error("Product tree not found");
            }

            // Get next ROOT number
            const nextRootNumber = productTree.roots.length + 1;

            // Create new ROOT
            const newRoot = {
                rootNumber: nextRootNumber,
                status: 'ACTIVE',
                binaryPosition: {
                    leftLeg: [],
                    rightLeg: [],
                    leftVolume: 0,
                    rightVolume: 0,
                    carryForward: { left: 0, right: 0 },
                    totalMatchedPairs: 0,
                    totalMatchingBonus: 0
                },
                levels: {
                    level1: { filled: 0, capacity: 2 },  // ROOT's children - only level used
                    level2: { filled: 0, capacity: 4 },  // Not used in new logic
                    level3: { filled: 0, capacity: 8 },  // Not used in new logic
                    level4: { filled: 0, capacity: 16 }, // Not used in new logic
                    level5: { filled: 0, capacity: 32 }  // Not used in new logic
                },
                totalMembers: 0, // ROOT member excluded from count
                maxCapacity: 2, // Only 2 positions per ROOT (left + right)
                createdAt: new Date()
            };

            // Mark previous ROOT as COMPLETE
            const previousRoot = productTree.roots.find(
                root => root.rootNumber === productTree.currentActiveRoot
            );
            if (previousRoot) {
                previousRoot.status = 'COMPLETE';
                previousRoot.completedAt = new Date();
            }

            // Add new ROOT
            productTree.roots.push(newRoot);
            productTree.currentActiveRoot = nextRootNumber;

            await member.save();

            console.log(`✅ Created new ROOT ${nextRootNumber} for member ${memberId}, product ${productId}`);

            return newRoot;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find placement position in ROOT using BFS (Breadth-First Search)
     * Searches level by level to find first available position
     * Traditional ML Binary: Top to bottom, left to right
     * NOTE: Only searches within Level 1 (ROOT's direct children)
     * When Level 1 is complete, new ROOT is created
     * @param {String} sponsorId - Sponsor's member ID
     * @param {String} productId - Product ID
     * @param {Number} rootNumber - ROOT number to place in
     * @returns {Object} { parentId, leg: 'left'|'right', level, position } or null if Level 1 is complete
     */
    async findPlacementInRoot(sponsorId, productId, rootNumber) {
        try {
            // First check if ROOT's Level 1 is already complete
            const sponsor = await Memeber.findById(sponsorId);
            const sponsorTree = sponsor.productBinaryTrees.find(
                tree => tree.productId.toString() === productId.toString()
            );
            
            if (!sponsorTree) {
                throw new Error("Sponsor product tree not found");
            }
            
            const root = sponsorTree.roots.find(r => r.rootNumber === rootNumber);
            
            if (!root) {
                throw new Error(`ROOT ${rootNumber} not found for sponsor`);
            }
            
            // Check if Level 1 is complete (ROOT's direct left and right are filled)
            if (this.isLevel1Complete(root)) {
                console.log(`ROOT ${rootNumber} Level 1 is complete (${root.levels.level1.filled}/${root.levels.level1.capacity} positions filled)`);
                return null;
            }

            // Only check ROOT's direct children (Level 1)
            // Check left position
            const leftChild = root.binaryPosition.leftLeg.find(leg => leg.position === 'L');
            
            if (!leftChild) {
                // Left position is available
                return {
                    parentId: sponsorId,
                    leg: 'left',
                    level: 2, // Display level (ROOT is 1, children are 2)
                    position: 'L'
                };
            }

            // Check right position
            const rightChild = root.binaryPosition.rightLeg.find(leg => leg.position === 'R');
            
            if (!rightChild) {
                // Right position is available
                return {
                    parentId: sponsorId,
                    leg: 'right',
                    level: 2, // Display level (ROOT is 1, children are 2)
                    position: 'R'
                };
            }

            // Both Level 1 positions filled - ROOT is complete
            console.log(`ROOT ${rootNumber} Level 1 is complete - both positions filled`);
            return null;
        } catch (error) {
            console.error("Error finding placement in ROOT:", error);
            throw error;
        }
    }

    /**
     * Place member in binary tree with ROOT system
     * @param {String} sponsorId - Sponsor's member ID (who referred)
     * @param {String} newMemberId - New member to place
     * @param {String} productId - Product ID
     * @param {Number} amount - Purchase amount
     * @returns {Object} Placement result
     */
    async placeMemberInBinaryTree(sponsorId, newMemberId, productId, amount) {
        try {
            // Validate inputs
            if (!mongoose.Types.ObjectId.isValid(sponsorId)) {
                throw new Error("Invalid sponsor ID");
            }
            if (!mongoose.Types.ObjectId.isValid(newMemberId)) {
                throw new Error("Invalid new member ID");
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("Invalid product ID");
            }
            if (sponsorId === newMemberId) {
                throw new Error("Member cannot refer themselves");
            }

            // Get sponsor's product tree (fresh from DB)
            const sponsor = await Memeber.findById(sponsorId);
            const sponsorTree = sponsor.productBinaryTrees.find(
                tree => tree.productId.toString() === productId.toString()
            );
            
            if (!sponsorTree) {
                throw new Error("Sponsor product tree not found");
            }

            // Get active ROOT
            let activeRoot = sponsorTree.roots.find(
                root => root.rootNumber === sponsorTree.currentActiveRoot
            );

            // Check if active ROOT's Level 1 is complete - if yes, create new ROOT
            // Level 1 = ROOT's direct left and right children (2 positions)
            if (this.isLevel1Complete(activeRoot)) {
                console.log(`🎉 ROOT ${activeRoot.rootNumber} Level 1 COMPLETE! (${activeRoot.levels.level1.filled}/${activeRoot.levels.level1.capacity} positions filled)`);
                console.log(`🆕 ROOT ${activeRoot.rootNumber + 1} CREATED! Starting new tree...`);
                
                // Mark current ROOT as COMPLETE
                activeRoot.status = 'COMPLETE';
                activeRoot.completedAt = new Date();
                await sponsor.save();
                
                // Create new ROOT
                activeRoot = await this.createNewRoot(sponsorId, productId);
            }

            // Find placement position in active ROOT
            const placement = await this.findPlacementInRoot(
                sponsorId,
                productId,
                activeRoot.rootNumber
            );

            // If no placement found (ROOT Level 1 is complete), create new ROOT and place there
            if (!placement) {
                console.log(`🎉 ROOT ${activeRoot.rootNumber} Level 1 COMPLETE!`);
                console.log(`🆕 ROOT ${activeRoot.rootNumber + 1} CREATED! Starting new tree...`);
                
                // Mark current ROOT as COMPLETE
                activeRoot.status = 'COMPLETE';
                activeRoot.completedAt = new Date();
                
                // Refresh sponsor to save status change
                const refreshedSponsor = await Memeber.findById(sponsorId);
                const refreshedTree = refreshedSponsor.productBinaryTrees.find(
                    tree => tree.productId.toString() === productId.toString()
                );
                const refreshedRoot = refreshedTree.roots.find(
                    root => root.rootNumber === activeRoot.rootNumber
                );
                refreshedRoot.status = 'COMPLETE';
                refreshedRoot.completedAt = new Date();
                await refreshedSponsor.save();
                
                // Create new ROOT
                activeRoot = await this.createNewRoot(sponsorId, productId);
                
                // Place in new ROOT at Level 1 Left (first position under new ROOT)
                const newPlacement = {
                    parentId: sponsorId,
                    leg: 'left',
                    level: 2, // Display level (ROOT is 1, first child is 2)
                    position: 'L'
                };
                
                // Get parent member (fresh from DB)
                const parentMember = await Memeber.findById(newPlacement.parentId);
                const parentTree = parentMember.productBinaryTrees.find(
                    tree => tree.productId.toString() === productId.toString()
                );
                const parentRoot = parentTree.roots.find(
                    root => root.rootNumber === activeRoot.rootNumber
                );

                // Create or get new member's product tree with ROOT entry
                await this.ensureMemberHasRoot(newMemberId, productId, activeRoot.rootNumber);

                // Add to parent's leg
                const legEntry = {
                    memberId: newMemberId,
                    joinedAt: new Date(),
                    level: newPlacement.level,
                    position: newPlacement.position
                };

                parentRoot.binaryPosition.leftLeg.push(legEntry);

                // Update level tracking
                const levelKey = `level${newPlacement.level}`;
                if (parentRoot.levels[levelKey]) {
                    parentRoot.levels[levelKey].filled += 1;
                }

                // Update total members (with race condition check)
                if (!this.isRootFull(parentRoot)) {
                    parentRoot.totalMembers += 1;
                } else {
                    // ROOT became full during placement, retry
                    throw new Error('ROOT became full during placement, retry needed');
                }

                // Update sponsor's direct referrals
                parentTree.directReferrals += 1;

                await parentMember.save();

                console.log(`✅ Placed member ${newMemberId} in ROOT ${activeRoot.rootNumber}, Level ${newPlacement.level}, Position ${newPlacement.position}`);

                return {
                    rootNumber: activeRoot.rootNumber,
                    parentId: newPlacement.parentId,
                    leg: newPlacement.leg,
                    level: newPlacement.level,
                    position: newPlacement.position,
                    isSpillover: false
                };
            }

            // Get parent member (fresh from DB)
            const parentMember = await Memeber.findById(placement.parentId);
            const parentTree = parentMember.productBinaryTrees.find(
                tree => tree.productId.toString() === productId.toString()
            );
            
            if (!parentTree) {
                // Parent doesn't have product tree yet, create it
                await this.findOrCreateProductTree(placement.parentId, productId);
                // Refresh parent
                const refreshedParent = await Memeber.findById(placement.parentId);
                const refreshedTree = refreshedParent.productBinaryTrees.find(
                    tree => tree.productId.toString() === productId.toString()
                );
                
                // Ensure parent has this ROOT
                let parentRoot = refreshedTree.roots.find(
                    root => root.rootNumber === activeRoot.rootNumber
                );
                
                if (!parentRoot) {
                    // Add this ROOT to parent
                    parentRoot = {
                        rootNumber: activeRoot.rootNumber,
                        status: 'ACTIVE',
                        binaryPosition: {
                            leftLeg: [],
                            rightLeg: [],
                            leftVolume: 0,
                            rightVolume: 0,
                            carryForward: { left: 0, right: 0 },
                            totalMatchedPairs: 0,
                            totalMatchingBonus: 0
                        },
                        levels: {
                            level1: { filled: 0, capacity: 2 },
                            level2: { filled: 0, capacity: 4 },
                            level3: { filled: 0, capacity: 8 },
                            level4: { filled: 0, capacity: 16 },
                            level5: { filled: 0, capacity: 32 }
                        },
                        totalMembers: 0,
                        maxCapacity: 2, // Only 2 positions per ROOT (left + right)
                        createdAt: new Date()
                    };
                    refreshedTree.roots.push(parentRoot);
                }
                
                // Create or get new member's product tree with ROOT entry
                await this.ensureMemberHasRoot(newMemberId, productId, activeRoot.rootNumber);

                // Add to parent's leg
                const legEntry = {
                    memberId: newMemberId,
                    joinedAt: new Date(),
                    level: placement.level,
                    position: placement.position
                };

                if (placement.leg === 'left') {
                    parentRoot.binaryPosition.leftLeg.push(legEntry);
                } else {
                    parentRoot.binaryPosition.rightLeg.push(legEntry);
                }

                // Update level tracking
                const levelKey = `level${placement.level}`;
                if (parentRoot.levels[levelKey]) {
                    parentRoot.levels[levelKey].filled += 1;
                }

                // Update total members (with race condition check)
                if (!this.isRootFull(parentRoot)) {
                    parentRoot.totalMembers += 1;
                } else {
                    // ROOT became full during placement, retry
                    throw new Error('ROOT became full during placement, retry needed');
                }

                await refreshedParent.save();
                
                console.log(`✅ Placed member ${newMemberId} in ROOT ${activeRoot.rootNumber}, Level ${placement.level}, Position ${placement.position}`);

                return {
                    rootNumber: activeRoot.rootNumber,
                    parentId: placement.parentId,
                    leg: placement.leg,
                    level: placement.level,
                    position: placement.position,
                    isSpillover: sponsorId.toString() !== placement.parentId.toString()
                };
            }
            
            const parentRoot = parentTree.roots.find(
                root => root.rootNumber === activeRoot.rootNumber
            );
            
            if (!parentRoot) {
                // Parent doesn't have this ROOT, add it
                const newParentRoot = {
                    rootNumber: activeRoot.rootNumber,
                    status: 'ACTIVE',
                    binaryPosition: {
                        leftLeg: [],
                        rightLeg: [],
                        leftVolume: 0,
                        rightVolume: 0,
                        carryForward: { left: 0, right: 0 },
                        totalMatchedPairs: 0,
                        totalMatchingBonus: 0
                    },
                    levels: {
                        level1: { filled: 0, capacity: 2 },  // Only level used
                        level2: { filled: 0, capacity: 4 },  // Not used
                        level3: { filled: 0, capacity: 8 },  // Not used
                        level4: { filled: 0, capacity: 16 }, // Not used
                        level5: { filled: 0, capacity: 32 }  // Not used
                    },
                    totalMembers: 0,
                    maxCapacity: 2, // Only 2 positions per ROOT (left + right)
                    createdAt: new Date()
                };
                parentTree.roots.push(newParentRoot);
                
                // Create or get new member's product tree
                await this.findOrCreateProductTree(newMemberId, productId);

                // Add to parent's leg
                const legEntry = {
                    memberId: newMemberId,
                    joinedAt: new Date(),
                    level: placement.level,
                    position: placement.position
                };

                if (placement.leg === 'left') {
                    newParentRoot.binaryPosition.leftLeg.push(legEntry);
                } else {
                    newParentRoot.binaryPosition.rightLeg.push(legEntry);
                }

                // Update level tracking
                const levelKey = `level${placement.level}`;
                if (newParentRoot.levels[levelKey]) {
                    newParentRoot.levels[levelKey].filled += 1;
                }

                // Update total members (with race condition check)
                if (!this.isRootFull(newParentRoot)) {
                    newParentRoot.totalMembers += 1;
                } else {
                    // ROOT became full during placement, retry
                    throw new Error('ROOT became full during placement, retry needed');
                }

                await parentMember.save();
                
                console.log(`✅ Placed member ${newMemberId} in ROOT ${activeRoot.rootNumber}, Level ${placement.level}, Position ${placement.position}`);

                return {
                    rootNumber: activeRoot.rootNumber,
                    parentId: placement.parentId,
                    leg: placement.leg,
                    level: placement.level,
                    position: placement.position,
                    isSpillover: sponsorId.toString() !== placement.parentId.toString()
                };
            }

            // Create or get new member's product tree with ROOT entry
            await this.ensureMemberHasRoot(newMemberId, productId, activeRoot.rootNumber);

            // Add to parent's leg
            const legEntry = {
                memberId: newMemberId,
                joinedAt: new Date(),
                level: placement.level,
                position: placement.position
            };

            if (placement.leg === 'left') {
                parentRoot.binaryPosition.leftLeg.push(legEntry);
            } else {
                parentRoot.binaryPosition.rightLeg.push(legEntry);
            }

            // Update level tracking
            const levelKey = `level${placement.level}`;
            if (parentRoot.levels[levelKey]) {
                parentRoot.levels[levelKey].filled += 1;
            }

            // Update total members (with race condition check)
            if (!this.isRootFull(parentRoot)) {
                parentRoot.totalMembers += 1;
            } else {
                // ROOT became full during placement, retry
                throw new Error('ROOT became full during placement, retry needed');
            }

            // Update sponsor's direct referrals (only if sponsor is parent)
            if (sponsorId.toString() === placement.parentId.toString()) {
                parentTree.directReferrals += 1;
            }

            await parentMember.save();

            // CRITICAL: Update sponsor's ROOT totalMembers if sponsor != parent (spillover case)
            if (sponsorId.toString() !== placement.parentId.toString()) {
                const sponsorMember = await Memeber.findById(sponsorId);
                const sponsorTree = sponsorMember.productBinaryTrees.find(
                    tree => tree.productId.toString() === productId.toString()
                );
                const sponsorRoot = sponsorTree.roots.find(
                    root => root.rootNumber === activeRoot.rootNumber
                );
                
                // Update sponsor's ROOT totalMembers and level tracking
                if (sponsorRoot) {
                    if (!this.isRootFull(sponsorRoot)) {
                        sponsorRoot.totalMembers += 1;
                    }
                    if (sponsorRoot.levels[levelKey]) {
                        sponsorRoot.levels[levelKey].filled += 1;
                    }
                    await sponsorMember.save();
                }
            }

            console.log(`✅ Placed member ${newMemberId} in ROOT ${activeRoot.rootNumber}, Level ${placement.level}, Position ${placement.position}`);

            return {
                rootNumber: activeRoot.rootNumber,
                parentId: placement.parentId,
                leg: placement.leg,
                level: placement.level,
                position: placement.position,
                isSpillover: sponsorId.toString() !== placement.parentId.toString()
            };
        } catch (error) {
            console.error("Error placing member in binary tree:", error);
            throw error;
        }
    }

    /**
     * Check if this is member's first purchase of a product
     * @param {String} memberId - Member's ObjectId
     * @param {String} productId - Product's ObjectId
     * @returns {Boolean} True if first purchase
     */
    async isFirstPurchaseOfProduct(memberId, productId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(memberId)) {
                throw new Error("Invalid member ID");
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("Invalid product ID");
            }

            const member = await Memeber.findById(memberId);
            if (!member) {
                return true; // New member, definitely first purchase
            }

            const productTree = member.productBinaryTrees.find(
                tree => tree.productId.toString() === productId.toString()
            );

            if (!productTree) {
                return true; // No product tree, first purchase
            }

            return productTree.purchases.length === 0 || productTree.totalPurchases === 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get upline chain for a member in a product tree
     * Traverses up the binary tree to get all ancestors
     * @param {String} memberId - Member's ObjectId
     * @param {String} productId - Product's ObjectId
     * @returns {Array} Array of ancestor member IDs (from direct parent to root)
     */
    async getUplineChain(memberId, productId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(memberId)) {
                throw new Error("Invalid member ID");
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("Invalid product ID");
            }

            const uplineChain = [];
            const member = await Memeber.findById(memberId);
            
            if (!member) {
                return uplineChain;
            }

            const productTree = member.productBinaryTrees.find(
                tree => tree.productId.toString() === productId.toString()
            );

            if (!productTree || !productTree.roots || productTree.roots.length === 0) {
                return uplineChain;
            }

            // Get the first ROOT (member's own ROOT)
            const memberRoot = productTree.roots[0];
            
            // If member has no parent in their own ROOT, they are the ROOT member
            if (!memberRoot.parentId) {
                return uplineChain;
            }

            // Start from parent and traverse up
            let currentParentId = memberRoot.parentId;
            const visited = new Set();
            
            while (currentParentId && !visited.has(currentParentId.toString())) {
                visited.add(currentParentId.toString());
                uplineChain.push(currentParentId.toString());
                
                // Get parent member
                const parentMember = await Memeber.findById(currentParentId);
                if (!parentMember) break;
                
                const parentProductTree = parentMember.productBinaryTrees.find(
                    tree => tree.productId.toString() === productId.toString()
                );
                
                if (!parentProductTree || !parentProductTree.roots || parentProductTree.roots.length === 0) {
                    break;
                }
                
                const parentRoot = parentProductTree.roots[0];
                currentParentId = parentRoot.parentId;
            }

            return uplineChain;
        } catch (error) {
            console.error("Error getting upline chain:", error);
            return [];
        }
    }

    /**
     * Find parent of a member in their product tree
     * @param {String} memberId - Member's ObjectId
     * @param {String} productId - Product's ObjectId
     * @returns {String|null} Parent member ID or null if no parent (ROOT member)
     */
    async findParentInProductTree(memberId, productId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(memberId)) {
                throw new Error("Invalid member ID");
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("Invalid product ID");
            }

            const member = await Memeber.findById(memberId);
            
            if (!member) {
                return null;
            }

            const productTree = member.productBinaryTrees.find(
                tree => tree.productId.toString() === productId.toString()
            );

            if (!productTree || !productTree.roots || productTree.roots.length === 0) {
                return null;
            }

            // Get the first ROOT (member's own ROOT)
            const memberRoot = productTree.roots[0];
            
            // Return parentId if exists, otherwise null (member is ROOT)
            return memberRoot.parentId ? memberRoot.parentId.toString() : null;
        } catch (error) {
            console.error("Error finding parent in product tree:", error);
            return null;
        }
    }
}

module.exports = new BinaryTreeService();
