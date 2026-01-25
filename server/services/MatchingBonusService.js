const Memeber = require("../models/memeberModel");
const Product = require("../models/Product");
const TransactionService = require("./TransactionService");
const mongoose = require("mongoose");
const { getMatchingPercentage } = require("../utils/commissionConfig");

/**
 * MatchingBonusService
 * Handles matching bonus calculation, carry forward logic, and wallet credits
 */
class MatchingBonusService {
    /**
     * Calculate and credit matching bonus for a member's product tree
     * @param {String} memberId - Member's ObjectId
     * @param {String} productId - Product's ObjectId
     * @returns {Object} Calculation result with bonus amount and details
     */
    async calculateMatchingBonus(memberId, productId) {
        try {
            // Validate inputs
            if (!mongoose.Types.ObjectId.isValid(memberId)) {
                throw new Error("Invalid member ID");
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("Invalid product ID");
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
                
                // Import BinaryTreeService to create the tree
                const BinaryTreeService = require("./BinaryTreeService");
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

            // Get the product to retrieve matching percentage
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error("Product not found");
            }

            // Get matching percentage based on member tier (with default fallback)
            const matchingPercentage = await getMatchingPercentage(member.tier, productId);

            // Calculate total volumes including carry forward
            const totalLeftVolume = 
                (productTree.binaryPosition.leftVolume || 0) + 
                (productTree.binaryPosition.carryForward?.left || 0);
            
            const totalRightVolume = 
                (productTree.binaryPosition.rightVolume || 0) + 
                (productTree.binaryPosition.carryForward?.right || 0);

            // Calculate matched volume (weaker leg)
            const matchedVolume = Math.min(totalLeftVolume, totalRightVolume);

            // Graceful handling: Skip matching if zero volumes
            if (matchedVolume === 0 || (totalLeftVolume === 0 && totalRightVolume === 0)) {
                return {
                    success: true,
                    bonusAmount: 0,
                    matchedVolume: 0,
                    message: "No matching volume available - skipped calculation"
                };
            }

            // Calculate matching bonus
            const bonusAmount = (matchedVolume * matchingPercentage) / 100;

            // Calculate carry forward for stronger leg
            const carryForwardLeft = totalLeftVolume - matchedVolume;
            const carryForwardRight = totalRightVolume - matchedVolume;

            // Update product tree with carry forward and reset current cycle volumes
            productTree.binaryPosition.leftVolume = 0;
            productTree.binaryPosition.rightVolume = 0;
            
            // Ensure carryForward object exists
            if (!productTree.binaryPosition.carryForward) {
                productTree.binaryPosition.carryForward = { left: 0, right: 0 };
            }
            
            productTree.binaryPosition.carryForward.left = carryForwardLeft;
            productTree.binaryPosition.carryForward.right = carryForwardRight;

            // Update statistics
            productTree.binaryPosition.totalMatchedPairs = (productTree.binaryPosition.totalMatchedPairs || 0) + 1;
            productTree.binaryPosition.totalMatchingBonus = (productTree.binaryPosition.totalMatchingBonus || 0) + bonusAmount;
            productTree.binaryPosition.lastMatchingDate = new Date();

            // Credit bonus to wallet
            const balanceBefore = member.wallet || 0;
            member.wallet = balanceBefore + bonusAmount;
            member.totalEarnings = (member.totalEarnings || 0) + bonusAmount;
            const balanceAfter = member.wallet;

            // Save member updates
            await member.save();

            // Create transaction log using TransactionService
            await TransactionService.logTransaction(
                memberId,
                productId,
                'matching_bonus',
                bonusAmount,
                {
                    description: `Matching bonus for product ${productId}`,
                    matchingDetails: {
                        leftVolume: totalLeftVolume,
                        rightVolume: totalRightVolume,
                        matchedVolume: matchedVolume,
                        matchingPercentage: matchingPercentage,
                        carryForwardLeft: carryForwardLeft,
                        carryForwardRight: carryForwardRight
                    }
                }
            );

            return {
                success: true,
                bonusAmount: bonusAmount,
                matchedVolume: matchedVolume,
                matchingPercentage: matchingPercentage,
                carryForward: {
                    left: carryForwardLeft,
                    right: carryForwardRight
                },
                balanceBefore: balanceBefore,
                balanceAfter: balanceAfter
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new MatchingBonusService();
