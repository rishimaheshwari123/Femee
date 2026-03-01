const express = require("express")
const { loginMemberCtrl, registerMemberCtrl, getAllMemberCtrl, verifyMemberCtrl, updateTierCtrl, memberProfileCtrl, updateMemberProfileCtrl, deleteMemberCtrl, updatePassword, generatePasswordCtrl, getReferralTreeCtrl, getMemberByUsernameCtrl } = require("../controllers/memeberCtrl")
const { resetPasswordTokenCtrl, resetPasswordCtrl } = require("../controllers/resetPasswordCtrl")
const { getAllProductTrees, getProductTree, getBinaryTreeVisualization, getTransactionHistory } = require("../controllers/dashboardCtrl")
const { getBinaryTreeStructure } = require("../controllers/binaryTreeCtrl")
const router = express.Router()


router.post("/login", loginMemberCtrl)
router.post("/register", registerMemberCtrl)
router.get("/getAll", getAllMemberCtrl)
router.get("/username/:userName", getMemberByUsernameCtrl)
router.put("/verify/:id", verifyMemberCtrl)
router.put("/update/:id", updateTierCtrl)
router.get("/get/:id", memberProfileCtrl);
router.put("/update-profile/:id", updateMemberProfileCtrl)
router.delete("/delete/:id", deleteMemberCtrl)
router.put("/update-password/:id", updatePassword)
router.post("/generate-password/:id", generatePasswordCtrl)
router.post("/reset-password-token", resetPasswordTokenCtrl)
router.post("/reset-password", resetPasswordCtrl)
router.get("/referral-tree/:id", getReferralTreeCtrl)

// Dashboard API endpoints (supports both FLAT and ROOT systems)
router.get("/:memberId/product-trees", getAllProductTrees)
router.get("/:memberId/product-tree/:productId", getProductTree)
router.get("/:memberId/transactions/:productId", getTransactionHistory)

// Binary Tree Visualization API
router.get("/:memberId/binary-tree/:productId", getBinaryTreeStructure)


module.exports = router