import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Dropzone from "react-dropzone";
import {
  imageUpload,
  memberRegistrationApi,
} from "../services/operations/memeber";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaMapMarkerAlt, FaUserPlus, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle, FaImage } from "react-icons/fa";

function BecomeMembers() {
  const { userName } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referrerNotFound, setReferrerNotFound] = useState(false);
  const [manualReferralCode, setManualReferralCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Decode username (handle / and other special characters)
  const decodedUserName = userName ? decodeURIComponent(userName) : null;

  // Fetch referrer details
  useEffect(() => {
    const fetchReferrerDetails = async () => {
      const referralUsername = decodedUserName || manualReferralCode;
      
      if (!referralUsername) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/auth/username/${encodeURIComponent(referralUsername)}`
        );
        const data = await response.json();
        
        if (data.success && data.member) {
          setReferrerInfo({
            id: data.member.id,
            name: data.member.name,
            userName: data.member.userName,
            email: data.member.email,
          });
          setReferrerNotFound(false);
        } else {
          setReferrerNotFound(true);
          toast.error(`Referrer "${referralUsername}" not found`);
        }
      } catch (error) {
        console.error("Error fetching referrer:", error);
        toast.error("Failed to verify referrer");
        setReferrerNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrerDetails();
  }, [decodedUserName, manualReferralCode]);

  const uploadImage = async (acceptedFiles) => {
    const response = await imageUpload(acceptedFiles);
    const uploadedImages = response?.map((image) => ({
      public_id: image.asset_id,
      url: image.url,
    }));
    setImages((prevImages) => [...prevImages, ...uploadedImages]);
  };

  const removeImage = (publicId) => {
    const updatedImages = images.filter(
      (image) => image.public_id !== publicId
    );
    setImages(updatedImages);
  };

  // Validation schema
  const validationSchema = Yup.object({
    fName: Yup.string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters"),
    lName: Yup.string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters"),
    userName: Yup.string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters")
      .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
      .required("Phone number is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    address: Yup.string()
      .required("Address is required")
      .min(10, "Address must be at least 10 characters"),
  });

  // Initial values
  const initialValues = {
    fName: "",
    lName: "",
    userName: "",
    email: "",
    phone: "",
    password: "",
    images: [],
    address: "",
    parent: decodedUserName || manualReferralCode,
  };

  const onSubmit = async (values, { resetForm }) => {
    if (decodedUserName && referrerNotFound) {
      toast.error("Invalid referrer. Please use a valid referral link.");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fName", values.fName);
      formData.append("lName", values.lName);
      formData.append("userName", values.userName);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("password", values.password);
      formData.append("address", values.address);
      formData.append("parent", values.parent || "");
      formData.append("images", JSON.stringify(images));

      const result = await memberRegistrationApi(formData);
      
      if (result) {
        resetForm();
        setImages([]);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Form Submission Error:", error.message);
    }
  };

  // Formik
  const formik = useFormik({
    initialValues,
    onSubmit,
    validationSchema,
  });

  // Handle username input - convert spaces to underscores and remove special characters
  const handleUsernameChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\s+/g, '_');
    value = value.replace(/[^a-zA-Z0-9_]/g, '');
    formik.setFieldValue('userName', value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4">
            <FaUserPlus className="text-white text-4xl" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
            Become a Member
          </h1>
          <p className="text-gray-600 text-lg">Join our community today</p>
          <div className="flex items-center justify-center mt-4">
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
          </div>
        </div>

        {/* Referrer Information Card */}
        {loading ? (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <p className="text-blue-600 font-medium">Verifying referrer...</p>
            </div>
          </div>
        ) : referrerInfo ? (
          <div className="mb-8 p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-xl border-2 border-green-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <FaCheckCircle className="text-white text-2xl" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium mb-1">Referred By</p>
                  <h3 className="text-2xl font-bold text-green-900">{referrerInfo.name}</h3>
                  <p className="text-green-700 font-medium mt-1">@{referrerInfo.userName}</p>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 border border-green-300">
                  <p className="text-green-700 font-semibold text-sm">✓ Verified</p>
                </div>
              </div>
            </div>
          </div>
        ) : referrerNotFound ? (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl shadow-lg border-2 border-red-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <FaTimesCircle className="text-white text-2xl" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-800 mb-2">
                  Invalid Referral Link
                </h3>
                <p className="text-red-700">
                  The referrer <span className="font-semibold">"{decodedUserName}"</span> could not be found. 
                  Please contact your referrer for a valid registration link.
                </p>
              </div>
            </div>
          </div>
        ) : decodedUserName ? (
          <div className="mb-8 p-6 bg-yellow-50 rounded-2xl shadow-lg border border-yellow-200">
            <p className="text-yellow-700 text-center font-medium">
              Referrer information not available
            </p>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-gray-50 rounded-2xl shadow-lg border border-gray-200">
            <p className="text-gray-700 text-center font-medium">
              No referrer specified. You can register without a referral.
            </p>
          </div>
        )}

        {/* Manual Referral Code Input */}
        {!decodedUserName && !referrerInfo && (
          <div className="mb-8">
            {!showManualInput ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowManualInput(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-md"
                >
                  <span>📝</span>
                  <span>Have a Referral Code? Enter Manually</span>
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Enter Referral Code</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={manualReferralCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
                      setManualReferralCode(value);
                    }}
                    placeholder="Enter referrer username"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (manualReferralCode.trim()) {
                        setLoading(true);
                        // Trigger useEffect by updating state
                      } else {
                        toast.error("Please enter a referral code");
                      }
                    }}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                  >
                    Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualInput(false);
                      setManualReferralCode("");
                      setReferrerInfo(null);
                      setReferrerNotFound(false);
                    }}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {referrerNotFound && decodedUserName && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-700 font-medium">
                ⚠️ Registration is disabled due to invalid referral link.
              </p>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="group">
                <label htmlFor="fName" className="block text-sm font-bold text-gray-700 mb-2.5 flex items-center">
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                  First Name <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="fName"
                    name="fName"
                    value={formik.values.fName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={referrerNotFound && decodedUserName}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-medium"
                    placeholder="Enter your first name"
                  />
                </div>
                {formik.touched.fName && formik.errors.fName && (
                  <p className="text-red-500 text-xs mt-2 ml-1 flex items-center">
                    <span className="mr-1">⚠</span> {formik.errors.fName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="group">
                <label htmlFor="lName" className="block text-sm font-bold text-gray-700 mb-2.5 flex items-center">
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                  Last Name <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="lName"
                    name="lName"
                    value={formik.values.lName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={referrerNotFound && decodedUserName}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-medium"
                    placeholder="Enter your last name"
                  />
                </div>
                {formik.touched.lName && formik.errors.lName && (
                  <p className="text-red-500 text-xs mt-2 ml-1 flex items-center">
                    <span className="mr-1">⚠</span> {formik.errors.lName}
                  </p>
                )}
              </div>
            </div>

            {/* Username */}
            <div className="group">
              <label htmlFor="userName" className="block text-sm font-bold text-gray-700 mb-2.5 flex items-center">
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                Username <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-blue-500 font-bold text-lg">@</span>
                </div>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formik.values.userName}
                  onChange={handleUsernameChange}
                  onBlur={formik.handleBlur}
                  disabled={referrerNotFound && decodedUserName}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-medium"
                  placeholder="your_username"
                />
              </div>
              {formik.touched.userName && formik.errors.userName && (
                <p className="text-red-500 text-xs mt-2 ml-1 flex items-center">
                  <span className="mr-1">⚠</span> {formik.errors.userName}
                </p>
              )}
              <div className="mt-2 ml-1 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-1 flex-shrink-0"></span>
                  <span>Only letters, numbers and underscores allowed. Spaces will be auto-converted to underscores.</span>
                </p>
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2.5 flex items-center">
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">4</span>
                  Email Address <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={referrerNotFound && decodedUserName}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-medium"
                    placeholder="your@email.com"
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-xs mt-2 ml-1 flex items-center">
                    <span className="mr-1">⚠</span> {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="group">
                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2.5 flex items-center">
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">5</span>
                  Phone Number <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={referrerNotFound && decodedUserName}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-medium"
                    placeholder="10 digit mobile number"
                    maxLength="10"
                  />
                </div>
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-red-500 text-xs mt-2 ml-1 flex items-center">
                    <span className="mr-1">⚠</span> {formik.errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2.5 flex items-center">
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">6</span>
                Password <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={referrerNotFound && decodedUserName}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-medium"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={referrerNotFound && decodedUserName}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors disabled:cursor-not-allowed"
                >
                  {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs mt-2 ml-1 flex items-center">
                  <span className="mr-1">⚠</span> {formik.errors.password}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="group">
              <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-2.5 flex items-center">
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">7</span>
                Address <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3.5 left-4 pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <textarea
                  id="address"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={referrerNotFound && decodedUserName}
                  rows="3"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md transition-all disabled:bg-gray-100 disabled:cursor-not-allowed resize-none text-gray-800 font-medium"
                  placeholder="Enter your complete address"
                ></textarea>
              </div>
              {formik.touched.address && formik.errors.address && (
                <p className="text-red-500 text-xs mt-2 ml-1 flex items-center">
                  <span className="mr-1">⚠</span> {formik.errors.address}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2.5 flex items-center">
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">8</span>
                Upload Profile Image <span className="text-red-500 ml-1">*</span>
              </label>
              <Dropzone 
                onDrop={uploadImage} 
                disabled={referrerNotFound && decodedUserName}
                accept={{'image/*': ['.png', '.jpg', '.jpeg', '.gif']}}
              >
                {({ getRootProps, getInputProps, isDragActive }) => (
                  <div>
                    <div
                      {...getRootProps()}
                      className={`border-3 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isDragActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                      } ${
                        referrerNotFound && decodedUserName ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <input {...getInputProps()} disabled={referrerNotFound && decodedUserName} />
                      <FaImage className="mx-auto text-4xl text-gray-400 mb-3" />
                      <p className="text-gray-600 font-medium mb-1">
                        {isDragActive ? 'Drop the files here...' : 'Drag & drop images here'}
                      </p>
                      <p className="text-gray-400 text-sm">or click to select files</p>
                    </div>
                    
                    {images.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Images ({images.length})</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {images.map((image) => (
                            <div key={image.public_id} className="relative group">
                              <img
                                src={image.url}
                                alt="Uploaded"
                                className="h-32 w-full object-cover rounded-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(image.public_id)}
                                disabled={referrerNotFound && decodedUserName}
                                className="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 rounded-full hover:bg-red-600 transition-colors shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Dropzone>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={referrerNotFound && decodedUserName}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-green-600 transition-all transform hover:scale-[1.02] disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                <span className="flex items-center justify-center space-x-2">
                  <FaUserPlus />
                  <span>Register as Member</span>
                </span>
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-500 font-semibold hover:text-blue-600 transition-colors"
                >
                  Login here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BecomeMembers;
