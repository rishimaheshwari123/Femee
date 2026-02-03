/**
 * ALML Routes - Achievement Level-based Member Logic
 */

const express = require("express");
const router = express.Router();
const { auth, isMember } = require("../middleware/auth");
const {
  getAchievementChart,
  getAllRootAchievements,
  claimAchievements,
  getALMLSummary
} = require("../controllers/ALMLCtrl");

// Get achievement chart for specific ROOT
router.get("/:memberId/chart/:productId/:rootNumber", auth, isMember, getAchievementChart);

// Get all ROOT achievements for a product
router.get("/:memberId/all/:productId", auth, isMember, getAllRootAchievements);

// Claim achievements
router.post("/:memberId/claim", auth, isMember, claimAchievements);

// Get ALML summary for dashboard
router.get("/:memberId/summary", auth, isMember, getALMLSummary);

module.exports = router;
