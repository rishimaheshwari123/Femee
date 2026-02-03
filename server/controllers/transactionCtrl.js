const Transaction = require("../models/Transaction");
const asyncHandler = require("express-async-handler");

/**
 * Get all transactions with filters
 * GET /api/v1/product/transactions
 * Query params: transactionType, limit, page
 */
exports.getAllTransactions = asyncHandler(async (req, res) => {
  try {
    const { transactionType, limit = 10, page = 1 } = req.query;

    // Build filter
    const filter = {};
    if (transactionType) {
      filter.transactionType = transactionType;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions with populated member and product details
    const transactions = await Transaction.find(filter)
      .populate("memberId", "fName lName userName email")
      .populate("productId", "title images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalCount = await Transaction.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalRecords: totalCount,
        limit: parseInt(limit),
      },
      message: "Transactions fetched successfully",
    });
  } catch (error) {
    console.error("Error in getAllTransactions:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch transactions",
    });
  }
});

/**
 * Get transaction statistics
 * GET /api/v1/product/transactions/stats
 */
exports.getTransactionStats = asyncHandler(async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: "$transactionType",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const formattedStats = {
      total: 0,
      totalAmount: 0,
      byType: {},
    };

    stats.forEach((stat) => {
      formattedStats.total += stat.count;
      formattedStats.totalAmount += stat.totalAmount;
      formattedStats.byType[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedStats,
      message: "Transaction statistics fetched successfully",
    });
  } catch (error) {
    console.error("Error in getTransactionStats:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch transaction statistics",
    });
  }
});
