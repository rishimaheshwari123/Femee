const express = require("express");
const router = express.Router();

// Import controllers
const {
    submitPairRequest,
    getMyPairRequests,
    getMemberDashboard,
    getAllPairRequests,
    approvePairRequest,
    rejectPairRequest,
    getPairRequestById,
} = require("../controllers/pairController");

// Import middleware
const { auth, isMember, isadmin } = require("../middleware/auth");

// ============================================
// MEMBER ROUTES (Auth Required: role = member)
// ============================================

/**
 * @route   POST /api/v1/pair/submit
 * @desc    Submit a pair request
 * @access  Private (Member only)
 * @body    { pairNumber: 1-4 }
 */
router.post("/submit", auth, isMember, submitPairRequest);

/**
 * @route   GET /api/v1/pair/my-requests
 * @desc    Get all pair requests for logged-in member
 * @access  Private (Member only)
 */
router.get("/my-requests", auth, isMember, getMyPairRequests);

/**
 * @route   GET /api/v1/pair/dashboard
 * @desc    Get member dashboard with referral stats and pair status
 * @access  Private (Member only)
 */
router.get("/dashboard", auth, isMember, getMemberDashboard);

// ============================================
// ADMIN ROUTES (Auth Required: role = admin)
// ============================================

/**
 * @route   GET /api/v1/pair/admin/all
 * @desc    Get all pair requests with filters and pagination
 * @access  Private (Admin only)
 * @query   status, pairNumber, page, limit
 */
router.get("/admin/all", auth, isadmin, getAllPairRequests);

/**
 * @route   GET /api/v1/pair/admin/:id
 * @desc    Get single pair request details
 * @access  Private (Admin only)
 */
router.get("/admin/:id", auth, isadmin, getPairRequestById);

/**
 * @route   POST /api/v1/pair/admin/approve/:id
 * @desc    Approve a pair request with proof upload
 * @access  Private (Admin only)
 * @body    form-data: { proof: file, notes: string }
 */
router.post("/admin/approve/:id", auth, isadmin, approvePairRequest);

/**
 * @route   POST /api/v1/pair/admin/reject/:id
 * @desc    Reject a pair request
 * @access  Private (Admin only)
 * @body    { notes: string }
 */
router.post("/admin/reject/:id", auth, isadmin, rejectPairRequest);

module.exports = router;
