import React, { useEffect, useState } from "react";
import Slider from "../components/comman/Slider";
import WhyUs from "../components/core/Home/WhyUs";
import KnowAboutUs from "../components/comman/KnowAboutUs";
import ReviewRating from "../components/core/Home/ReviewRating";
import { useSelector } from "react-redux";
import ReactStars from "react-rating-stars-component";
import { getAllReatingAPI } from "../services/operations/user";
import ReviewsSection from "../components/comman/AllRating";
import Details from "../components/comman/Details";

const Home = () => {
  const [reviewModal, setReviewModal] = useState(false);
  const { token, user } = useSelector((state) => state.auth);
  const [allRatings, setAllRatings] = useState([]);

  const fetchRatings = async () => {
    try {
      const response = await getAllReatingAPI();
      setAllRatings(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleAddRating = () => {
    if (token) {
      setReviewModal(true);
    }
  };

  return (
    <div>
      <Slider />
      <br />
      <KnowAboutUs />

      <Details />
      <br />
      <br />
      <WhyUs />

      <br />
      {allRatings.length > 0 && <ReviewsSection allRatings={allRatings} />}
      <br />

      {["member", "admin"].includes(user?.role) && (
        <div className="max-w-7xl mx-auto p-4 flex justify-center">
          <button
            onClick={handleAddRating}
            className="bg-yellow-600 px-4 py-2 text-white rounded-lg"
          >
            Add Rating
          </button>
        </div>
      )}
      {reviewModal && <ReviewRating setReviewModal={setReviewModal} />}
    </div>
  );
};

export default Home;
