import React, { useState, useEffect } from "react";
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
import s3 from "../../assets/s3.jpg";
import s4 from "../../assets/s4.jpg";
const Slider1 = () => {
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTextVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const work = [
    {
      id: 1,
      image: s3,
      title: "सृज‌न स्वच्छता",
      headline: "नारी का स्वस्थ और स्वच्छ जीवन",
      description:
        "Anion Sanitary Pad, जो महिलाओं और बच्चियों को स्वास्थ्य और सुरक्षा प्रदान करता है। गंभीर बीमारियों जैसे 'Uterine cancer' को रोकने में सहायक।",
      buttonText: "अधिक जानें",
      buttonLink: "/about",
    },
    {
      id: 2,
      image: s4,
      title: "पर्यावरण संरक्षण",
      headline: "स्वच्छता और पर्यावरण के लिए कदम",
      description:
        "यह Pad Biodegradable है, जो पर्यावरण संरक्षण में भी महिलाओं का योगदान सुनिश्चित करता है।",
      buttonText: "हमसे जुड़ें",
      buttonLink: "/contact",
    },
  ];

  const handleSlideChange = () => {
    setTextVisible(false);
    setTimeout(() => setTextVisible(true), 500);
  };

  return (
    <div className="relative bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
      <Swiper
        modules={[
          Navigation,
          Pagination,
          Scrollbar,
          A11y,
          Autoplay,
          EffectFade,
        ]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        spaceBetween={0}
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 0 },
          768: { slidesPerView: 1, spaceBetween: 0 },
          1024: { slidesPerView: 1, spaceBetween: 0 },
        }}
        onSlideChange={handleSlideChange}
      >
        {work.map((item) => (
          <SwiperSlide key={item.id} className="relative">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-[80vh] sm:h-[60vh] md:h-[80vh] lg:h-[90vh] object-cover"
            />
            <div
              className={`absolute inset-0 p-8 z-10 flex flex-col justify-center transition-opacity duration-1000 ${
                textVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="bg-[#800080] bg-opacity-60 text-white p-5 sm:p-6 md:p-8 lg:p-12 max-w-full md:max-w-lg ml-auto">
                <p className="text-customGreen text-xs sm:text-sm md:text-base font-bold mb-2">
                  {item.title}
                </p>
                <h2 className="text-white text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
                  {item.headline}
                </h2>
                <p className="text-white text-sm sm:text-base md:text-lg mb-6">
                  {item.description}
                </p>
                {item.buttonText && (
                  <a
                    href={item.buttonLink}
                    className="bg-customGreen text-black px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold hover:bg-yellow-500 transition duration-300"
                  >
                    {item.buttonText}
                  </a>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="absolute top-0 left-0 right-0 flex items-center justify-center bg-[#800080] bg-opacity-70 p-4 z-10">
        <p className="text-white text-base sm:text-lg font-semibold text-center max-w-xs sm:max-w-md mx-4 border border-white rounded-lg p-2 shadow-lg animate-blink">
          सृज‌न स्वच्छता करना ही एक अच्छी जिन्दगी है।
        </p>
      </div>
    </div>
  );
};

export default Slider1;
