const asyncHandler = require("express-async-handler");

const Order = require("../models/Order")




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
      const orders = await Order.find().populate("user").populate({
        path: 'orderItems.product',
        model: 'Product',
    });
      // .populate("orderItems.product")
      // .populate("orderItems.color");
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

  module.exports = {
    getMonthWiseOrderIncome,
    getYearlyTotalOrder,
    getAllOrders,
    updateOrderStatus
  };