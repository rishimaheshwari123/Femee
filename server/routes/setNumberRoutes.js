const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { getUserSetNumbers } = require("../controllers/setNumberCtrl");

router.post("/getUserSetNumbers", auth, getUserSetNumbers);

module.exports = router;
