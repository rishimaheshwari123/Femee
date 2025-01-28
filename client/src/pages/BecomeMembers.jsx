import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Dropzone from "react-dropzone";
import {
  imageUpload,
  memberRegistrationApi,
} from "../services/operations/memeber";
import { useParams } from "react-router-dom";

function BecomeMembers() {
  const { userName } = useParams();
  const [images, setImages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

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
    fName: Yup.string().required("First name is required"),
    lName: Yup.string().required("Last name is required"),
    userName: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    address: Yup.string().required("Address is required"),
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
    parent: userName,
  };

  const onSubmit = async (values, { resetForm }) => {
    try {
      const formData = new FormData();
      formData.append("fName", values.fName);
      formData.append("lName", values.lName);
      formData.append("userName", values.userName);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("password", values.password);
      formData.append("address", values.address);
      formData.append("parent", values.parent);
      formData.append("images", JSON.stringify(images));

      await memberRegistrationApi(formData);

      resetForm();
      setImages([]);
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

  return (
    <div className="max-w-3xl mx-auto p-4 mb-[100px]">
      <div className=" flex flex-col  w-full items-center">
        <h3 className=" text-2xl lg:text-4xl font-semibold   mt-2">
          Become Member
        </h3>
        <br />
        <div className="flex items-center w-[75px]">
          <div className="h-0.5 bg-[#cee21a]"></div>
          <div className="h-1 w-1 bg-[#cee21a] rounded-full mx-1"></div>
          <div className="h-1 w-1 bg-[#cee21a] rounded-full mx-1"></div>
          <div className="h-1 w-1 bg-[#cee21a] rounded-full mx-1"></div>
          <div
            className="h-[4px] rounded-full w-[10px] flex-grow"
            style={{ backgroundColor: "#cee21a" }}
          ></div>
        </div>
                  
      </div>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* First Name */}
        <div>
          <label htmlFor="fName" className="block font-medium text-gray-700">
            First Name *
          </label>
          <input
            type="text"
            id="fName"
            name="fName"
            value={formik.values.fName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border p-2 rounded"
          />
          {formik.touched.fName && formik.errors.fName && (
            <p className="text-red-500 text-sm">{formik.errors.fName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lName" className="block font-medium text-gray-700">
            Last Name *
          </label>
          <input
            type="text"
            id="lName"
            name="lName"
            value={formik.values.lName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border p-2 rounded"
          />
          {formik.touched.lName && formik.errors.lName && (
            <p className="text-red-500 text-sm">{formik.errors.lName}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label htmlFor="userName" className="block font-medium text-gray-700">
            Username *
          </label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formik.values.userName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border p-2 rounded"
          />
          {formik.touched.userName && formik.errors.userName && (
            <p className="text-red-500 text-sm">{formik.errors.userName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border p-2 rounded"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-sm">{formik.errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block font-medium text-gray-700">
            Phone *
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border p-2 rounded"
          />
          {formik.touched.phone && formik.errors.phone && (
            <p className="text-red-500 text-sm">{formik.errors.phone}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {formik.errors.password}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block font-medium text-gray-700">
            Address *
          </label>
          <textarea
            id="address"
            name="address"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border p-2 rounded"
          ></textarea>
          {formik.touched.address && formik.errors.address && (
            <p className="text-red-500 text-sm">{formik.errors.address}</p>
          )}
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label htmlFor="images" className="block font-medium text-gray-700">
            Upload Image *
          </label>
          <Dropzone onDrop={uploadImage}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed p-4 text-center cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
                <aside className="mt-4">
                  <h4>Uploaded Images</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {images?.map((image) => (
                      <div key={image.public_id} className="relative">
                        <img
                          src={image.url}
                          alt="Uploaded"
                          className="h-24 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.public_id)}
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                </aside>
              </section>
            )}
          </Dropzone>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-5 mx-auto flex  rounded hover:bg-blue-600"
        >
          Register Member
        </button>
      </form>
    </div>
  );
}

export default BecomeMembers;
