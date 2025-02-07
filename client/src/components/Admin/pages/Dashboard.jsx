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
    <div className="px-20">
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <p className="font-semibold">Your Link :</p>
        <p className="text-blue-600 break-words text-sm sm:text-base">
          {`https://www.femmecurehelpingher.com/become-member/${user?.userName}`}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
