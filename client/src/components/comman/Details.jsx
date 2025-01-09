import React from "react";
import { Link } from "react-router-dom";
import { FaRegBuilding, FaUserAlt, FaRecycle, FaLeaf } from "react-icons/fa";

const Details = () => {
  return (
    <div className="max-w-7xl mx-auto p-5">
      <div className=" flex flex-col  w-full items-center">
        <h3 className=" text-2xl lg:text-4xl font-semibold   mt-2">
          What We Does
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
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <Link
          to="/happy-future"
          className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex items-center space-x-4">
            <FaRegBuilding className="text-blue-600 text-3xl" />
            <span className="text-xl font-semibold text-gray-800">
              Build up your future Happy with us.
            </span>
          </div>
        </Link>

        {/* Card 2 */}
        <Link
          to={"/founder"}
          className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex items-center space-x-4">
            <FaUserAlt className="text-green-600 text-3xl" />
            <span className="text-xl font-semibold text-gray-800">
              Creator | Founder | Organizer
            </span>
          </div>
        </Link>

        {/* Card 3 */}
        <Link
          to={"/plastic"}
          className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex items-center space-x-4">
            <FaRecycle className="text-purple-600 text-3xl" />
            <span className="text-xl font-semibold text-gray-800">
              Make Plastic Free India
            </span>
          </div>
        </Link>

        {/* Card 4 */}
        <Link
          to={"/natural"}
          className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex items-center space-x-4">
            <FaLeaf className="text-yellow-600 text-3xl" />
            <span className="text-xl font-semibold text-gray-800">
              No Plastic No Chemical Only Natural
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Details;
