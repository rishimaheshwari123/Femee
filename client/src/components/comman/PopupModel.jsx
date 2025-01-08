import React from "react";
import { FaTimes } from "react-icons/fa";
import ganeshji from "../../assets/ganeshji.jpg";
const PopupModal = ({ isOpen, setIsOpen, handleClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-5 relative">
        {/* Top Left Image */}
        <div className="absolute top-2">
          <img
            src={ganeshji}
            alt="Bhagwan"
            className="rounded-full w-28 h-28 border-2 border-gray-300"
          />
        </div>

        {/* Close Icon */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>

        {/* Founder Image & Title */}
        <div className="mt-12 text-center">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/002/387/693/small_2x/user-profile-icon-free-vector.jpg" // Replace with founder's image URL
            alt="Founder"
            className="mx-auto rounded-full w-52 h-52 mb-3 border-2 border-gray-300"
          />
          <h2 className="text-xl font-semibold">Founder Name</h2>
        </div>

        {/* Buttons */}
        <div className="mt-5 grid lg:grid-cols-2 gap-3">
          <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
            Button 1
          </button>
          <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">
            Button 2
          </button>
          <button className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600">
            Button 3
          </button>
          <button className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600">
            Button 4
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
