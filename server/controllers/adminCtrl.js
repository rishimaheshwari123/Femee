const asyncHandler = require("express-async-handler");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Member = require("../models/memeberModel");
const User = require("../models/userModel");
const RatingAndReview = require("../models/RatingandReview");




const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
    let monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let d = new Date();
    let endDate = "";
    d.setDate(1);
    for (let index = 0; index < 11; index++) {
      d.setMonth(d.getMonth() - 1);
      endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
    }
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $lte: new Date(),
            $gte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: {
            month: "$month",
          },
          amount: { $sum: "$totalPriceAfterDiscount" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: data,
    })
  });
  
  const getYearlyTotalOrder = asyncHandler(async (req, res) => {
    let monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let d = new Date();
    let endDate = "";
    d.setDate(1);
    for (let index = 0; index < 11; index++) {
      d.setMonth(d.getMonth() - 1);
      endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
    }
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $lte: new Date(),
            $gte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: 1 },
          amount: { $sum: "$totalPriceAfterDiscount" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: data,
    })
  });


  const getAllOrders = asyncHandler(async (req, res) => {
      try {
      const orders = await Order.find()
        .populate({
          path: 'orderItems.product',
          model: 'Product',
        })
        .sort({ createdAt: -1 }) // Sort by creation date descending (latest first)
        .lean(); // Convert to plain objects
      
      // Manually populate user data from both models
      const User = require("../models/memeberModel");
      const RegularUser = require("../models/userModel");
      
      for (let order of orders) {
        let userData = await User.findById(order.user).lean();
        if (!userData) {
          userData = await RegularUser.findById(order.user).lean();
        }
        if (userData) {
          console.log("User data found:", { 
            id: userData._id, 
            userName: userData.userName, 
            fName: userData.fName, 
            lName: userData.lName, 
            role: userData.role,
            phone: userData.phone
          });
          // Attach user data to order
          order.user = userData;
        } else {
          console.log("No user data found for order:", order._id);
          order.user = null;
        }
      }
      
      res.status(200).json({
        success: true,
        data: orders,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
      throw new Error(error);
    }
  });

  
  const updateOrderStatus = async (req, res) => {
  const { orderId } = req.body;
  const { newStatus } = req.body;

  try {
      const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {orderStatus: newStatus },
          { new: true }
      );

      if (!updatedOrder) {
          return res.status(404).json({ success: false, message: 'Order not found' });
      }
      console.log(updatedOrder)

      res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
};

// Dashboard Stats API
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Count total users (members + regular users)
    const totalMembers = await Member.countDocuments();
    const totalRegularUsers = await User.countDocuments();
    const totalUsers = totalMembers + totalRegularUsers;

    // Count total orders
    const totalOrders = await Order.countDocuments();

    // Count total products
    const totalProducts = await Product.countDocuments();

    // Count pending and completed orders
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    // Calculate total revenue from completed orders
const revenueData = await Order.aggregate([
  { $match: { orderStatus: "Delivered" } },

  {
    $group: {
      _id: null,
      total: {
        $sum: {
          $convert: {
            input: "$totalPrice",
            to: "double",
            onError: 0,
            onNull: 0
          }
        }
      }
    }
  }
]);

const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get reviews data
    const reviewsData = await RatingAndReview.aggregate([
      { $group: { _id: null, count: { $sum: 1 }, avgRating: { $avg: '$rating' } } }
    ]);
    const totalReviews = reviewsData.length > 0 ? reviewsData[0].count : 0;
    const avgRating = reviewsData.length > 0 ? reviewsData[0].avgRating : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue,
        totalProducts,
        pendingOrders,
        completedOrders,
        totalReviews,
        avgRating: avgRating ? avgRating.toFixed(1) : "0.0"
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

  module.exports = {
    getMonthWiseOrderIncome,
    getYearlyTotalOrder,
    getAllOrders,
    updateOrderStatus,
    getDashboardStats
  };