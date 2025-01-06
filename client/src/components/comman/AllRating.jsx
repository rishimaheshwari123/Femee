import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import ReactStars from "react-rating-stars-component";

const ReviewSwiper = ({ allRatings }) => {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h3 className="text-center text-2xl font-bold mb-6">
        All Reviews and Ratings
      </h3>
      {allRatings.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {allRatings.map((rating, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <img
                    src={rating.user?.images[0]?.url || "/default-avatar.png"}
                    alt={`${rating.userName}'s avatar`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-lg">{`${rating?.user?.fName} ${rating?.user?.lName}`}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <ReactStars
                    count={5}
                    value={rating.rating}
                    size={24}
                    edit={false}
                    isHalf={true}
                    activeColor="#ffd700"
                  />
                </div>
                <p className="mt-4 text-gray-700">{rating.review}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-center text-gray-500">No reviews available.</p>
      )}
    </div>
  );
};

export default ReviewSwiper;
