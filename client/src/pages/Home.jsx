import React, { useEffect, useState } from "react";
import Slider from "../components/comman/Slider";
import WhyUs from "../components/core/Home/WhyUs";
import KnowAboutUs from "../components/comman/KnowAboutUs";
import ReviewRating from "../components/core/Home/ReviewRating";
import { useSelector } from "react-redux";
import ReactStars from "react-rating-stars-component";
import { getAllReatingAPI } from "../services/operations/user";

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
      <WhyUs />
      <KnowAboutUs />

      {/* Add Rating Button */}
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

      <div className="max-w-7xl mx-auto p-4">
        <h3 className="text-center text-xl mb-4">All Reviews and Ratings</h3>
        {allRatings.length > 0 ? (
          allRatings.map((rating, index) => (
            <div
              key={index}
              className="p-4 bg-white shadow-md rounded-lg mb-4 flex items-start space-x-4"
            >
              <img
                src={rating.user?.images[0]?.url || "/default-avatar.png"}
                alt={`${rating.userName}'s avatar`}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{rating.userName}</h4>
                  <ReactStars
                    count={5}
                    value={rating.rating}
                    size={20}
                    edit={false}
                    isHalf={true}
                    activeColor="#ffd700"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(rating.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-2 text-gray-700">{rating.review}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No reviews available.</p>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && <ReviewRating setReviewModal={setReviewModal} />}
    </div>
  );
};

export default Home;
