import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#800080] text-gray-300 py-10">
      <div className="max-w-7xl px-5 mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Office Section */}
        <div>
          <h4 className="text-yellow-500 text-lg font-semibold mb-4">
            Main Office
          </h4>
          <p>Bhopal, Madhya Pradesh</p>
        </div>

        {/* Contact Section */}
        <div>
          <h4 className="text-yellow-500 text-lg font-semibold mb-4">
            Contact
          </h4>
          <p>
            <span className="block">Phone: +91 7879523232, +91 9575227672</span>
            <span className="block mt-2">Mail: meenusahuji1987@gmail.com</span>
          </p>
          <div className="mt-4 flex space-x-4">
            <Link
              to="https://www.facebook.com/profile.php?id=61555373810216&mibextid=kFxxJD"
              className="hover:text-yellow-500"
            >
              <FaFacebook className="text-xl" />
            </Link>
            <Link
              to="https://youtube.com/@femmecurehelpingher?si=YrDQTn26Aiyq5ZNh"
              className="hover:text-yellow-500"
            >
              <FaYoutube className="text-xl" />
            </Link>
            <Link
              to="https://www.instagram.com/meenusahuji1987?igsh=NzVlazl3bnFjcDFy"
              className="hover:text-yellow-500"
            >
              <FaInstagram className="text-xl" />
            </Link>
          </div>
        </div>

        {/* Important Links Section */}
        <div>
          <h4 className="text-yellow-500 text-lg font-semibold mb-4">
            Important Links
          </h4>
          <ul>
            <li className="mb-2">
              <Link to="/about" className="hover:text-yellow-500">
                About
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/contact" className="hover:text-yellow-500">
                Contact
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/shop" className="hover:text-yellow-500">
                Shop
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="max-w-7xl px-5 mx-auto mt-10 text-center border-t border-gray-700 pt-6">
        <p>Design With I Next Ets</p>
      </div>
    </footer>
  );
};

export default Footer;
