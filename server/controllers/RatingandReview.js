const RatingAndReview = require("../models/RatingandReview");
const mongoose = require("mongoose");

// Create a new rating and review
exports.createRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, review } = req.body;

    let ratingReview;

    ratingReview = await RatingAndReview.create({
      rating,
      review,
      user: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Rating and review created successfully",
      ratingReview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};





// exports.checkUserRating = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     let alreadyReviewed;


//     alreadyReviewed = await RatingAndReview.findOne({
//       user: userId,
//     });


//     if (alreadyReviewed) {
//       return res.status(200).json({
//         success: true,
//         message: "User has already reviewed",
//         alreadyReviewed,
//         hasReviewed: true,
//       });
//     } else {
//       return res.status(200).json({
//         success: true,
//         hasReviewed: false,
//         message: "User has not reviewed yet",
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,

//     });
//   }
// };

// ;


// Get all rating and reviews
exports.getAllRatingReview = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({}).populate("user").exec();
    res.status(200).json({
      success: true,
      allReviews,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve the rating and review for the course",
      error: error.message,
    });
  }
};
