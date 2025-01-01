import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

const SubNav = () => {
  return (
    <div className="bg-gray-300 fixed top-0 left-0 w-full shadow-md z-50">
      <nav className="flex flex-col lg:flex-row max-w-7xl mx-auto justify-between px-6 py-2">
        {/* Contact Section */}
        <div className="flex fon flex-col lg:flex-row lg:gap-5 gap-0">
          <p>
            Contact:{" "}
            <span className="text-orange-600 fon font-semibold">
              91-0251-2363652
            </span>
          </p>
          <p className="fon">
            Email:{" "}
            <a
              href="mailto:saprem.ngo@gmail.com"
              className="text-orange-600 fon font-semibold"
            >
              saprem.ngo@gmail.com
            </a>
          </p>
        </div>

        {/* Social Media Links */}
        <div className="flex space-x-4 justify-center mt-1 lg:mt-0">
          <Link
            to="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fsapremngo.in"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook className="text-3xl text-blue-600" />
          </Link>

          <Link
            to="https://www.youtube.com/channel/UCtKjoV2rSaO7evrb4gvQZFg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaYoutube className="text-3xl text-red-600" />
          </Link>
          <Link
            to="https://www.instagram.com/saprem_ngo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="text-3xl text-pink-500" />
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default SubNav;
