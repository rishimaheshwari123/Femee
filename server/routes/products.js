const express = require("express");
const router = express.Router();

const { auth,   } = require("../middleware/auth");


const {
  createProduct,
  getAllProduct,
  getProductDetails,
  deleteProduct,
  updateProduct,
  getDashboardStats,
  setProductRoot,
  updateCommissionRates
} = require("../controllers/productCtrl");

const { getBinaryTreeVisualization } = require("../controllers/dashboardCtrl");


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
router.post("/:productId/set-root", auth, setProductRoot);
router.put("/:productId/commission-rates", auth, updateCommissionRates);

// Binary tree visualization
router.get("/:productId/binary-tree/:memberId", getBinaryTreeVisualization);

// export all router
module.exports = router;
