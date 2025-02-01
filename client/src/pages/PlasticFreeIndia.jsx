import React from "react";
import { FaLeaf, FaRecycle, FaRupeeSign } from "react-icons/fa";
import SocialMediaBar from "../components/comman/SocialMedia";

const PlasticFreeIndia = () => {
  return (
    <div className="bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-green-600">
          Make Plastic Free India
        </h1>

        <div className="mt-6 space-y-4">
          <div className="flex items-center">
            {/* <FaRecycle className="text-blue-500 text-3xl mr-4" /> */}
            <p className="text-gray-800">
              भारत को प्लास्टिक से मुक्त बनाने में अपना योगदान दें। Natural Pad
              का उपयोग करें, जो पर्यावरण से प्राप्त चीजों से मिलकर बना होता है
              जो प्रकृति में से हवा, पानी, मिट्टी के संपर्क में आने पर आसानी
              से नष्ट हो जाता है ।
            </p>
          </div>
          <div className="flex items-center">
            {/* <FaLeaf className="text-green-500 text-3xl mr-4" /> */}
            <p className="text-gray-800">
              <strong>No Plastic, No Chemical, Only Natural.</strong>
            </p>
          </div>
        </div>
      </div>
      <SocialMediaBar />
    </div>
  );
};

export default PlasticFreeIndia;
