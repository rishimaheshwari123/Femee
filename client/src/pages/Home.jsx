import React from "react";
import Slider from "../components/comman/Slider";
import WhyUs from "../components/core/Home/WhyUs";
import KnowAboutUs from "../components/comman/KnowAboutUs";

const Home = () => {
  return (
    <div>
      <Slider />
      <br />
      <WhyUs />
      <KnowAboutUs />
    </div>
  );
};

export default Home;
