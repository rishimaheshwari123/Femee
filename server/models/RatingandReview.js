const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Memeber",
	},
	rating: {
		type: Number,
		required: true,
	},
	review: {
		type: String,
		required: true,
	},


},
	{ timestamps: true }
);


module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
