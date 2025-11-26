const PairRequest = require("../models/PairRequest");
const Memeber = require("../models/memeberModel");
const { uploadImageToCloudinary } = require("../config/imageUploader");
const {
    calculateLeftRightReferrals,
    calculateCompletedPairs,
    getPairReward,
    checkPairEligibility,
} = require("../utils/pairLogic");

/**
 * MEMBER API: Submit a pair request
 * POST /api/v1/pair/submit
 * Auth Required: member role
 */
exports.submitPairRequest = async (req, res) => {
    try {
        const { pairNumber } = req.body;
        const memberId = req.user.id;

        // Validate pair number
        if (!pairNumber || pairNumber < 1 || pairNumber > 4) {
            return res.status(400).json({
                success: false,
                message: "Pair number must be between 1 and 4",
            });
        }

        // Check if member exists
        const member = await Memeber.findById(memberId);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
            });
        }

        // Check if member is active
        if (!member.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is not active. Please contact admin.",
            });
        }

        // Check if member is eligible for this pair
        const isEligible = await checkPairEligibility(memberId, pairNumber);
        if (!isEligible) {
            return res.status(400).json({
                success: false,
                message: `You are not eligible for Pair ${pairNumber}. Complete required referrals first.`,
            });
        }

        // Check if pair request already exists
        const existingRequest = await PairRequest.findOne({
            member: memberId,
            pairNumber: pairNumber,
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: `You have already submitted a request for Pair ${pairNumber}`,
                existingRequest,
            });
        }

        // Create new pair request
        const pairRequest = await PairRequest.create({
            member: memberId,
            pairNumber: pairNumber,
            status: "pending",
        });

        const populatedRequest = await PairRequest.findById(pairRequest._id).populate(
            "member",
            "fName lName userName email phone"
        );

        return res.status(201).json({
            success: true,
            message: `Pair ${pairNumber} request submitted successfully`,
            data: populatedRequest,
            reward: getPairReward(pairNumber),
        });
    } catch (error) {
        console.error("Error in submitPairRequest:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted this pair request",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to submit pair request",
            error: error.message,
        });
    }
};

/**
 * MEMBER API: Get my pair requests
 * GET /api/v1/pair/my-requests
 * Auth Required: member role
 */
exports.getMyPairRequests = async (req, res) => {
    try {
        const memberId = req.user.id;

        // Get all pair requests for this member
        const pairRequests = await PairRequest.find({ member: memberId })
            .sort({ pairNumber: 1 })
            .populate("member", "fName lName userName email phone");

        // Calculate referral stats
        const referralStats = await calculateLeftRightReferrals(memberId);
        const completedPairs = calculateCompletedPairs(
            referralStats.leftCount,
            referralStats.rightCount
        );

        // Build pair status array
        const pairStatus = [];
        for (let i = 1; i <= 4; i++) {
            const request = pairRequests.find((req) => req.pairNumber === i);
            pairStatus.push({
                pairNumber: i,
                reward: getPairReward(i),
                isEligible: completedPairs >= i,
                status: request ? request.status : "not_submitted",
                request: request || null,
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                pairRequests,
                pairStatus,
                referralStats: {
                    leftCount: referralStats.leftCount,
                    rightCount: referralStats.rightCount,
                    completedPairs,
                },
            },
        });
    } catch (error) {
        console.error("Error in getMyPairRequests:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pair requests",
            error: error.message,
        });
    }
};

/**
 * MEMBER API: Get dashboard stats
 * GET /api/v1/pair/dashboard
 * Auth Required: member role
 */
exports.getMemberDashboard = async (req, res) => {
    try {
        const memberId = req.user.id;

        // Get member details
        const member = await Memeber.findById(memberId).populate("child parent");

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
            });
        }

        // Calculate referral stats
        const referralStats = await calculateLeftRightReferrals(memberId);
        const completedPairs = calculateCompletedPairs(
            referralStats.leftCount,
            referralStats.rightCount
        );

        // Get pair requests
        const pairRequests = await PairRequest.find({ member: memberId }).sort({
            pairNumber: 1,
        });

        // Build pair unlock status
        const pairUnlockStatus = [];
        for (let i = 1; i <= 4; i++) {
            const request = pairRequests.find((req) => req.pairNumber === i);
            pairUnlockStatus.push({
                pairNumber: i,
                reward: getPairReward(i),
                isUnlocked: completedPairs >= i,
                status: request ? request.status : "not_submitted",
                canSubmit: completedPairs >= i && !request,
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                member: {
                    id: member._id,
                    name: `${member.fName} ${member.lName}`,
                    userName: member.userName,
                    email: member.email,
                    tier: member.tier,
                    isActive: member.isActive,
                },
                referrals: {
                    totalLeft: referralStats.leftCount,
                    totalRight: referralStats.rightCount,
                    completedPairs,
                },
                pairUnlockStatus,
                pairRequests: pairRequests.map((req) => ({
                    pairNumber: req.pairNumber,
                    status: req.status,
                    submittedDate: req.createdAt,
                    adminNotes: req.adminNotes,
                    adminProof: req.adminProof,
                })),
            },
        });
    } catch (error) {
        console.error("Error in getMemberDashboard:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};

/**
 * ADMIN API: Get all pair requests
 * GET /api/v1/pair/admin/all
 * Auth Required: admin role
 */
exports.getAllPairRequests = async (req, res) => {
    try {
        const { status, pairNumber, page = 1, limit = 20 } = req.query;

        // Build filter
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (pairNumber) {
            filter.pairNumber = parseInt(pairNumber);
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get pair requests with pagination
        const pairRequests = await PairRequest.find(filter)
            .populate("member", "fName lName userName email phone tier isActive")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const totalCount = await PairRequest.countDocuments(filter);

        // Get statistics
        const stats = await PairRequest.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const statistics = {
            total: totalCount,
            pending: stats.find((s) => s._id === "pending")?.count || 0,
            approved: stats.find((s) => s._id === "approved")?.count || 0,
            rejected: stats.find((s) => s._id === "rejected")?.count || 0,
        };

        return res.status(200).json({
            success: true,
            data: {
                pairRequests,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalRecords: totalCount,
                    limit: parseInt(limit),
                },
                statistics,
            },
        });
    } catch (error) {
        console.error("Error in getAllPairRequests:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pair requests",
            error: error.message,
        });
    }
};

/**
 * ADMIN API: Approve pair request
 * POST /api/v1/pair/admin/approve/:id
 * Auth Required: admin role
 */
exports.approvePairRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        // Check if pair request exists
        const pairRequest = await PairRequest.findById(id).populate(
            "member",
            "fName lName userName email"
        );

        if (!pairRequest) {
            return res.status(404).json({
                success: false,
                message: "Pair request not found",
            });
        }

        // Check if already processed
        if (pairRequest.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `This request has already been ${pairRequest.status}`,
            });
        }

        // Handle proof image upload
        let adminProof = null;
        if (req.files && req.files.proof) {
            const proofFile = req.files.proof;

            // Validate file type
            const supportedTypes = ["jpg", "jpeg", "png", "gif"];
            const fileType = proofFile.name.split(".").pop().toLowerCase();

            if (!supportedTypes.includes(fileType)) {
                return res.status(400).json({
                    success: false,
                    message: "File format not supported. Please upload jpg, jpeg, png, or gif",
                });
            }

            // Upload to Cloudinary
            const uploadedImage = await uploadImageToCloudinary(
                proofFile,
                "pair_proofs",
                1000,
                80
            );

            adminProof = {
                public_id: uploadedImage.public_id,
                url: uploadedImage.secure_url,
            };
        }

        // Update pair request
        pairRequest.status = "approved";
        pairRequest.adminNotes = notes || "Approved";
        if (adminProof) {
            pairRequest.adminProof = adminProof;
        }

        await pairRequest.save();

        return res.status(200).json({
            success: true,
            message: `Pair ${pairRequest.pairNumber} request approved successfully`,
            data: pairRequest,
        });
    } catch (error) {
        console.error("Error in approvePairRequest:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to approve pair request",
            error: error.message,
        });
    }
};

/**
 * ADMIN API: Reject pair request
 * POST /api/v1/pair/admin/reject/:id
 * Auth Required: admin role
 */
exports.rejectPairRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        // Validate notes
        if (!notes || notes.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Please provide rejection notes",
            });
        }

        // Check if pair request exists
        const pairRequest = await PairRequest.findById(id).populate(
            "member",
            "fName lName userName email"
        );

        if (!pairRequest) {
            return res.status(404).json({
                success: false,
                message: "Pair request not found",
            });
        }

        // Check if already processed
        if (pairRequest.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `This request has already been ${pairRequest.status}`,
            });
        }

        // Update pair request
        pairRequest.status = "rejected";
        pairRequest.adminNotes = notes;

        await pairRequest.save();

        return res.status(200).json({
            success: true,
            message: `Pair ${pairRequest.pairNumber} request rejected`,
            data: pairRequest,
        });
    } catch (error) {
        console.error("Error in rejectPairRequest:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject pair request",
            error: error.message,
        });
    }
};

/**
 * ADMIN API: Get single pair request details
 * GET /api/v1/pair/admin/:id
 * Auth Required: admin role
 */
exports.getPairRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const pairRequest = await PairRequest.findById(id).populate(
            "member",
            "fName lName userName email phone tier isActive child parent"
        );

        if (!pairRequest) {
            return res.status(404).json({
                success: false,
                message: "Pair request not found",
            });
        }

        // Get member's referral stats
        const referralStats = await calculateLeftRightReferrals(pairRequest.member._id);
        const completedPairs = calculateCompletedPairs(
            referralStats.leftCount,
            referralStats.rightCount
        );

        return res.status(200).json({
            success: true,
            data: {
                pairRequest,
                memberStats: {
                    leftReferrals: referralStats.leftCount,
                    rightReferrals: referralStats.rightCount,
                    completedPairs,
                },
            },
        });
    } catch (error) {
        console.error("Error in getPairRequestById:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pair request details",
            error: error.message,
        });
    }
};
