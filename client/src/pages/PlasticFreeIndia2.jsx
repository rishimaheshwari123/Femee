import React from "react";
import { FaLeaf, FaRecycle, FaRupeeSign } from "react-icons/fa";

const PlasticFreeIndia2 = () => {
  return (
    <div className="bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-10">
        <h2 className="text-xl md:text-2xl font-semibold text-center text-purple-600 mt-8">
          Femme Cure का संदेश
        </h2>

        <div className="mt-6 space-y-4">
          <div className="flex items-center">
            {/* <FaLeaf className="text-green-500 text-3xl mr-4" /> */}
            <p className="text-gray-800">
              Femme Cure आप सभी को यह अवसर प्रदान करता है। की स्वस्थ नारी
              सुरक्षित पर्यावरण जागरूकता अभियान का हिस्सा बनें और स्वयं के साथ
              साथ दूसरों को भी स्वस्थ और सक्षम बनाएं।
            </p>
          </div>
          <div className="flex items-center">
            {/* <FaRupeeSign className="text-yellow-500 text-3xl mr-4" /> */}
            <p className="text-gray-800">
              और घर बैठे ही 50000 से अधिक प्रतिमाह धन कमाए
            </p>
          </div>
        </div>

        <p className="mt-8 text-gray-700 text-center italic">
          धन्यवाद,
          <br />
          आपकी,
          <br />
          मीनू साहू (भोपाल)
        </p>
      </div>
    </div>
  );
};

export default PlasticFreeIndia2;
