const express = require("express");
const router = express.Router();
const Memeber = require("../models/memeberModel");
const Order = require("../models/Order");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

// Helper function to get hierarchy up to 5 levels
const getHierarchyWithOrders = async (memberId) => {
  // Use `new ObjectId` for ObjectId instantiation
  const result = await Memeber.aggregate([
    { $match: { _id: new ObjectId(memberId) } }, // Changed here
    { $lookup: { from: "memebers", localField: "child", foreignField: "_id", as: "level1Children" } },
    { $lookup: { from: "memebers", localField: "level1Children.child", foreignField: "_id", as: "level2Children" } },
    { $lookup: { from: "memebers", localField: "level2Children.child", foreignField: "_id", as: "level3Children" } },
    { $lookup: { from: "memebers", localField: "level3Children.child", foreignField: "_id", as: "level4Children" } },
    { $lookup: { from: "memebers", localField: "level4Children.child", foreignField: "_id", as: "level5Children" } },
    {
      $project: {
        allChildren: {
          $concatArrays: [
            "$level1Children",
            "$level2Children",
            "$level3Children",
            "$level4Children",
            "$level5Children",
          ],
        },
      },
    },
  ]);

  const allMemberIds = [
    memberId,
    ...(result[0]?.allChildren.map((child) => child._id.toString()) || []),
  ];

  return allMemberIds;
};


// Route to get all orders for a member's hierarchy
router.get("/orders/:memberId", async (req, res) => {
  const { memberId } = req.params;

  try {
    // Get hierarchy of member IDs
    const allMemberIds = await getHierarchyWithOrders(memberId);

    // Fetch orders for these members
    const orders = await Order.find({ user: { $in: allMemberIds } }).populate(
      "user",
      "fName lName userName"
    );

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching orders for the member hierarchy.",
      error: error.message,
    });
  }
});

module.exports = router;
