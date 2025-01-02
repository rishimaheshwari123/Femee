import React, { useEffect, useState } from "react";
import { getMembersProfileApi } from "../../../services/operations/memeber";
import { useSelector } from "react-redux";

const GetAllSubMembers = () => {
  const { user } = useSelector((state) => state.auth);
  const [childMembers, setChildMembers] = useState([]);

  const getMember = async () => {
    try {
      const response = await getMembersProfileApi(user?._id);
      setChildMembers(response);
      console.log(response);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  useEffect(() => {
    getMember();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Child Members</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">First Name</th>
              <th className="border border-gray-300 px-4 py-2">Last Name</th>
              <th className="border border-gray-300 px-4 py-2">Username</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Phone</th>
              <th className="border border-gray-300 px-4 py-2">Address</th>
              <th className="border border-gray-300 px-4 py-2">Role</th>
              <th className="border border-gray-300 px-4 py-2">Created At</th>
              <th className="border border-gray-300 px-4 py-2">Sub Child</th>
            </tr>
          </thead>
          <tbody>
            {childMembers?.child?.map((child, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {child?.fName || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {child?.lName || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {child?.userName || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {child?.email || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {child?.phone || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {child?.address || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {child?.role || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(child?.createdAt)?.toLocaleString() || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {child?.child.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GetAllSubMembers;
