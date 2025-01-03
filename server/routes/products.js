const express = require("express");
const router = express.Router();

const { auth,   } = require("../middleware/auth");


const {
  createProduct,
  getAllProduct,
  getProductDetails,
  deleteProduct
} = require("../controllers/productCtrl");


const {
  getAllOrders,
  updateOrderStatus
} = require("../controllers/adminCtrl")


router.post("/create",auth, createProduct);
router.post("/delete",auth, deleteProduct);
router.post("/getProductDetails", getProductDetails);
router.get("/all-product", getAllProduct);


//admin
router.get("/adminGetOrder",auth, getAllOrders);
router.post("/updateOrder",auth, updateOrderStatus);

// export all router
module.exports = router;
