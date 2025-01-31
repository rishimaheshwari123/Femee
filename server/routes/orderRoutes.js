const express = require("express")
const router = express.Router()

const {
    auth,

} = require("../middleware/auth")



const {
    capturePayment,
    paymentVerification,
    getAllOrder,
    createOrder
} = require("../controllers/OrderCtrl")



router.post("/capturePayment", auth, capturePayment)
// router.post("/verifyPayment",auth, paymentVerification)
router.post("/verifyPayment", auth, createOrder)
router.get("/get", auth, getAllOrder)

module.exports = router
