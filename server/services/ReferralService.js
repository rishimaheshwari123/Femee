const Memeber = require("../models/memeberModel");
const Product = require("../models/Product");
const mongoose = require("mongoose");

/**
 * ReferralService
 * Handles referral link generation and validation for product-wise referrals
 */
class ReferralService {
    /**
     * Generate a referral link for a product
     * @param {String} productId - Product's ObjectId
     * @param {String} referrerId - Referrer's member ObjectId
     * @returns {String} Formatted referral link
     */
    async generateReferralLink(productId, referrerId) {
        try {
            // Validate inputs
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("Invalid product ID");
            }
            if (!mongoose.Types.ObjectId.isValid(referrerId)) {
                throw new Error("Invalid referrer ID");
            }

            // Validate that product exists
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error("Product not found");
            }

            // Validate that referrer exists
            const referrer = await Memeber.findById(referrerId);
            if (!referrer) {
                throw new Error("Referrer not found");
            }

            // Format link as /product/:productId/:referrerId
            const referralLink = `/product/${productId}/${referrerId}`;

            return referralLink;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Validate a referral link
     * @param {String} productId - Product's ObjectId
     * @param {String} referrerId - Referrer's member ObjectId
     * @returns {Object} Validation result with product and referrer details
     */
    async validateReferralLink(productId, referrerId) {
        try {
            // Validate inputs
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return {
                    valid: false,
                    message: "Invalid product ID"
                };
            }
            if (!mongoose.Types.ObjectId.isValid(referrerId)) {
                return {
                    valid: false,
                    message: "Invalid referrer ID"
                };
            }

            // Check if product exists
            const product = await Product.findById(productId);
            if (!product) {
                return {
                    valid: false,
                    message: "Product not found"
                };
            }

            // Check if referrer exists
            const referrer = await Memeber.findById(referrerId);
            if (!referrer) {
                return {
                    valid: false,
                    message: "Referrer not found"
                };
            }

            return {
                valid: true,
                product: product,
                referrer: referrer,
                message: "Valid referral link"
            };
        } catch (error) {
            return {
                valid: false,
                message: error.message
            };
        }
    }

    /**
     * Get referral statistics for a member and product
     * @param {String} memberId - Member's ObjectId
     * @param {String} productId - Product's ObjectId (optional)
     * @returns {Object} Referral statistics
     */
    async getReferralStats(memberId, productId = null) {
        try {
            // Validate member ID
            if (!mongoose.Types.ObjectId.isValid(memberId)) {
                throw new Error("Invalid member ID");
            }

            const member = await Memeber.findById(memberId);
            if (!member) {
                throw new Error("Member not found");
            }

            // If productId is provided, get stats for that product
            if (productId) {
                if (!mongoose.Types.ObjectId.isValid(productId)) {
                    throw new Error("Invalid product ID");
                }

                const productTree = member.productBinaryTrees.find(
                    tree => tree.productId.toString() === productId.toString()
                );

                if (!productTree) {
                    return {
                        productId: productId,
                        directReferrals: 0,
                        totalDownline: 0,
                        totalPurchases: 0,
                        totalSpent: 0
                    };
                }

                return {
                    productId: productId,
                    directReferrals: productTree.directReferrals || 0,
                    totalDownline: productTree.totalDownline || 0,
                    totalPurchases: productTree.totalPurchases || 0,
                    totalSpent: productTree.totalSpent || 0
                };
            }

            // If no productId, return stats for all products
            const allStats = member.productBinaryTrees.map(tree => ({
                productId: tree.productId,
                directReferrals: tree.directReferrals || 0,
                totalDownline: tree.totalDownline || 0,
                totalPurchases: tree.totalPurchases || 0,
                totalSpent: tree.totalSpent || 0
            }));

            return {
                totalProducts: allStats.length,
                products: allStats,
                overallDirectReferrals: allStats.reduce((sum, stat) => sum + stat.directReferrals, 0),
                overallDownline: allStats.reduce((sum, stat) => sum + stat.totalDownline, 0)
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ReferralService();
