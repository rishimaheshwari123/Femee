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
import { motion, useAnimation } from "framer-motion";
import s1 from "../../assets/ganesh.jpg";
import s2 from "../../assets/bhagwan.jpg";
import s3 from "../../assets/femee.jpg";
import s4 from "../../assets/s1.png";
import { Link } from "react-router-dom";

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageControls = useAnimation();
  const textControls = useAnimation();

  const work = [
    {
      id: 1,
      image: s1,
      text: "Ganesh",
      description: "This is a Ganesh image",
    },
    {
      id: 2,
      image: s2,
      text: "Bhagwan",
      description: "This is a Bhagwan image",
    },
    {
      id: 3,
      image: s3,
      text: "Femee",
      description: "This is a Femee image",
    },
    {
      id: 4,
      image: s4,
      text: "Image 4",
      description: "This is image 4",
    },
  ];

  const imageAnimation = {
    initial: { opacity: 0, scale: 1.1 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    transition: { duration: 0.5 },
  };

  const textAnimation = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="relative bg-gradient-to-r from-[#9db351] to-[#9db351]">
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
          imageControls.start("animate");
          textControls.start("animate");
        }}
      >
        {work.map((item, index) => (
          <SwiperSlide key={item.id} className="relative">
            <motion.div
              className="relative"
              initial="initial"
              animate={index === currentIndex ? "animate" : "exit"}
              exit="exit"
              variants={imageAnimation}
            >
              <img
                src={item.image}
                alt={item.text}
                className="w-full lg:h-[80vh] h-[45vh] object-contain" // Changed from object-cover to object-contain
              />
            </motion.div>
            <motion.div
              className="absolute left-8 top-1/3 flex justify-start flex-col transform -translate-y-1/2 p-6"
              initial="initial"
              animate={index === currentIndex ? "animate" : "exit"}
              exit="exit"
              variants={textAnimation}
            ></motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;
