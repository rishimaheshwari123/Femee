import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { CiMenuFries } from "react-icons/ci";
import { RxCross1 } from "react-icons/rx";
import { AiOutlineUser } from "react-icons/ai";
import { MdLogout } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import logo from "../../../assets/logo.png";
import { memberLogout } from "../../../services/operations/memeber";
import { FcBullish } from "react-icons/fc";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true"
  );
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  // Function to handle logout
  const handleLogout = async () => {
    dispatch(memberLogout(navigate));
  };

  // Function to toggle sidebar collapse
  const handleToggle = () => {
    const collapsed = !isCollapsed;
    setIsCollapsed(collapsed);
    localStorage.setItem("sidebarCollapsed", collapsed.toString());
  };

  // Effect to close sidebar when clicking outside
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

  const navItems = [
    { to: "/", icon: <FaHome />, label: "Back To Home" },
    { to: "/admin/dashboard", icon: <FcBullish />, label: "Dashboard" },
    user?.role === "admin"
      ? { to: "/admin/adminField", icon: <FaHome />, label: "Test For Admin" }
      : null,
    user?.role === "member"
      ? {
          to: "/member/memberField",
          icon: <FaHome />,
          label: "Test For Member",
        }
      : null,
  ];

  return (
    <div
      ref={sidebarRef}
      className={`fixed h-screen top-0 ${
        isCollapsed ? "w-16" : "w-64"
      } bg-gray-900 transition-all duration-300 z-50`}
    >
      <div className="flex items-center justify-between p-4">
        {/* Logo section */}
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
        {/* Toggle button */}
        <button
          onClick={handleToggle}
          className="bg-transparent border-none w-8 h-8 flex justify-center items-center cursor-pointer text-white"
        >
          {isCollapsed ? <CiMenuFries size={22} /> : <RxCross1 size={22} />}
        </button>
      </div>

      {/* Navigation links */}
      <ul className="text-white list-none flex flex-col p-4 mb-14 overflow-y-auto">
        {navItems.map(
          (item, index) =>
            item && (
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
            )
        )}
      </ul>

      {/* User and logout section */}
      <div className="absolute bottom-2 left-2 right-2 overflow-hidden mt-10">
        <div
          className={`flex items-center justify-center w-full ${
            isCollapsed
              ? "w-11 h-11 rounded-full bg-slate-400"
              : "bg-slate-400 py-2 px-4 rounded-lg"
          }`}
        >
          <div
            className={`cursor-pointer flex items-center justify-center text-black ${
              isCollapsed ? "w-10 h-10 rounded-full" : ""
            }`}
          >
            {isCollapsed ? (
              <AiOutlineUser size={20} />
            ) : (
              <span className="text-xl">
                {user?.fName.charAt(0).toUpperCase() + user?.fName.slice(1)}
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
