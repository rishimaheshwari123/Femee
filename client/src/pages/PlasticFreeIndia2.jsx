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
            <FaLeaf className="text-green-500 text-3xl mr-4" />
            <p className="text-gray-800">
              Femme Cure यह अवसर प्रदान करता है। जागरूकता अभियान का हिस्सा बनें
              और खुद को स्वच्छ और सक्षम बनाएं।
            </p>
          </div>
          <div className="flex items-center">
            <FaRupeeSign className="text-yellow-500 text-3xl mr-4" />
            <p className="text-gray-800">
              घर बैठे <strong>₹11,000 से ₹30,000</strong> तक प्रति माह धन लाभ
              प्राप्त करें।
            </p>
          </div>
        </div>

        <p className="mt-8 text-gray-700 text-center italic">
          धन्यवाद,
          <br />
          आपकी,
          <br />
          मीना साहू (भोपाल)
        </p>
      </div>
    </div>
  );
};

export default PlasticFreeIndia2;
