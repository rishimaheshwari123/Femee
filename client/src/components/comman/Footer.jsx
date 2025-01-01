import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
const Footer = () => {
  return (
    <footer className="bg-[#83387b] text-gray-300 py-10">
      <div className="max-w-7xl p-5 mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1">
          {/* <img src="path/to/logo.png" alt="" className="w-32 mb-4" /> */}
          <h4 className="text-yellow-500 text-lg mb-4">Main Office</h4>
          <p>Address</p>
        </div>

        <div>
          <h4 className="text-yellow-500 text-lg mt-4">Phone</h4>
          <p>91 78795 23232</p>

          <h4 className="text-yellow-500 text-lg mt-4">Mail</h4>
          <p>email@gmail.com</p>
          <div className="mt-4 flex space-x-4">
            <Link to={""}>
              <FaFacebook className="text-xl" />
            </Link>

            <Link to="">
              <FaYoutube className="text-xl" />
            </Link>
            <Link to={""}>
              <FaInstagram className="text-xl" />
            </Link>
          </div>
        </div>

        {/* Links Sections */}
        <div>
          <h4 className="text-yellow-500 text-lg mb-4">Important Links </h4>
          <ul>
            <li className="flex flex-col">
              <Link to="/about" className="hover:text-yellow-500">
                About
              </Link>
              <Link to="/contact" className="hover:text-yellow-500">
                Contact
              </Link>

              <Link to="/shop" className="hover:text-yellow-500">
                Shop
              </Link>
            </li>
          </ul>
        </div>

        {/* Blog Posts */}
        <div>
          <h4 className="text-yellow-500 text-lg mb-4">Background</h4>
          <ul>
            <li>
              <Link className="hover:text-yellow-500">Backgroud</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl p-5 mx-auto mt-10 text-center border-t border-gray-700 pt-6">
        <p> Design With I Next Ets</p>
      </div>
    </footer>
  );
};

export default Footer;
