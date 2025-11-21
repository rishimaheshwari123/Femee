import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import femme from "../assets/femee.jpg";
import SocialMediaBar from "../components/comman/SocialMedia";
import { Container, Card } from "../components/ui";
import { SOCIAL_LINKS, CONTACT_INFO } from "../utils/constants";

const Contact = () => {
  const contactItems = [
    {
      icon: <FaMapMarkerAlt />,
      title: "Location",
      content: CONTACT_INFO.ADDRESS,
      color: "bg-primary-500",
    },
    {
      icon: <FaEnvelope />,
      title: "Email",
      content: CONTACT_INFO.EMAIL,
      color: "bg-secondary-500",
    },
    {
      icon: <FaPhone />,
      title: "Phone",
      content: (
        <>
          {CONTACT_INFO.PHONE_1}
          <br />
          {CONTACT_INFO.PHONE_2}
        </>
      ),
      color: "bg-primary-500",
    },
  ];

  const socialLinks = [
    {
      icon: <FaFacebook />,
      url: SOCIAL_LINKS.FACEBOOK,
      label: "Facebook",
      color: "hover:text-blue-600",
    },
    {
      icon: <FaYoutube />,
      url: SOCIAL_LINKS.YOUTUBE,
      label: "YouTube",
      color: "hover:text-red-600",
    },
    {
      icon: <FaInstagram />,
      url: SOCIAL_LINKS.INSTAGRAM,
      label: "Instagram",
      color: "hover:text-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Information
            </h2>

            {contactItems.map((item, index) => (
              <Card
                key={index}
                hover
                className="transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`${item.color} text-white p-4 rounded-lg text-2xl flex-shrink-0`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>
              </Card>
            ))}

            {/* Social Media */}
            <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
              <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-primary-500 p-3 rounded-full hover:scale-110 transition-transform duration-300"
                    aria-label={social.label}
                  >
                    <span className="text-2xl">{social.icon}</span>
                  </a>
                ))}
              </div>
            </Card>
          </div>

          {/* Image */}
          <div className="flex items-center justify-center">
            <Card padding="none" className="overflow-hidden w-full">
              <img
                src={femme}
                alt="Femme Cure"
                className="w-full h-full object-cover rounded-lg"
              />
            </Card>
          </div>
        </div>

        {/* Social Media Bar */}
        <div className="mt-12">
          <SocialMediaBar />
        </div>
      </Container>
    </div>
  );
};

export default Contact;
