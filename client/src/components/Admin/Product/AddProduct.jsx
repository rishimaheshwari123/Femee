import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import { imageUpload } from "../../../services/operations/admin";
import Dropzone from "react-dropzone";
import { createProduct } from "../../../services/operations/admin";
import { useSelector } from "react-redux";

function AddProduct() {
  const [images,setImages] = useState([])
  const { token } = useSelector((state) => state.auth);
  // Category Fetch



  const uploadImage = async(acceptedFiles)=>{

    const response = await imageUpload(acceptedFiles)
    console.log(response)

    const uploadedImages = response?.map((image) => ({
        public_id: image.asset_id, // Assuming asset_id contains the public_id
        url: image.url // Assuming url contains the image URL
      }))
      setImages((prevImages) => [...prevImages, ...uploadedImages]);


    

  }

  const removeImage = (publicId) => {
    // Filter out the image with the specified publicId
    const updatedImages = images.filter((image) => image.public_id !== publicId);
    
    // Update the state with the new array of images
    setImages(updatedImages);
  };
  

  // Formik Form Validation Schema
  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
     description: Yup.string().required("Description is required"),
    price: Yup.number().required("Price is required"),
    highPrice: Yup.number().required("High Price is required"),
    quantity: Yup.number().required("Quantity is required"),
    sizes: Yup.string().required("Sizes are required"),
  });

  // Formik Form Initial Values
  const initialValues = {
    title: "",
     description: "",
    price: "",
    highPrice: "",
    quantity: "",
    sizes: "",
    images:[]
  };



  // Formik Form Submission
  const onSubmit = async (values) => {
    const formData = new FormData();
console.log(images)
    // Append other form fields
    formData.append('title', values.title);
  formData.append('description', values.description);
  formData.append('price', values.price);
  formData.append('highPrice', values.highPrice);
  formData.append('quantity', values.quantity);
  formData.append('sizes', values.sizes);
  formData.append('images', JSON.stringify(images));
 
   await createProduct(formData,token)
   console.log(formData)
    // console.log(values);
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
    validationSchema,
  });



  

  return (
    <div className="container mx-auto">

    <div className=" text-center space-y-2 font-bold">
    Add Product
    </div>
      <form onSubmit={formik.handleSubmit} className="product">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            placeholder="Enter Your Product Name"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.title}
            className="form-input mt-1 block w-full  rounded-md border-blue-500 ring ring-blue-200"

          />
          {formik.touched.title && formik.errors.title ? (
            <div className="text-red-500">{formik.errors.title}</div>
          ) : null}
        </div>

      

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            placeholder="Enter Your Product description"

            name="description"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.description}
            className="form-input mt-1 block w-full"
          />
          {formik.touched.description && formik.errors.description ? (
            <div className="text-red-500">{formik.errors.description}</div>
          ) : null}
        </div>

        <div className="mb-4">
          <label htmlFor="price" className="block text-gray-700">
            Price
          </label>
          <input
            id="price"
            placeholder="Enter Your Product Price"

            name="price"
            type="number"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.price}
            className="form-input mt-1 block min-w-full"
          />
          {formik.touched.price && formik.errors.price ? (
            <div className="text-red-500">{formik.errors.price}</div>
          ) : null}
        </div>

    

        <div className="mb-4">
          <label htmlFor="highPrice" className="block text-gray-700">
            High Price
          </label>
          <input
            id="highPrice"
            name="highPrice"
            placeholder="Enter Your Product HighRate"

            type="number"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.highPrice}
            className="form-input mt-1 block min-w-full"
          />
          {formik.touched.highPrice && formik.errors.highPrice ? (
            <div className="text-red-500">{formik.errors.highPrice}</div>
          ) : null}
        </div>

        <div className="mb-4">
          <label htmlFor="quantity" className="block text-gray-700">
            Quantity
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            placeholder="Enter Your Product Quantity"

            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.quantity}
            className="form-input mt-1 block min-w-full"
          />
          {formik.touched.quantity && formik.errors.quantity ? (
            <div className="text-red-500">{formik.errors.quantity}</div>
          ) : null}
        </div>

        <div className="mb-4">
          <label htmlFor="sizes" className="block text-gray-700">
            Sizes
          </label>
          <input
            id="sizes"
            name="sizes"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.sizes}
            className="form-input mt-1 block w-full"
          />
          {formik.touched.sizes && formik.errors.sizes ? (
            <div className="text-red-500">{formik.errors.sizes}</div>
          ) : null}
        </div>







        <div className="bg-white border-2 border-blue-600 mb-[20px] p-[50px] text-center ">
            <Dropzone
              onDrop={(acceptedFiles) => uploadImage(acceptedFiles)}
            >
              {({ getRootProps, getInputProps }) => (
                <section>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>
                      Drag 'n' drop some files here, or click to select files
                    </p>
                  </div>
                </section>
              )}
            </Dropzone>
          </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>



      <div className=" flex gap-10 mt-[50px] flex-wrap">
      {images?.map((image, index) => (
  <div className="relative" key={index}>
    <button
      type="button"
      onClick={() => removeImage(image.public_id)}
      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-md focus:outline-none"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
    <img src={image.url} alt="" className="w-40 h-40 object-cover rounded-lg shadow-md" />
  </div>
))}

      </div>
    </div>
  );
}

export default AddProduct;
