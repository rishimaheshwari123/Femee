const mongoose = require("mongoose");
const Member = require("../models/memeberModel");
const Product = require("../models/Product");

/**
 * Validation middleware for product-wise binary tree operations
 * Validates member IDs, product IDs, and business rules
 */

/**
 * Validate that a member ID exists in the database
 * @param {String} paramName - Name of the parameter to validate (e.g., 'memberId', 'referrerId')
 * @returns {Function} Express middleware function
 */
exports.validateMemberId = (paramName = 'memberId') => {
    return async (req, res, next) => {
        try {
            // Get member ID from params, body, or query
            const memberId = req.params[paramName] || req.body[paramName] || req.query[paramName];

            // Check if member ID is provided
            if (!memberId) {
                return res.status(400).json({
                    success: false,
                    message: `${paramName} is required`
                });
            }

            // Validate MongoDB ObjectId format
            if (!mongoose.Types.ObjectId.isValid(memberId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid ${paramName} format`
                });
            }

            // Check if member exists in database
            const member = await Member.findById(memberId);
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: `Member with ID ${memberId} not found`
                });
            }

            // Attach member to request for later use
            req[paramName + 'Data'] = member;

            next();
        } catch (error) {
            console.error(`Error validating ${paramName}:`, error);
            return res.status(500).json({
                success: false,
                message: `Error validating ${paramName}`,
                error: error.message
            });
        }
    };
};

/**
 * Validate that a product ID exists in the database
 * @param {String} paramName - Name of the parameter to validate (default: 'productId')
 * @returns {Function} Express middleware function
 */
exports.validateProductId = (paramName = 'productId') => {
    return async (req, res, next) => {
        try {
            // Get product ID from params, body, or query
            const productId = req.params[paramName] || req.body[paramName] || req.query[paramName];

            // Check if product ID is provided
            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: `${paramName} is required`
                });
            }

            // Validate MongoDB ObjectId format
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid ${paramName} format`
                });
            }

            // Check if product exists in database
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${productId} not found`
                });
            }

            // Attach product to request for later use
            req[paramName + 'Data'] = product;

            next();
        } catch (error) {
            console.error(`Error validating ${paramName}:`, error);
            return res.status(500).json({
                success: false,
                message: `Error validating ${paramName}`,
                error: error.message
            });
        }
    };
};

/**
 * Validate that referrer is not the same as buyer (prevent self-referral)
 * @returns {Function} Express middleware function
 */
exports.validateNoSelfReferral = () => {
    return async (req, res, next) => {
        try {
            const { referrerId, userId } = req.body;

            // If no referrer provided, skip validation (direct purchase)
            if (!referrerId) {
                return next();
            }

            // Validate both IDs are provided
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId is required when referrerId is provided'
                });
            }

            // Check if referrer and buyer are the same
            if (referrerId.toString() === userId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Self-referral is not allowed. Referrer cannot be the same as buyer.'
                });
            }

            next();
        } catch (error) {
            console.error('Error validating self-referral:', error);
            return res.status(500).json({
                success: false,
                message: 'Error validating referral',
                error: error.message
            });
        }
    };
};

/**
 * Validate multiple member IDs exist (for batch operations)
 * @param {String} paramName - Name of the array parameter containing member IDs
 * @returns {Function} Express middleware function
 */
exports.validateMultipleMemberIds = (paramName = 'memberIds') => {
    return async (req, res, next) => {
        try {
            const memberIds = req.body[paramName] || req.query[paramName];

            // Check if member IDs array is provided
            if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `${paramName} must be a non-empty array`
                });
            }

            // Validate each member ID format
            const invalidIds = memberIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
            if (invalidIds.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid member ID format: ${invalidIds.join(', ')}`
                });
            }

            // Check if all members exist
            const members = await Member.find({ _id: { $in: memberIds } });
            if (members.length !== memberIds.length) {
                const foundIds = members.map(m => m._id.toString());
                const notFoundIds = memberIds.filter(id => !foundIds.includes(id.toString()));
                return res.status(404).json({
                    success: false,
                    message: `Members not found: ${notFoundIds.join(', ')}`
                });
            }

            // Attach members to request
            req[paramName + 'Data'] = members;

            next();
        } catch (error) {
            console.error(`Error validating ${paramName}:`, error);
            return res.status(500).json({
                success: false,
                message: `Error validating ${paramName}`,
                error: error.message
            });
        }
    };
};

/**
 * Validate product array in order (for multi-product orders)
 * @returns {Function} Express middleware function
 */
exports.validateProductsInOrder = () => {
    return async (req, res, next) => {
        try {
            const { products } = req.body;

            // Check if products array is provided
            if (!products || !Array.isArray(products) || products.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Products array is required and must not be empty'
                });
            }

            // Validate each product in the array
            const productIds = products.map(item => item.product);
            const invalidIds = productIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
            
            if (invalidIds.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid product ID format in order`
                });
            }

            // Check if all products exist
            const foundProducts = await Product.find({ _id: { $in: productIds } });
            if (foundProducts.length !== productIds.length) {
                const foundIds = foundProducts.map(p => p._id.toString());
                const notFoundIds = productIds.filter(id => !foundIds.includes(id.toString()));
                return res.status(404).json({
                    success: false,
                    message: `Products not found: ${notFoundIds.join(', ')}`
                });
            }

            // Attach products data to request
            req.productsData = foundProducts;

            next();
        } catch (error) {
            console.error('Error validating products in order:', error);
            return res.status(500).json({
                success: false,
                message: 'Error validating products',
                error: error.message
            });
        }
    };
};

/**
 * Validate that a member has an active product tree for a specific product
 * @returns {Function} Express middleware function
 */
exports.validateProductTreeExists = () => {
    return async (req, res, next) => {
        try {
            const memberId = req.params.memberId || req.body.memberId;
            const productId = req.params.productId || req.body.productId;

            if (!memberId || !productId) {
                return res.status(400).json({
                    success: false,
                    message: 'Both memberId and productId are required'
                });
            }

            const member = await Member.findById(memberId);
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            const productTree = member.productBinaryTrees.find(
                tree => tree.productId.toString() === productId.toString()
            );

            if (!productTree) {
                return res.status(404).json({
                    success: false,
                    message: 'Product tree not found for this member and product combination'
                });
            }

            // Attach product tree to request
            req.productTree = productTree;

            next();
        } catch (error) {
            console.error('Error validating product tree:', error);
            return res.status(500).json({
                success: false,
                message: 'Error validating product tree',
                error: error.message
            });
        }
    };
};
