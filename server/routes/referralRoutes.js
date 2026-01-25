const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

const {
    generateReferralLink,
    validateReferralLink,
    getReferralStats
} = require("../controllers/referralCtrl");

// Generate referral link (requires authentication)
router.post("/generate", auth, generateReferralLink);

// Validate referral link (public endpoint)
router.post("/validate", validateReferralLink);

// Get referral statistics (requires authentication)
router.get("/stats/:memberId", auth, getReferralStats);

module.exports = router;
