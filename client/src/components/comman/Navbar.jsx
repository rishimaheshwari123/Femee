import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { useSelector } from "react-redux";
import { memberLogout } from "../../services/operations/memeber";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userName } = useParams();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.auth);
  const handleLogout = async () => {
    dispatch(memberLogout(navigate));
  };
  // Links Array
  const links = [
    { name: "Home", to: "/" },
    { name: "About", to: "/about" },
    { name: "Gallery", to: "/gallery" },
    { name: "Shop", to: "/shop" },
    { name: "Contact", to: "/contact" },
    { name: "Cart", to: "/cart" },
  ];

  return (
    <div className="lg:top-11 left-0 w-full bg-white text-black z-50 shadow-md">
      <div className="hidden sm:flex justify-between max-w-7xl mx-auto items-center px-6 py-3 border-b border-gray-200">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-16" />
        </Link>
        <div className="flex space-x-6 items-center">
          {links.map((link, index) => (
            <Link
              key={index}
              to={link.to || "#"}
              className=" hover:text-[#800080] text-[17px] font-bold"
            >
              {link.name}
            </Link>
          ))}
          {token ? (
            <>
              {/* Show Dashboard and Logout for admin and member roles */}
              {(user.role === "admin" || user.role === "member") && (
                <>
                  <Link
                    to={`${user?.role}/dashboard`}
                    className="bg-blue-500 font-bold hover:text-[#800080] text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 font-bold hover:text-[#800080] text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
                  >
                    Logout
                  </button>
                </>
              )}

              {/* Show only Logout for user role */}
              {user.role === "user" && (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 font-bold hover:text-[#800080] text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
                >
                  Logout
                </button>
              )}
            </>
          ) : (
            <>
              {/* Show Login and Membership options if no token */}
              <Link
                onClick={() => setIsSidebarOpen(false)}
                to="/user-login"
                className="font-bold hover:text-[#800080]"
              >
                User Login
              </Link>
              <Link
                onClick={() => setIsSidebarOpen(false)}
                to="/login"
                className="font-bold hover:text-[#800080]"
              >
                Member Login
              </Link>
              <Link
                to={`/become-member/${userName ? userName : "meenusahu"}`}
                onClick={() => setIsSidebarOpen(false)}
                className="bg-[#800080] font-bold text-white px-4 py-2 rounded hover:bg-yellow-600 ml-2"
              >
                Membership
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Hamburger Menu for Small Devices */}
      <div className="sm:hidden flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-10" />
        </Link>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar for Small Devices */}
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          {/* Sidebar */}
          <div className="fixed top-0 left-0 w-64 h-screen bg-white shadow-lg z-50">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <Link to="/">
                <img src={logo} alt="Logo" className="h-10" />
              </Link>
              <button onClick={() => setIsSidebarOpen(false)}>
                <FaTimes size={24} />
              </button>
            </div>
            <div className="px-6 py-4">
              {/* Render links */}
              {links.map((link, index) => (
                <Link
                  key={index}
                  to={link.to || "#"}
                  className="block mb-4 hover:text-gray-600"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {/* Conditionally render buttons */}
              {token ? (
                <>
                  {/* Show Dashboard and Logout for admin and member roles */}
                  {(user.role === "admin" || user.role === "member") && (
                    <>
                      <Link
                        to={`${user?.role}/dashboard`}
                        onClick={() => setIsSidebarOpen(false)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 block mb-2"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 block"
                      >
                        Logout
                      </button>
                    </>
                  )}

                  {/* Show only Logout for user role */}
                  {user.role === "user" && (
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 block"
                    >
                      Logout
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Show Login and Membership options if no token */}
                  <Link
                    onClick={() => setIsSidebarOpen(false)}
                    to="/login"
                    className="block text-[#800080] font-bold mb-2"
                  >
                    Member Login
                  </Link>
                  <Link
                    onClick={() => setIsSidebarOpen(false)}
                    to={`/become-member/${userName ? userName : "meenusahu"}`}
                    className="bg-[#800080] text-white px-4 py-2 rounded hover:bg-yellow-600 block"
                  >
                    Membership
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;
