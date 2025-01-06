import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CiMenuFries } from "react-icons/ci";
import { RxCross1 } from "react-icons/rx";
import { AiOutlineUser } from "react-icons/ai";
import { MdLogout } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import logo from "../../../assets/logo.png";
import { memberLogout } from "../../../services/operations/memeber";
import { FcBullish } from "react-icons/fc";
import { IoPeopleSharp } from "react-icons/io5";
import { FcGallery } from "react-icons/fc";
import { GrGallery } from "react-icons/gr";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { AiFillProduct } from "react-icons/ai";
import { BiPurchaseTag } from "react-icons/bi";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true"
  );
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => {
    dispatch(memberLogout(navigate));
  };

  // Toggle sidebar
  const handleToggle = () => {
    const collapsed = !isCollapsed;
    setIsCollapsed(collapsed);
    localStorage.setItem("sidebarCollapsed", collapsed.toString());
  };

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsCollapsed(true);
        localStorage.setItem("sidebarCollapsed", "true");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigation items
  const navItems = [
    { to: "/", icon: <FaHome />, label: "Back To Home" },
    ...(user?.role === "admin"
      ? [
          { to: "/admin/dashboard", icon: <FcBullish />, label: "Dashboard" },

          {
            to: "/admin/getAll-members",
            icon: <IoPeopleSharp />,
            label: "Get All Members",
          },
          {
            to: "/admin/add-product",
            icon: <MdOutlineProductionQuantityLimits />,
            label: "Add Product",
          },
          {
            to: "/admin/get-product",
            icon: <AiFillProduct />,
            label: "Get All Product",
          },
          {
            to: "/admin/orders",
            icon: <BiPurchaseTag />,
            label: "Orders",
          },
          {
            to: "/admin/add-gallery",
            icon: <FcGallery />,
            label: "Add Gallery",
          },
          {
            to: "/admin/get-gallery",
            icon: <GrGallery />,
            label: "Get Gallery",
          },
        ]
      : []),
    ...(user?.role === "member"
      ? [
          { to: "/member/dashboard", icon: <FcBullish />, label: "Dashboard" },

          {
            to: "/member/getAll-members",
            icon: <IoPeopleSharp />,
            label: "Get All Members",
          },
        ]
      : []),
  ];

  return (
    <div
      ref={sidebarRef}
      className={`fixed h-screen top-0 ${
        isCollapsed ? "w-16" : "w-64"
      } bg-gray-900 transition-all duration-300 z-50`}
    >
      <div className="flex items-center justify-between p-4 ">
        {/* Logo */}
        <div
          className={`${
            isCollapsed ? "hidden" : "block"
          } text-white font-bold text-xl`}
        >
          <img
            src={logo}
            alt="Logo"
            className="w-[50px] h-[50px] lg:w-12 lg:h-12 object-cover rounded-full"
          />
        </div>

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className="bg-transparent border-none w-8 h-8 flex justify-center items-center cursor-pointer text-white"
        >
          {isCollapsed ? <CiMenuFries size={22} /> : <RxCross1 size={22} />}
        </button>
      </div>

      {/* Navigation Links */}
      <ul className="text-white list-none flex flex-col p-4 mb-14 overflow-y-auto max-h-[65vh]">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              `text-white py-4 flex items-center hover:border-r-4 hover:border-black ${
                isActive ? "border-r-4 border-white" : ""
              }`
            }
          >
            <div className="text-2xl">{item.icon}</div>
            <span
              className={`ml-4 text-xl ${isCollapsed ? "hidden" : "block"}`}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </ul>

      {/* User and Logout Section */}
      <div className="absolute bottom-2 left-2 right-2 overflow-hidden mt-10">
        <div
          className={`flex items-center justify-center w-full ${
            isCollapsed
              ? "w-11 h-11 rounded-full bg-slate-400"
              : "bg-slate-400 py-2 px-4 rounded-lg"
          }`}
        >
          <div className="cursor-pointer flex items-center justify-center text-black">
            {isCollapsed ? (
              <Link to="/admin/profile">
                <AiOutlineUser size={20} />
              </Link>
            ) : (
              <span className="text-xl">
                <Link
                  to={`${user?.role}/profile`}
                  className="cursor-pointer flex items-center justify-center text-black"
                >
                  My Profile
                </Link>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={`bg-red-600 text-white text-xl flex items-center justify-center mt-2 ${
            isCollapsed
              ? "w-12 h-12 rounded-full"
              : "py-2 px-4 w-full rounded-lg"
          }`}
        >
          {isCollapsed ? (
            <MdLogout />
          ) : (
            <span className="flex gap-1 items-center text-xl">
              <MdLogout /> Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
