const ReferralService = require("../services/ReferralService");

/**
 * Generate a referral link for a product
 * @route POST /api/referral/generate
 * @access Private (requires authentication)
 */
exports.generateReferralLink = async (req, res) => {
    try {
        const { productId, referrerId } = req.body;

        // Validate required fields
        if (!productId || !referrerId) {
            return res.status(400).json({
                success: false,
                message: "Product ID and Referrer ID are required"
            });
        }

        // Generate referral link
        const referralLink = await ReferralService.generateReferralLink(productId, referrerId);

        // Return the full URL (you can customize the base URL based on environment)
        const baseUrl = process.env.FRONTEND_URL || "https://www.femmecurehelpingher.com";
        const fullReferralUrl = `${baseUrl}${referralLink}`;

        return res.status(200).json({
            success: true,
            message: "Referral link generated successfully",
            data: {
                referralLink: referralLink,
                fullUrl: fullReferralUrl,
                productId: productId,
                referrerId: referrerId
            }
        });
    } catch (error) {
        console.error("Error generating referral link:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate referral link"
        });
    }
};

/**
 * Validate a referral link
 * @route POST /api/referral/validate
 * @access Public
 */
exports.validateReferralLink = async (req, res) => {
    try {
        const { productId, referrerId } = req.body;

        // Validate required fields
        if (!productId || !referrerId) {
            return res.status(400).json({
                success: false,
                message: "Product ID and Referrer ID are required"
            });
        }

        // Validate referral link
        const validation = await ReferralService.validateReferralLink(productId, referrerId);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        return res.status(200).json({
            success: true,
            message: validation.message,
            data: {
                product: {
                    _id: validation.product._id,
                    title: validation.product.title,
                    price: validation.product.price,
                    images: validation.product.images
                },
                referrer: {
                    _id: validation.referrer._id,
                    fName: validation.referrer.fName,
                    lName: validation.referrer.lName,
                    userName: validation.referrer.userName
                }
            }
        });
    } catch (error) {
        console.error("Error validating referral link:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to validate referral link"
        });
    }
};

/**
 * Get referral statistics for a member
 * @route GET /api/referral/stats/:memberId
 * @access Private
 */
exports.getReferralStats = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { productId } = req.query;

        if (!memberId) {
            return res.status(400).json({
                success: false,
                message: "Member ID is required"
            });
        }

        // Get referral stats
        const stats = await ReferralService.getReferralStats(memberId, productId);

        return res.status(200).json({
            success: true,
            message: "Referral statistics retrieved successfully",
            data: stats
        });
    } catch (error) {
        console.error("Error getting referral stats:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to get referral statistics"
        });
    }
};
