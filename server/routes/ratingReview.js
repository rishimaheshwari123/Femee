const express = require("express");
const {
    createRating,

    getAllRatingReview
} = require("../controllers/RatingandReview");
const { auth, isMember } = require("../middleware/auth");
const router = express.Router();


router.post("/create", auth, isMember, createRating);

router.get("/getAll", getAllRatingReview);





module.exports = router;


