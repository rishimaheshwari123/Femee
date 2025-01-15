import React, { useState } from "react";
import {
  FaFacebookF,
  FaWhatsapp,
  FaEnvelope,
  FaInstagram,
  FaTimes,
} from "react-icons/fa";
import "./SocialMediaBar.css";

const SocialMediaBar = () => {
  const [isContactFormOpen, setContactFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: null,
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // try {
    //   Swal.fire({
    //     title: "Loading",
    //     allowOutsideClick: false,
    //     allowEscapeKey: false,
    //     allowEnterKey: false,
    //     showConfirmButton: false,
    //     html: '<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>',
    //   });

    //   const formDataToSend = new FormData();
    //   formDataToSend.append("name", formData.name);
    //   formDataToSend.append("phone", formData.phone);
    //   formDataToSend.append("email", formData.email);
    //   formDataToSend.append("subject", formData.subject);
    //   formDataToSend.append("message", formData.message);

    //   const response = await axios.post(
    //     `${BASE_URL}/contact/create`,
    //     formDataToSend,
    //     {
    //       headers: {
    //         "Content-Type": "multipart/form-data",
    //       },
    //     }
    //   );

    //   Swal.close();

    //   if (response?.data?.success) {
    //     Swal.fire({
    //       title: `Contact form submited successfully! `,
    //       text: `Have a nice day!`,
    //       icon: "success",
    //     });
    //     setFormData({
    //       name: "",
    //       phone: "",
    //       email: "",
    //       message: "",
    //     });
    //   }
    // } catch (error) {
    //   Swal.close();
    //   // toast.error("Oops, something went wrong!");
    // }
  };

  const handleContactFormOpen = () => {
    setContactFormOpen(true);
  };

  const handleContactFormClose = () => {
    setContactFormOpen(false);
  };

  return (
    <div className="social-media-bar">
      <div
        className="social-icon contact-us"
        onMouseEnter={handleContactFormOpen}
        onMouseLeave={handleContactFormClose}
      >
        <FaEnvelope />
        <span className="icon-name">Contact Us</span>
        {isContactFormOpen && (
          <div className="contact-form">
            <button className="close-button" onClick={handleContactFormClose}>
              <FaTimes />
            </button>
            <h3>Contact Us</h3>
            <form onSubmit={handleSubmit} className=" text-black">
              <input
                type="text"
                placeholder="Your Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              <input
                onChange={handleChange}
                type="email"
                placeholder="Your Email"
                name="email"
                value={formData.email}
              />
              <input
                type="tel"
                onChange={handleChange}
                placeholder="Your NUmber"
                name="phone"
                value={formData.phone}
              />
              <textarea
                placeholder="Your Message"
                onChange={handleChange}
                name="message"
                value={formData.message}
              ></textarea>
              <button type="submit" className="sendbutton">
                Send
              </button>
            </form>
          </div>
        )}
      </div>
      <div className="social-icon bg-blue-800">
        <a
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebookF />
          <span className="icon-name">Facebook</span>
        </a>
      </div>
      <div className="social-icon bg-green-600">
        <a
          href="https://wa.me/+919351014634"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaWhatsapp />
          <span className="icon-name">WhatsApp</span>
        </a>
      </div>
      <div className="social-icon bg-red-500">
        <a
          href="https://www.instagram.com/rks.homes/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram />
          <span className="icon-name ">Instagram</span>
        </a>
      </div>
    </div>
  );
};

export default SocialMediaBar;
