import React, { useEffect, useState } from "react";
import {
  getAllMembersApi,
  updateVerifyMembersApi,
  updateTierMembersApi,
  deleteMemberApi,
} from "../../../services/operations/memeber";
import { FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const tiers = [ "Silver", "Gold", "Platinum", "Diamond","Blue Diamond"];

const GetAllMembers = () => {
  const [members, setMembers] = useState([]);
const {user} = useSelector(state=>state.auth)
  const getMember = async () => {
    const response = await getAllMembersApi();
    console.log(response)
    setMembers(
      (response || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    );
  };

  const handleActivate = async (id) => {
    try {
      const updatedMember = await updateVerifyMembersApi(id);
      if (updatedMember) {
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member._id === id ? { ...member, isActive: true } : member
          )
        );
        toast.success("Member activated successfully!");
      }
    } catch (error) {
      toast.error("Failed to activate the member.");
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      const deleted = await deleteMemberApi(id);
      if (deleted) {
        setMembers((prevMembers) =>
          prevMembers.filter((member) => member._id !== id)
        );
        toast.success("Member Account Rejected successfully!");
      }
    } catch (error) {
      toast.error("Failed to delete the member.");
    }
  };

  const handleTierChange = async (id, tier) => {
    try {
      const updatedMember = await updateTierMembersApi(id, tier);
      if (updatedMember) {
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member._id === id ? { ...member, tier } : member
          )
        );
        toast.success(`Tier updated to ${tier} successfully!`);
      }
    } catch (error) {
      toast.error("Failed to update the tier.");
    }
  };

  useEffect(() => {
    getMember();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Members</h1>
      <div className="overflow-x-auto max-h-[80vh]">
        <table className="table-auto w-full border-collapse border border-gray-300 ">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">First Name</th>
              <th className="border border-gray-300 px-4 py-2">Last Name</th>
              <th className="border border-gray-300 px-4 py-2">Username</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Phone</th>
              <th className="border border-gray-300 px-4 py-2">Address</th>
              <th className="border border-gray-300 px-4 py-2">Tier</th>
              <th className="border border-gray-300 px-4 py-2">Active</th>
              <th className="border border-gray-300 px-4 py-2">Created At</th>
              <th className="border border-gray-300 px-4 py-2">
                Under Members
              </th>
             {user?.role ==="admin" && <th className="border border-gray-300 px-4 py-2">
                Senior Name
              </th>}
            </tr>
          </thead>
          <tbody>
            {members?.map((member, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4  py-2">
                  {member?.fName || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {member?.lName || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {member?.userName || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {member?.email || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {member?.phone || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {member?.address || "N/A"}
                </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                  <select
                    value={member?.tier || "N/A"}
                    onChange={(e) =>
                      handleTierChange(member._id, e.target.value)
                    }
                    className="border border-gray-300 rounded p-1"
                  >
                    {tiers.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {member?.isActive ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <>
                        <button
                          onClick={() => handleActivate(member._id)}
                          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(member._id)}
                          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(member?.createdAt)?.toLocaleString() || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {member?.child?.length}
                </td>
             {user?.role ==="admin" &&   <td className="border border-gray-300 px-4 py-2">
                  {member?.parent?.fName} {member?.parent?.lName}
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GetAllMembers;
