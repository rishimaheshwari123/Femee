const asyncHandler = require("express-async-handler");
const User = require("../models/memeberModel");
const Product = require("../models/Product");

// Get user's set numbers for products in cart
const getUserSetNumbers = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { productIds } = req.body; // Array of product IDs from cart

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: "Product IDs array is required"
      });
    }

    // Find user with set numbers
    const user = await User.findById(userId).select('productSetNumbers');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get product details to check which have "SET" in title
    const products = await Product.find({ _id: { $in: productIds } }).select('title _id');
    
    // Build response with set numbers
    const setNumbersData = {};
    
    for (const product of products) {
      // Check if product title contains "SET" (case insensitive)
      const isSetProduct = /SET/i.test(product.title);
      
      if (isSetProduct) {
        // Find existing set number for this product
        const existingSet = user.productSetNumbers?.find(
          ps => ps.productId.toString() === product._id.toString()
        );
        
        setNumbersData[product._id.toString()] = {
          productTitle: product.title,
          isSetProduct: true,
          currentSetNumber: existingSet ? existingSet.setNumber : null,
          nextSetNumber: existingSet ? existingSet.setNumber + 1 : 1
        };
      } else {
        setNumbersData[product._id.toString()] = {
          productTitle: product.title,
          isSetProduct: false,
          currentSetNumber: null,
          nextSetNumber: null
        };
      }
    }

    return res.status(200).json({
      success: true,
      data: setNumbersData
    });

  } catch (error) {
    console.error("Error fetching set numbers:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching set numbers"
    });
  }
});

module.exports = {
  getUserSetNumbers
};
