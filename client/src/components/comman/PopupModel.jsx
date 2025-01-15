import React from "react";
import { FaPhone, FaTimes } from "react-icons/fa";
import ganeshji from "../../assets/ganesh.jpg";
import bhagwan from "../../assets/bhagwan.jpg";
import { Link } from "react-router-dom";
import founder from "../../assets/mam.jpg";
const PopupModal = ({ isOpen, setIsOpen, handleClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl h-[80vh] md:h-fit w-11/12 md:w-2/3 lg:w-1/2 p-6 relative overflow-hidden overflow-y-auto">
        {/* Decorative Images at Top */}
        <div className="absolute top-3 left-3">
          <img
            src={ganeshji}
            alt="Bhagwan"
            className="rounded-full w-24 h-24 border-4 border-yellow-400 shadow-lg"
          />
        </div>
        <div className="absolute top-3 right-6">
          <img
            src={bhagwan}
            alt="Bhagwan"
            className="rounded-full w-24 h-24 border-4 border-yellow-400 shadow-lg"
          />
        </div>

        {/* Title */}
        <p className="absolute hidden lg:block top-5 left-1/2 transform -translate-x-1/2 text-orange-500 text-base sm:text-lg md:text-2xl font-extrabold tracking-wide drop-shadow-md">
          जय श्री गणेश हर हर महादेव
        </p>
        <p className="absolute block lg:hidden top-5 left-1/2 transform -translate-x-1/2 text-orange-500 text-base sm:text-lg md:text-2xl font-extrabold tracking-wide drop-shadow-md">
          जय श्री गणेश
        </p>

        {/* Close Icon */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition duration-300"
        >
          <FaTimes size={24} />
        </button>

        {/* Content Section */}
        <div className="mt-8 text-center">
          <img
            src={founder}
            alt="Founder"
            className="mx-auto rounded-full w-56 h-56 border-4 border-gray-300 shadow-md"
          />
          <h2 className="text-lg md:text-xl font-medium text-gray-700 mt-4">
            हमारा उद्देश्यू: <br />
            <span className="text-blue-600 font-bold">
              (हो निरोगी तन और हो हर घर में धन)
            </span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-3 leading-relaxed">
            हमें आप की फ्रिक हैं। आज की इस भाग दौड़ वाली जिन्दगी में हम अपने
            स्वास्थ्य पर ज्यादा ध्यान नहीं दे पाते हैं। Femme Cure कंपनी आप के
            लिए लाई है यह Helping Her Product और Profit, जो आपको बनाए स्वस्थ्य व
            सक्षम। <br />
            <span className="text-green-600 font-semibold">
              अच्छे स्वास्थ्य के लिए एक बार जरूर Helping Her Product का इस्तेमाल
              करके देखें। अधिक जानकारी के लिए कॉल करें:
            </span>
          </p>

          <div className="flex items-center justify-center gap-4 mt-4 border-2 border-black px-5 rounded-lg w-fit mx-auto py-2">
            <div className="flex items-center gap-2">
              <FaPhone className="text-green-600" size={20} />
              <a
                href="tel:7879523232"
                className="text-blue-500 font-bold hover:text-blue-700"
              >
                7879523232
              </a>
            </div>
            <div>
              <a
                href="tel:+917879523232"
                className="bg-green-600 text-white py-2 px-6 rounded-lg shadow-md flex items-center justify-center gap-2 hover:bg-green-700 transition"
              >
                <FaPhone />
                कॉल करें
              </a>
            </div>
          </div>

          {/* Call Now Button */}
        </div>

        {/* Buttons Section */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            onClick={handleClose}
            to="/happy-future"
            className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            Build up your future Happy with us.
          </Link>
          <Link
            onClick={handleClose}
            to="/founder"
            className="bg-purple-700 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition"
          >
            Creator | Founder | Organizer
          </Link>
          <Link
            onClick={handleClose}
            to="/plastic"
            className="bg-yellow-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-yellow-600 transition"
          >
            Make Plastic Free India
          </Link>
          <Link
            onClick={handleClose}
            to="/natural"
            className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition"
          >
            No Plastic No Camical Only Natural
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
