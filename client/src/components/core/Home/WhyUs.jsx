import React from "react";

const WhyUs = () => {
  return (
    <div className="bg-[#800080] ">
      <br />
      <div className=" flex flex-col  w-full items-center">
        <h3 className=" text-2xl lg:text-4xl font-semibold  text-white mt-2">
          Our Impacts
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
      <div className="main max-w-7xl mx-auto p-5 grid lg:grid-cols-2 gap-5 lg:py-3">
        <div className="first">
          <p className="text-center text-3xl lg:text-4xl font-semibold text-green-600">
            500+
          </p>
          <p className="text-center text-white text-xl mt-2">
            Active Members
            <br />
            {/* change that matters */}
          </p>
        </div>
        <div className="second">
          <p className="text-center text-3xl lg:text-4xl font-semibold text-green-600">
            85,000+
          </p>
          <p className="text-center text-white text-xl mt-2">
            All Over India Client
          </p>
        </div>
      </div>
      <br />
      <br />
    </div>
  );
};

export default WhyUs;
