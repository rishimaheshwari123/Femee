import React, { useState } from "react";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
  EffectFade,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";
import { Link } from "react-router-dom";
import s1 from "../../assets/slider1.png";
import s2 from "../../assets/slider2.png";
const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const work = [
    {
      id: 1,
      image: s1,
      // text: "Empowering Communities",
      // description:
      //   "Join us in transforming lives through education, healthcare, and sustainable development projects. Together, we can create a brighter future for all.",
      // path: "/donate",
    },
    {
      id: 2,
      image: s2,
      // text: "Empowering Communities",
      // description:
      //   "Join us in transforming lives through education, healthcare, and sustainable development projects. Together, we can create a brighter future for all.",
      // path: "/donate",
    },
  ];

  return (
    <div className="relative">
      <Swiper
        modules={[
          Navigation,
          Pagination,
          Scrollbar,
          A11y,
          Autoplay,
          EffectFade,
        ]}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        pagination={true}
        navigation={true}
        spaceBetween={0}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          768: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          1024: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
        }}
        onSlideChange={({ activeIndex }) => {
          setCurrentIndex(activeIndex);
        }}
      >
        {work.map((item, index) => (
          <SwiperSlide key={item.id} className="relative z-0">
            <div className="relative">
              <img
                src={item.image}
                alt={item.text}
                className="w-full lg:h-[65vh] h-[45vh] transition-opacity duration-700 ease-in-out"
              />
            </div>
            {/* <div
              className={`absolute left-8 top-1/3 flex justify-start flex-col transform -translate-y-1/2 p-6 transition-all duration-700 ease-in-out ${
                index === currentIndex
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <p className="text-white text-xl md:text-2xl lg:text-7xl font-bold text-left mb-4">
                {item.text}
              </p>
              <p className="text-white text-sm md:text-lg lg:text-xl text-left mb-4 hidden lg:block">
                {item.description}
              </p>
              <Link
                to={item.path}
                className="block border-2 border-white text-center py-2 text-white text-sm md:text-lg lg:text-xl rounded-lg transition-transform transform hover:scale-105"
                style={{ width: "200px" }}
              >
                Donate Now
              </Link>
            </div> */}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;
