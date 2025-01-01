import React from "react";
import img1 from "../../assets/img1.png";
import img2 from "../../assets/img2.png";
const KnowAboutUs = () => {
  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-2   max-w-7xl mx-auto p-5">
        <img
          src={img1}
          alt="not found"
          className="hover:rotate-3 shadow-xl shadow-[#83387b]"
        />
        <img
          src={img2}
          alt="not found"
          className="hover:rotate-3 shadow-xl shadow-[#83387b]"
        />
      </div>
    </div>
  );
};

export default KnowAboutUs;
