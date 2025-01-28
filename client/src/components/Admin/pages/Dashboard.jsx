import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaNewspaper,
  FaChartBar,
  FaListAlt,
  FaTags,
} from "react-icons/fa";
import axios from "axios";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVisits: 0,
    totalNews: 0,
    totalCategories: 0,
    totalSubCategories: 0,
  });
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/dashboard`);
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard statistics", error);
      }
    };

    fetchStats();
  }, []);

  const data = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <FaUsers className="text-3xl" />,
      bgColor: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
    },
    {
      title: "Total Visits",
      value: stats.totalVisits,
      icon: <FaChartBar className="text-3xl" />,
      bgColor: "bg-red-500",
      hoverColor: "hover:bg-red-600",
    },
    {
      title: "Total News",
      value: stats.totalNews,
      icon: <FaNewspaper className="text-3xl" />,
      bgColor: "bg-green-500",
      hoverColor: "hover:bg-green-600",
    },
    {
      title: "Total Categories",
      value: stats.totalCategories,
      icon: <FaListAlt className="text-3xl" />,
      bgColor: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
    },
    {
      title: "Total Subcategories",
      value: stats.totalSubCategories,
      icon: <FaTags className="text-3xl" />,
      bgColor: "bg-yellow-500",
      hoverColor: "hover:bg-yellow-600",
    },
  ];

  return (
    <div className="p-4">
      {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {data.map((item, index) => (
          <div
            key={index}
            className={`${item.bgColor} ${item.hoverColor} flex flex-col items-center p-4 shadow-lg rounded-lg transition duration-300 ease-in-out transform hover:scale-105 text-white`}
          >
            <div className="mb-2">{item.icon}</div>
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-2xl">{item.value}</p>
          </div>
        ))}
      </div> */}
      <div className="flex gap-5 items-center">
        <p>Your Link :</p>
        <p>{`https://www.femmecurehelpingher.com/become-member/${user?.userName}`}</p>
      </div>
    </div>
  );
};

export default Dashboard;
