import React from "react";
import { FaHandHoldingHeart, FaLeaf, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";
import founder from "../assets/mam.jpg";
const FounderDetails = () => {
  return (
    <div className="bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-10">
        {/* Founder Image */}
        <div className="flex justify-center">
          <img
            src={founder}
            alt="श्रीमती मीनू साहू"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-blue-500"
          />
        </div>

        {/* Heading and Description */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-600 mt-6">
          Creator
        </h1>
        <p className="text-center text-gray-700 mt-2">श्रीमती मीनू साहू</p>
        <p className="text-center text-gray-500 mt-1">Age: 36</p>

        <div className="mt-6 space-y-6">
          <div className="flex items-center">
            {/* <FaHandHoldingHeart className="text-pink-500 text-3xl mr-4" /> */}
            <p className="text-gray-800">
              Since 1999, श्रीमती मीनू साहू महिलाओं की सेवा में समर्पित हैं।
              उन्होंने महिलाओं को शिक्षित बनाने और उनके स्वस्थ एवं समाज में
              स्थान दिलाने के लिए काम किया है।
            </p>
          </div>
          <div className="flex items-center">
            {/* <FaUsers className="text-purple-500 text-3xl mr-4" /> */}
            <p className="text-gray-800">
              Natural Pad का Business शुरू करके 85000 से भी अधिक महिलाओं को
              स्वच्छता और पर्यावरण संरक्षण के प्रति जागरूक किया।
            </p>
          </div>
          <div className="flex items-center">
            {/* <FaLeaf className="text-green-500 text-3xl mr-4" /> */}
            <p className="text-gray-800">
              Natural Pad का उपयोग करके महिलाएं स्वस्थ व आत्मनिर्भर बन रही है और
              पर्यावरण संरक्षण में अपना योगदान दे रही है एवं महिलाओं का Busines
              Woman बनाने का हमारा सपना साकार हो रहा है
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to={"/about"}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-600"
          >
            और जानें
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FounderDetails;
