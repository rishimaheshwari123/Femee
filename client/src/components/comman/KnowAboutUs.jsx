import React from "react";
import img1 from "../../assets/femee.jpg";
import img2 from "../../assets/g1.jpg";

const KnowAboutUs = () => {
  return (
    <div>
      <div className=" flex flex-col  w-full items-center">
        <h3 className=" text-2xl lg:text-4xl font-semibold   mt-2">
          Know About Us
        </h3>
        <br />
        <div className="flex items-center w-[75px]">
          <div className="h-0.5 bg-[#cee21a]"></div>
          <div className="h-1 w-1 bg-[#cee21a] rounded-full mx-1"></div>
          <div className="h-1 w-1 bg-[#cee21a] rounded-full mx-1"></div>
          <div className="h-1 w-1 bg-[#cee21a] rounded-full mx-1"></div>
          <div
            className="h-[4px] rounded-full w-[10px] flex-grow"
            style={{ backgroundColor: "#cee21a" }}
          ></div>
        </div>
                  
      </div>{" "}
      <div className="grid lg:grid-cols-2 gap-2  items-center max-w-7xl mx-auto p-5">
        <div className="lg:w-full lg:h-[64vh] overflow-hidden">
          <img
            src={img1}
            alt="not found"
            className="w-full h-full object-contain shadow-xl shadow-[#83387b]"
          />
        </div>
        <div className="lg:w-full lg:h-[50vh] overflow-hidden">
          <img
            src={img2}
            alt="not found"
            className="w-full h-full object-contain h shadow-[#83387b]"
          />
        </div>
      </div>
    </div>
  );
};

export default KnowAboutUs;
