import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaYoutube, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import Container from '../ui/Container';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About', to: '/about' },
      { name: 'Contact', to: '/contact' },
      { name: 'Shop', to: '/shop' },
      { name: 'Gallery', to: '/gallery' },
    ],
    social: [
      {
        name: 'Facebook',
        icon: <FaFacebook />,
        url: 'https://www.facebook.com/profile.php?id=61555373810216&mibextid=kFxxJD',
      },
      {
        name: 'YouTube',
        icon: <FaYoutube />,
        url: 'https://youtube.com/@femmecurehelpingher?si=YrDQTn26Aiyq5ZNh',
      },
      {
        name: 'Instagram',
        icon: <FaInstagram />,
        url: 'https://www.instagram.com/meenusahuji1987?igsh=NzVlazl3bnFjcDFy',
      },
    ],
  };

  return (
    <footer className="bg-primary-500 text-white">
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Office */}
            <div>
              <h4 className="text-yellow-400 text-lg font-semibold mb-4">
                Main Office
              </h4>
              <div className="flex items-start gap-2 text-gray-200">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                <p>Bhopal, Madhya Pradesh</p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-yellow-400 text-lg font-semibold mb-4">
                Contact Us
              </h4>
              <div className="space-y-3 text-gray-200">
                <div className="flex items-start gap-2">
                  <FaPhone className="mt-1 flex-shrink-0" />
                  <div>
                    <p>+91 7879523232</p>
                    <p>+91 9575227672</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FaEnvelope className="mt-1 flex-shrink-0" />
                  <p>meenusahuji1987@gmail.com</p>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-4 flex gap-4">
                {footerLinks.social.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl hover:text-yellow-400 transition-colors"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Important Links */}
            <div>
              <h4 className="text-yellow-400 text-lg font-semibold mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className="text-gray-200 hover:text-yellow-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-primary-400 py-6 text-center text-gray-300">
          <p>© {currentYear} Femme Cure. Design With I Next Ets</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
