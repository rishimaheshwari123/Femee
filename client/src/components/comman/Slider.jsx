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
import s1 from "../../assets/s1.png";
import s2 from "../../assets/s2.png";

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const work = [
    {
      id: 1,
      image: s1,
    },
    {
      id: 2,
      image: s2,
    },
  ];

  return (
    <div className="relative bg-[#843d7d] h-[70vh]  flex justify-center items-center">
      <Swiper
        modules={[
          Navigation,
          Pagination,
          Scrollbar,
          A11y,
          Autoplay,
          EffectFade,
        ]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        pagination={{ clickable: true }}
        navigation
        spaceBetween={0}
        breakpoints={{
          640: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 1,
          },
          1024: {
            slidesPerView: 1,
          },
        }}
        onSlideChange={({ activeIndex }) => {
          setCurrentIndex(activeIndex);
        }}
      >
        {work.map((item) => (
          <SwiperSlide
            key={item.id}
            className="flex justify-center items-center "
          >
            <div className="relative flex justify-center items-center h-full">
              <img
                src={item.image}
                alt={`Slide ${item.id}`}
                className="max-w-[80%] max-h-[80%] object-contain rounded-xl shadow-lg transition-transform duration-500 ease-in-out hover:scale-105"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;
