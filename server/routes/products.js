const express = require("express");
const router = express.Router();

const { auth,   } = require("../middleware/auth");


const {
  createProduct,
  getAllProduct,
  getProductDetails,
  deleteProduct,
  updateProduct,
  getDashboardStats
} = require("../controllers/productCtrl");


const {
  getAllOrders,
  updateOrderStatus
} = require("../controllers/adminCtrl")


router.post("/create",auth, createProduct);
router.post("/update",auth, updateProduct);
router.post("/delete",auth, deleteProduct);
router.post("/getProductDetails", getProductDetails);
router.get("/all-product", getAllProduct);


//admin
router.get("/adminGetOrder",auth, getAllOrders);
router.post("/updateOrder",auth, updateOrderStatus);
router.get("/dashboard-stats",auth, getDashboardStats);

// export all router
module.exports = router;
