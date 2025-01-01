const express = require("express")
const { loginMemberCtrl, registerMemberCtrl, getAllMemberCtrl, verifyMemberCtrl, updateTierCtrl, memberProfileCtrl, updateMemberProfileCtrl } = require("../controllers/memeberCtrl")
const router = express.Router()


router.post("/login", loginMemberCtrl)
router.post("/register", registerMemberCtrl)
router.get("/getAll", getAllMemberCtrl)
router.put("/verify/:id", verifyMemberCtrl)
router.put("/update/:id", updateTierCtrl)
router.get("/get/:id", memberProfileCtrl);
router.put("/update-profile/:id", updateMemberProfileCtrl)



module.exports = router