const express = require("express")
const { loginMemberCtrl, registerMemberCtrl } = require("../controllers/memeberCtrl")
const router = express.Router()


router.post("/login", loginMemberCtrl)
router.post("/register", registerMemberCtrl)



module.exports = router