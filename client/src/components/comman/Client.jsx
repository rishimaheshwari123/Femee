import React from "react";
import c1 from "../../assets/femee.jpg";

const Client = () => {
  return (
    <div>
      <br />
      <div className="my-10">
        <div className=" flex flex-col  w-full items-center">
          <h3 className=" text-2xl lg:text-4xl font-semibold  text-black">
            Our Agency Clients
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
                    
        </div>
        <p className="text-center text-xl px-5">
          Check out some of the precious clients we have helped with Digital
          Marketing and Website Development Services.
        </p>
        <div className="scroll-container  max-w-7xl mx-auto my-10 px-5">
          <div className="scroll-right-to-left flex lg:gap-10 items-center ">
            <img src={c1} alt="not found" />
            <img src={c1} alt="not found" />
            <img src={c1} alt="not found" />
            <img src={c1} alt="not found" />
            <img src={c1} alt="not found" />
            <img src={c1} alt="not found" />
          </div>
        </div>
      </div>
      <br />
    </div>
  );
};

export default Client;
