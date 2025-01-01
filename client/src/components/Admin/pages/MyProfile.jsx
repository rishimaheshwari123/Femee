import React, { useEffect, useState } from "react";
import {
  getMembersProfileApi,
  updateMemberProfileApi,
} from "../../../services/operations/memeber";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { FiEdit } from "react-icons/fi";

const MyProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [member, setMember] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    email: "",
    phone: "",
    address: "",
    acc: "",
    ifsc: "",
    bankName: "",
    sContact: "",
  });

  const fetchMemberProfile = async () => {
    const response = await getMembersProfileApi(user?._id);
    if (response) {
      setMember(response);
      setFormData({
        fName: response.fName || "",
        lName: response.lName || "",
        email: response.email || "",
        phone: response.phone || "",
        address: response.address || "",
        acc: response.acc || "",
        ifsc: response.ifsc || "",
        bankName: response.bankName || "",
        sContact: response.sContact || "",
      });
    } else {
      toast.error("Failed to fetch member profile");
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchMemberProfile();
    }
  }, [user?._id]);

  const handleEditClick = () => {
    setIsEditing(!isEditing); // Toggle editing mode
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedProfile = await updateMemberProfileApi(user?._id, formData);
    if (updatedProfile) {
      toast.success("Profile updated successfully");
      setMember(updatedProfile); // Update local state with the new profile data
      setIsEditing(false); // Exit edit mode
    } else {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Profile</h1>
        <button
          onClick={handleEditClick}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          <FiEdit className="mr-2 text-lg" />{" "}
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Profile Card */}
      {member ? (
        <div className="bg-white shadow-xl rounded-lg p-8 max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col items-center border-b pb-6">
            <img
              src={
                member?.images?.[0]?.url || "https://via.placeholder.com/150"
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover shadow-lg mb-4"
            />
            <h2 className="text-2xl font-semibold text-gray-900">
              {member?.fName} {member?.lName}
            </h2>
            <p className="text-gray-500">@{member?.userName || "N/A"}</p>
          </div>

          {/* Profile Details */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Basic Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-700">First Name:</label>
                  <input
                    type="text"
                    name="fName"
                    value={formData.fName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-gray-700">Last Name:</label>
                  <input
                    type="text"
                    name="lName"
                    value={formData.lName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-gray-700">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-gray-700">Phone:</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-gray-700">Address:</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Additional Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-700">Account Number:</label>
                  <input
                    type="text"
                    name="acc"
                    value={formData.acc}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-gray-700">IFSC Code:</label>
                  <input
                    type="text"
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-gray-700">Bank Name:</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-gray-700">Secondary Contact:</label>
                  <input
                    type="text"
                    name="sContact"
                    value={formData.sContact}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[300px]">
          <p className="text-gray-600">Loading member profile...</p>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
