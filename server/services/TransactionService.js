const Transaction = require("../models/Transaction");
const Memeber = require("../models/memeberModel");
const mongoose = require("mongoose");

/**
 * TransactionService
 * Handles transaction logging for all types of transactions
 */
class TransactionService {
    /**
     * Log a transaction for a member
     * @param {String} memberId - Member's ObjectId
     * @param {String} productId - Product's ObjectId
     * @param {String} type - Transaction type ('matching_bonus', 'direct_referral', 'withdrawal', 'adjustment')
     * @param {Number} amount - Transaction amount
     * @param {Object} details - Additional transaction details
     * @param {Object} details.matchingDetails - For matching bonus transactions (optional)
     * @param {String} details.description - Transaction description (optional)
     * @param {String} details.orderId - Related order ID (optional)
     * @param {String} details.status - Transaction status (optional, defaults to 'completed')
     * @returns {Object} Created transaction
     */
    async logTransaction(memberId, productId, type, amount, details = {}) {
        try {
            // Validate inputs
            if (!mongoose.Types.ObjectId.isValid(memberId)) {
                throw new Error("Invalid member ID");
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error("Invalid product ID");
            }

            // Validate transaction type
            const validTypes = ['matching_bonus', 'direct_referral', 'withdrawal', 'adjustment'];
            if (!validTypes.includes(type)) {
                throw new Error(`Invalid transaction type: ${type}`);
            }

            // Validate amount
            if (typeof amount !== 'number' || isNaN(amount)) {
                throw new Error("Invalid transaction amount");
            }

            // Find the member to get current wallet balance
            const member = await Memeber.findById(memberId);
            if (!member) {
                throw new Error("Member not found");
            }

            // Calculate balanceBefore and balanceAfter
            const balanceBefore = member.wallet || 0;
            
            // For withdrawals, amount should be negative
            const balanceAfter = type === 'withdrawal' 
                ? balanceBefore - Math.abs(amount)
                : balanceBefore + amount;

            // Create transaction object
            const transactionData = {
                memberId: memberId,
                productId: productId,
                transactionType: type,
                amount: amount,
                description: details.description || `${type.replace('_', ' ')} transaction`,
                status: details.status || 'completed',
                balanceBefore: balanceBefore,
                balanceAfter: balanceAfter
            };

            // Add matching details if provided (for matching bonus transactions)
            if (details.matchingDetails) {
                transactionData.matchingDetails = {
                    leftVolume: details.matchingDetails.leftVolume,
                    rightVolume: details.matchingDetails.rightVolume,
                    matchedVolume: details.matchingDetails.matchedVolume,
                    matchingPercentage: details.matchingDetails.matchingPercentage,
                    carryForwardLeft: details.matchingDetails.carryForwardLeft,
                    carryForwardRight: details.matchingDetails.carryForwardRight
                };
            }

            // Add order reference if provided
            if (details.orderId && mongoose.Types.ObjectId.isValid(details.orderId)) {
                transactionData.orderId = details.orderId;
            }

            // Create and save transaction
            const transaction = new Transaction(transactionData);
            await transaction.save();

            return {
                success: true,
                transaction: transaction,
                balanceBefore: balanceBefore,
                balanceAfter: balanceAfter
            };
        } catch (error) {
            console.error("Error logging transaction:", error);
            throw error;
        }
    }

    /**
     * Get transaction history for a member
     * @param {String} memberId - Member's ObjectId
     * @param {String} productId - Product's ObjectId (optional, filter by product)
     * @param {String} transactionType - Transaction type filter (optional)
     * @param {Object} options - Query options (limit, skip, sort)
     * @returns {Array} Array of transactions
     */
    async getTransactionHistory(memberId, productId = null, transactionType = null, options = {}) {
        try {
            // Validate member ID
            if (!mongoose.Types.ObjectId.isValid(memberId)) {
                throw new Error("Invalid member ID");
            }

            // Build query
            const query = { memberId: memberId };

            // Add product filter if provided
            if (productId && mongoose.Types.ObjectId.isValid(productId)) {
                query.productId = productId;
            }

            // Add transaction type filter if provided
            if (transactionType) {
                query.transactionType = transactionType;
            }

            // Set default options
            const limit = options.limit || 100;
            const skip = options.skip || 0;
            const sort = options.sort || { createdAt: -1 }; // Default: newest first

            // Execute query
            const transactions = await Transaction.find(query)
                .populate('productId', 'title images')
                .sort(sort)
                .limit(limit)
                .skip(skip);

            return transactions;
        } catch (error) {
            console.error("Error getting transaction history:", error);
            throw error;
        }
    }

    /**
     * Get total earnings for a member by product
     * @param {String} memberId - Member's ObjectId
     * @param {String} productId - Product's ObjectId (optional)
     * @returns {Object} Total earnings breakdown
     */
    async getTotalEarnings(memberId, productId = null) {
        try {
            // Validate member ID
            if (!mongoose.Types.ObjectId.isValid(memberId)) {
                throw new Error("Invalid member ID");
            }

            // Build match query
            const matchQuery = { 
                memberId: mongoose.Types.ObjectId(memberId),
                status: 'completed'
            };

            // Add product filter if provided
            if (productId && mongoose.Types.ObjectId.isValid(productId)) {
                matchQuery.productId = mongoose.Types.ObjectId(productId);
            }

            // Aggregate earnings by transaction type
            const earnings = await Transaction.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$transactionType',
                        total: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Calculate total
            const totalEarnings = earnings.reduce((sum, item) => sum + item.total, 0);

            return {
                totalEarnings: totalEarnings,
                breakdown: earnings,
                productId: productId
            };
        } catch (error) {
            console.error("Error calculating total earnings:", error);
            throw error;
        }
    }
}

module.exports = new TransactionService();
