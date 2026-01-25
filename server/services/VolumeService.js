const Memeber = require("../models/memeberModel");
const mongoose = require("mongoose");
const BinaryTreeService = require("./BinaryTreeService");

/**
 * VolumeService
 * Handles volume calculation and propagation for product-wise binary trees
 */
class VolumeService {
    /**
     * Update product volume for a member after a purchase
     * @param {String} memberId - Member who made the purchase
     * @param {String} buyerId - Buyer's member ID (same as memberId for direct purchase)
     * @param {String} productId - Product ID
     * @param {Number} amount - Purchase amount
     * @returns {Object} Update result with affected members
     */
    async updateProductVolume(memberId, buyerId, productId, amount) {
        try {
            // Validate inputs
            if (!mongoose.Types.ObjectId.isValid(memberId)) {
                throw new Error("Invalid member ID");
            }
            if (!mongoose.Types.ObjectId.isValid(buyerId)) {
                throw new Error("Invalid buyer ID");
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("Invalid product ID");
            }
            if (typeof amount !== 'number' || amount <= 0) {
                throw new Error("Amount must be a positive number");
            }

            // Find the member
            const member = await Memeber.findById(memberId);
            if (!member) {
                throw new Error("Member not found");
            }

            // Get the product tree for this member
            let productTree = member.productBinaryTrees.find(
                (tree) => tree.productId.toString() === productId.toString()
            );

            // Graceful handling: Create product tree on-the-fly if missing
            if (!productTree) {
                console.warn(`Product tree not found for member ${memberId} and product ${productId}. Creating on-the-fly.`);
                productTree = await BinaryTreeService.findOrCreateProductTree(memberId, productId);
                
                // Refresh member data after creating tree
                const updatedMember = await Memeber.findById(memberId);
                productTree = updatedMember.productBinaryTrees.find(
                    (tree) => tree.productId.toString() === productId.toString()
                );
                
                if (!productTree) {
                    throw new Error("Failed to create product tree");
                }
            }

            // Check if ROOT exists
            if (!productTree.roots || productTree.roots.length === 0) {
                throw new Error(`No ROOT found for member ${memberId} in product ${productId}`);
            }

            // Get the first ROOT (member's own ROOT)
            const memberRoot = productTree.roots[0];

            // Determine which leg the buyer belongs to
            const leg = await this.findLegForMember(memberId, buyerId, productId);

            if (leg === 'left') {
                memberRoot.binaryPosition.leftVolume = (memberRoot.binaryPosition.leftVolume || 0) + amount;
            } else if (leg === 'right') {
                memberRoot.binaryPosition.rightVolume = (memberRoot.binaryPosition.rightVolume || 0) + amount;
            } else {
                // If buyer is not in any leg, this might be a direct purchase
                // In this case, we don't update volumes
                console.warn(`Buyer ${buyerId} not found in any leg of member ${memberId} for product ${productId}`);
            }

            await member.save();

            return {
                success: true,
                memberId: memberId,
                leg: leg,
                updatedVolume: leg === 'left' ? memberRoot.binaryPosition.leftVolume : memberRoot.binaryPosition.rightVolume
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find which leg a child member belongs to in parent's product tree
     * @param {String} parentId - Parent member's ID
     * @param {String} childId - Child member's ID
     * @param {String} productId - Product ID
     * @returns {String} 'left', 'right', or 'none'
     */
    async findLegForMember(parentId, childId, productId) {
        try {
            // Validate inputs
            if (!mongoose.Types.ObjectId.isValid(parentId)) {
                throw new Error("Invalid parent ID");
            }
            if (!mongoose.Types.ObjectId.isValid(childId)) {
                throw new Error("Invalid child ID");
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("Invalid product ID");
            }

            // Get parent's product tree
            const parent = await Memeber.findById(parentId);
            if (!parent) {
                throw new Error("Parent member not found");
            }

            const productTree = parent.productBinaryTrees.find(
                (tree) => tree.productId.toString() === productId.toString()
            );

            if (!productTree || !productTree.roots || productTree.roots.length === 0) {
                return 'none';
            }

            // Get the first ROOT (parent's own ROOT)
            const parentRoot = productTree.roots[0];

            // Check if child is directly in left leg
            const inLeftLeg = parentRoot.binaryPosition.leftLeg.some(
                (member) => member.memberId.toString() === childId.toString()
            );

            if (inLeftLeg) {
                return 'left';
            }

            // Check if child is directly in right leg
            const inRightLeg = parentRoot.binaryPosition.rightLeg.some(
                (member) => member.memberId.toString() === childId.toString()
            );

            if (inRightLeg) {
                return 'right';
            }

            // If not directly in either leg, check if child is in downline of left leg
            for (const leftMember of parentRoot.binaryPosition.leftLeg) {
                const isInLeftDownline = await this.isInDownline(
                    leftMember.memberId.toString(),
                    childId,
                    productId
                );
                if (isInLeftDownline) {
                    return 'left';
                }
            }

            // Check if child is in downline of right leg
            for (const rightMember of parentRoot.binaryPosition.rightLeg) {
                const isInRightDownline = await this.isInDownline(
                    rightMember.memberId.toString(),
                    childId,
                    productId
                );
                if (isInRightDownline) {
                    return 'right';
                }
            }

            return 'none';
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check if a descendant is in the downline of an ancestor in a product tree
     * @param {String} ancestorId - Ancestor member's ID
     * @param {String} descendantId - Descendant member's ID
     * @param {String} productId - Product ID
     * @returns {Boolean} True if descendant is in ancestor's downline
     */
    async isInDownline(ancestorId, descendantId, productId) {
        try {
            // Validate inputs
            if (!mongoose.Types.ObjectId.isValid(ancestorId)) {
                throw new Error("Invalid ancestor ID");
            }
            if (!mongoose.Types.ObjectId.isValid(descendantId)) {
                throw new Error("Invalid descendant ID");
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("Invalid product ID");
            }

            // If ancestor and descendant are the same, return false
            if (ancestorId.toString() === descendantId.toString()) {
                return false;
            }

            // Get the upline chain for the descendant
            const uplineChain = await BinaryTreeService.getUplineChain(descendantId, productId);

            // Check if ancestor is in the upline chain
            const isInUpline = uplineChain.some(
                (memberId) => memberId.toString() === ancestorId.toString()
            );

            return isInUpline;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Propagate volume up the entire upline chain for a product
     * @param {String} buyerId - Buyer's member ID
     * @param {String} productId - Product ID
     * @param {Number} amount - Purchase amount
     * @param {String} referrerId - Direct referrer's ID (optional)
     * @returns {Object} Propagation result with affected members
     */
    async propagateVolumeUpline(buyerId, productId, amount, referrerId = null) {
        try {
            // Validate inputs
            if (!mongoose.Types.ObjectId.isValid(buyerId)) {
                throw new Error("Invalid buyer ID");
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("Invalid product ID");
            }
            if (typeof amount !== 'number' || amount <= 0) {
                throw new Error("Amount must be a positive number");
            }

            const affectedMembers = [];
            const visitedMembers = new Set(); // Prevent circular references
            let circularReferenceDetected = false;

            // Start with the direct referrer if provided, otherwise get from upline chain
            let currentMemberId = referrerId;

            // If no referrer provided, get the upline chain starting from buyer
            if (!currentMemberId) {
                const uplineChain = await BinaryTreeService.getUplineChain(buyerId, productId);
                if (uplineChain.length === 0) {
                    // No upline, buyer might be root or orphaned
                    return {
                        success: true,
                        affectedMembers: [],
                        message: "No upline to propagate to"
                    };
                }
                currentMemberId = uplineChain[0]; // Start with immediate parent
            }

            // Propagate volume up the chain
            while (currentMemberId) {
                // Check for circular reference
                const currentMemberIdStr = currentMemberId.toString();
                if (visitedMembers.has(currentMemberIdStr)) {
                    const errorMsg = `Circular reference detected in binary tree at member ${currentMemberIdStr} for product ${productId}`;
                    console.error(errorMsg);
                    
                    // Log error for admin alert
                    await this.logCircularReferenceError(currentMemberIdStr, productId, Array.from(visitedMembers));
                    
                    circularReferenceDetected = true;
                    break;
                }
                visitedMembers.add(currentMemberIdStr);

                // Update volume for current member
                try {
                    const updateResult = await this.updateProductVolume(
                        currentMemberId,
                        buyerId,
                        productId,
                        amount
                    );

                    affectedMembers.push({
                        memberId: currentMemberId,
                        leg: updateResult.leg,
                        updatedVolume: updateResult.updatedVolume
                    });
                } catch (error) {
                    console.error(`Error updating volume for member ${currentMemberId}:`, error.message);
                    // Continue with next member in chain
                }

                // Get the next member in the upline chain
                const parent = await BinaryTreeService.findParentInProductTree(currentMemberId, productId);
                
                if (!parent) {
                    // Reached the root or no parent found
                    break;
                }

                currentMemberId = parent._id;
            }

            return {
                success: !circularReferenceDetected,
                affectedMembers: affectedMembers,
                totalAffected: affectedMembers.length,
                circularReferenceDetected: circularReferenceDetected,
                warning: circularReferenceDetected ? "Circular reference detected, propagation stopped" : null
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Log circular reference error for admin alert
     * @param {String} memberId - Member ID where circular reference was detected
     * @param {String} productId - Product ID
     * @param {Array} visitedPath - Array of visited member IDs
     */
    async logCircularReferenceError(memberId, productId, visitedPath) {
        try {
            // Log to console for immediate visibility
            console.error('=== CIRCULAR REFERENCE DETECTED ===');
            console.error(`Member ID: ${memberId}`);
            console.error(`Product ID: ${productId}`);
            console.error(`Visited Path: ${visitedPath.join(' -> ')}`);
            console.error('===================================');

            // TODO: Implement admin notification system
            // This could be:
            // - Email notification to admin
            // - Database log entry in an errors collection
            // - Push notification to admin dashboard
            // - Slack/Discord webhook notification
            
            // For now, we'll create a simple error log entry
            // You can extend this to send actual notifications
            const errorLog = {
                type: 'CIRCULAR_REFERENCE',
                memberId: memberId,
                productId: productId,
                visitedPath: visitedPath,
                timestamp: new Date(),
                severity: 'HIGH'
            };

            // Log to file or database (implement as needed)
            console.log('Error log created:', JSON.stringify(errorLog, null, 2));

        } catch (error) {
            console.error('Error logging circular reference:', error);
        }
    }
}

module.exports = new VolumeService();
