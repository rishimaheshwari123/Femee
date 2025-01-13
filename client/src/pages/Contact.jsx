import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLocationDot,
  FaYoutube,
} from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FaPhone } from "react-icons/fa";
import { Link } from "react-router-dom";
import femme from "../assets/femee.jpg";

const Contact = () => {
  return (
    <div className="max-w-7xl mx-auto p-5">
      <div className=" grid gap-4 main lg:grid lg:grid-cols-2 my-16 items-center">
        <div className="first flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <span className="px-4 py-3 bg-[#83387b] text-white rounded-md text-xl">
              <FaLocationDot />
            </span>
            <span>Bhopal, Madhya Pradesh</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-4 py-3 bg-[#83387b] text-white rounded-md  text-xl">
              <MdEmail />
            </span>
            <span>meenusahuji1987@gmail.com</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-4 py-3 bg-[#83387b] text-white rounded-md  text-xl">
              <FaPhone />
            </span>
            <span>+91 7879523232, +91 9575227672</span>
          </div>
          <div className="flex space-x-4  mt-1 lg:mt-0">
            <Link to="" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="text-3xl text-[#83387b]" />
            </Link>

            <Link to="" target="_blank" rel="noopener noreferrer">
              <FaYoutube className="text-3xl text-[#83387b]" />
            </Link>
            <Link to="" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="text-3xl text-[#83387b]" />
            </Link>
          </div>
        </div>

        <div>
          <img src={femme} alt="not found" />
        </div>
      </div>
    </div>
  );
};

export default Contact;
