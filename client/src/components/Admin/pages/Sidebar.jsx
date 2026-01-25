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
import { FaTrophy, FaGift, FaUsers, FaSitemap } from "react-icons/fa";

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
            to: "/admin/get-product",
            icon: <AiFillProduct />,
            label: "Get All Product",
          },
          {
            to: "/admin/get-gallery",
            icon: <GrGallery />,
            label: "Get Gallery",
          },
          {
            to: "/admin/add-product",
            icon: <MdOutlineProductionQuantityLimits />,
            label: "Add Product",
          },

          {
            to: "/admin/add-gallery",
            icon: <FcGallery />,
            label: "Add Gallery",
          },
          {
            to: "/admin/orders",
            icon: <BiPurchaseTag />,
            label: "Orders",
          },
          {
            to: "/admin/pair-requests",
            icon: <FaTrophy className="text-yellow-300" />,
            label: "Pair Requests",
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
          {
            to: "/member/my-orders",
            icon: <BiPurchaseTag />,
            label: "My Orders",
          },
          {
            to: "/member/binary-trees",
            icon: <FaSitemap className="text-purple-300" />,
            label: "Binary Trees",
          },
          // {
          //   to: "/member/pair-rewards",
          //   icon: <FaGift className="text-yellow-300" />,
          //   label: "Pair Rewards",
          // },
          // {
          //   to: "/member/all-members-pairs",
          //   icon: <FaUsers className="text-blue-300" />,
          //   label: "Members with Pairs",
          // },
        ]
      : []),
  ];

  return (
    <div
      ref={sidebarRef}
      className={`fixed h-screen top-0 ${
        isCollapsed ? "w-20" : "w-72"
      } bg-gradient-to-b from-green-600 via-green-700 to-green-800 shadow-2xl transition-all duration-300 z-50 text-white`}
    >
      <div className="flex items-center justify-between p-4 border-b border-green-500/30">
        {/* Logo */}
        <div
          className={`${isCollapsed ? "hidden" : "flex items-center gap-3"} font-bold text-xl`}
        >
          <img
            src={logo}
            alt="Logo"
            className="w-12 h-12 object-cover rounded-full ring-2 ring-white/50"
          />
          <span className="text-white font-semibold">FemmeCure</span>
        </div>

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-none w-10 h-10 flex justify-center items-center cursor-pointer text-white rounded-lg transition-all duration-200"
        >
          {isCollapsed ? <CiMenuFries size={22} /> : <RxCross1 size={22} />}
        </button>
      </div>

      {/* Navigation Links */}
      <ul className="list-none flex flex-col p-3 mb-14 overflow-y-auto max-h-[65vh] scrollbar-hide space-y-1">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center py-3 px-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-white text-green-700 shadow-lg" 
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <div className={`text-2xl ${isCollapsed ? "mx-auto" : ""}`}>
              {item.icon}
            </div>
            <span
              className={`ml-4 font-medium ${isCollapsed ? "hidden" : "block"}`}
            >
              {item.label}
            </span>
            {!isCollapsed && (
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            )}
          </NavLink>
        ))}
      </ul>

      {/* User and Logout Section */}
      <div className="absolute bottom-4 left-3 right-3 space-y-2">
        <Link
          to={`${user?.role}/profile`}
          className={`flex items-center justify-center w-full transition-all duration-200 ${
            isCollapsed
              ? "w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 mx-auto"
              : "bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 px-4 rounded-xl"
          }`}
        >
          <div className="cursor-pointer flex items-center justify-center text-white">
            {isCollapsed ? (
              <AiOutlineUser size={24} />
            ) : (
              <div className="flex items-center gap-3 w-full">
                <AiOutlineUser size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-sm">My Profile</p>
                  <p className="text-xs text-white/70">{user?.userName}</p>
                </div>
              </div>
            )}
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className={`bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 ${
            isCollapsed
              ? "w-14 h-14 rounded-full mx-auto"
              : "py-3 px-4 w-full rounded-xl"
          }`}
        >
          {isCollapsed ? (
            <MdLogout size={24} />
          ) : (
            <span className="flex gap-2 items-center font-semibold">
              <MdLogout size={20} /> Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
