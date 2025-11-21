const Product = require("../models/Product");
const validateMongoDbId = require("../utils/validateMongoDbId");

// Controller to create a new product
exports.createProduct = async (req, res) => {
  try {
    // Extracting data from the request body
    const { title, description, price, highPrice, sizes, slug, metaTitle, metaDescription, keywords, tags } = req.body;

    const imagesArray = JSON.parse(req.body.images);

    if (
      !title ||
      !description ||
      !price ||
      !sizes ||
      !imagesArray
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      });
    }

    // Creating a new product object
    const newProduct = await Product.create({
      title,
      description,
      price,
      highPrice,
      sizes,
      images: imagesArray,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      tags,
    });

    res.status(200).json({
      success: true,
      newProduct,
      message: "Product Created Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    const allProduct = await Product.find();
    res.status(200).json({
      success: true,
      allProduct,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const { productID } = req.body;
    validateMongoDbId(productID);
    const productDetails = await Product.findOne({
      _id: productID,
    });
    // .populate("ratingAndReviews").exec()

    if (!productDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${productID}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        productDetails,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id, title, description, price, highPrice, sizes, slug, metaTitle, metaDescription, keywords, tags } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    validateMongoDbId(id);

    const imagesArray = req.body.images ? JSON.parse(req.body.images) : undefined;

    const updateData = {
      title,
      description,
      price,
      highPrice,
      sizes,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      tags,
    };

    if (imagesArray) {
      updateData.images = imagesArray;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: "Product Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {

    const { id } = req.body;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete product",
        error: error.message,
      });
  }
};

// Dashboard Stats API
exports.getDashboardStats = async (req, res) => {
  try {
    const Order = require("../models/Order");
    const Member = require("../models/memeberModel");

    // Get total users
    const totalUsers = await Member.countDocuments();

    // Get all orders
    const allOrders = await Order.find();
    const totalOrders = allOrders.length;

    // Calculate total revenue
const totalRevenue = allOrders.reduce((sum, order) => {
  const price = parseFloat(order.totalPrice) || 0; // force number
  return sum + price;
}, 0);

    // Get pending and completed orders
    const pendingOrders = allOrders.filter(order => order.orderStatus === "Processing").length;
    const completedOrders = allOrders.filter(order => order.orderStatus === "Delivered").length;

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get recent activity (last 10 orders)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "fName lName")
      .populate("orderItems.product", "title");

    const recentActivity = recentOrders.map(order => ({
      action: `New order by ${order.user?.fName} ${order.user?.lName}`,
      time: getTimeAgo(order.createdAt),
      type: "order"
    }));

    // Get total reviews (if you have reviews model)
    const totalReviews = 0; // Update this when you have reviews
    const avgRating = 4.8; // Update this when you have reviews

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue,
        totalProducts,
        pendingOrders,
        completedOrders,
        totalReviews,
        avgRating,
        recentActivity
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

// Helper function to calculate time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
