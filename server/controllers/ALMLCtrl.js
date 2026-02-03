/**
 * ALML Controller - Achievement Level-based Member Logic
 * Handles API requests for ALML features
 */

const ALMLService = require("../services/ALMLService");
const asyncHandler = require("express-async-handler");

/**
 * Get achievement chart for a specific ROOT
 * GET /api/v1/alml/:memberId/chart/:productId/:rootNumber
 */
const getAchievementChart = asyncHandler(async (req, res) => {
  try {
    const { memberId, productId, rootNumber } = req.params;

    // Validate user authorization
    if (req.user.id !== memberId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const chart = await ALMLService.getAchievementChart(
      memberId,
      productId,
      parseInt(rootNumber)
    );

    return res.status(200).json({
      success: true,
      data: chart,
      message: "Achievement chart fetched successfully"
    });
  } catch (error) {
    console.error("Error in getAchievementChart:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch achievement chart"
    });
  }
});

/**
 * Get all ROOT achievements for a member-product
 * GET /api/v1/alml/:memberId/all/:productId
 */
const getAllRootAchievements = asyncHandler(async (req, res) => {
  try {
    const { memberId, productId } = req.params;

    // Validate user authorization
    if (req.user.id !== memberId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const achievements = await ALMLService.getAllRootAchievements(memberId, productId);

    return res.status(200).json({
      success: true,
      data: achievements,
      message: "All ROOT achievements fetched successfully"
    });
  } catch (error) {
    console.error("Error in getAllRootAchievements:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch ROOT achievements"
    });
  }
});

/**
 * Claim achievements for a ROOT
 * POST /api/v1/alml/:memberId/claim
 * Body: { productId, rootNumber }
 */
const claimAchievements = asyncHandler(async (req, res) => {
  try {
    const { memberId } = req.params;
    const { productId, rootNumber } = req.body;

    // Validate user authorization
    if (req.user.id !== memberId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only claim your own achievements"
      });
    }

    // Validate input
    if (!productId || !rootNumber) {
      return res.status(400).json({
        success: false,
        message: "Product ID and ROOT number are required"
      });
    }

    const result = await ALMLService.claimAchievements(
      memberId,
      productId,
      parseInt(rootNumber)
    );

    return res.status(200).json({
      success: true,
      data: result,
      message: result.message
    });
  } catch (error) {
    console.error("Error in claimAchievements:", error);
    
    // Handle specific error cases
    let statusCode = 500;
    if (error.message.includes("Cannot claim") || error.message.includes("Already claimed")) {
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to claim achievements"
    });
  }
});

/**
 * Get ALML summary for dashboard
 * GET /api/v1/alml/:memberId/summary
 */
const getALMLSummary = asyncHandler(async (req, res) => {
  try {
    const { memberId } = req.params;

    // Validate user authorization
    if (req.user.id !== memberId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const User = require("../models/memeberModel");
    const member = await User.findById(memberId).populate('productBinaryTrees.productId', 'title images');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    // Calculate summary across all products and ROOTs
    const summary = {
      totalProducts: member.productBinaryTrees.length,
      totalRoots: 0,
      totalClaimableAmount: 0,
      totalClaimedAmount: 0,
      totalPendingAmount: 0,
      claimableRoots: [],
      products: []
    };

    for (const productTree of member.productBinaryTrees) {
      let productClaimable = 0;
      let productClaimed = 0;
      let productPending = 0;
      const claimableRootsForProduct = [];

      for (const root of productTree.roots) {
        summary.totalRoots++;

        if (root.almlSummary) {
          productClaimed += root.almlSummary.totalBonusClaimed || 0;
          productPending += root.almlSummary.totalBonusPending || 0;

          if (root.almlSummary.canClaim) {
            const claimAmount = root.almlSummary.totalBonusAvailable - root.almlSummary.totalBonusClaimed;
            productClaimable += claimAmount;
            claimableRootsForProduct.push({
              rootNumber: root.rootNumber,
              claimAmount: claimAmount
            });
          }
        }
      }

      summary.totalClaimableAmount += productClaimable;
      summary.totalClaimedAmount += productClaimed;
      summary.totalPendingAmount += productPending;

      if (claimableRootsForProduct.length > 0) {
        summary.claimableRoots.push({
          productId: productTree.productId._id,
          productTitle: productTree.productId.title,
          productImage: productTree.productId.images?.[0]?.url,
          roots: claimableRootsForProduct
        });
      }

      summary.products.push({
        productId: productTree.productId._id,
        productTitle: productTree.productId.title,
        totalRoots: productTree.roots.length,
        claimableAmount: productClaimable,
        claimedAmount: productClaimed,
        pendingAmount: productPending
      });
    }

    return res.status(200).json({
      success: true,
      data: summary,
      message: "ALML summary fetched successfully"
    });
  } catch (error) {
    console.error("Error in getALMLSummary:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch ALML summary"
    });
  }
});

module.exports = {
  getAchievementChart,
  getAllRootAchievements,
  claimAchievements,
  getALMLSummary
};
