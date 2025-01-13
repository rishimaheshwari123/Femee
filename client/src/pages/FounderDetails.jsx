import React from "react";
import { FaHandHoldingHeart, FaLeaf, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";

const FounderDetails = () => {
  return (
    <div className="bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-600">
          Creator / Founder / Organizer
        </h1>
        <p className="text-center text-gray-700 mt-2">
          श्रीमती मीनू साहू (भोपाल)
        </p>
        <p className="text-center text-gray-500 mt-1">Age: 35</p>

        <div className="mt-6 space-y-6">
          <div className="flex items-center">
            <FaHandHoldingHeart className="text-pink-500 text-3xl mr-4" />
            <p className="text-gray-800">
              Since 1999, श्रीमती मीनू साहू महिलाओं की सेवा में समर्पित हैं।
              उन्होंने महिलाओं को शिक्षित बनाने और उनके स्वस्थ एवं समाज में
              स्थान दिलाने के लिए काम किया है।
            </p>
          </div>
          <div className="flex items-center">
            <FaUsers className="text-purple-500 text-3xl mr-4" />
            <p className="text-gray-800">
              Natural Pad का Business शुरू करके 85000 महिलाओं को स्वच्छता और
              पर्यावरण संरक्षण के प्रति जागरूक किया।
            </p>
          </div>
          <div className="flex items-center">
            <FaLeaf className="text-green-500 text-3xl mr-4" />
            <p className="text-gray-800">
              Natural Pad का उपयोग महिलाओं को आत्मनिर्भर और पर्यावरण संरक्षण में
              योगदान देने के लिए प्रेरित कर रहा है। एवं Business Women बनाने का सपना
              साकार हो रहा है।
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
