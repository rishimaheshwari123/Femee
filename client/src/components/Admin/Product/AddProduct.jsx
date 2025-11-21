import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaImage, FaTimes, FaPlus, FaTag, FaSearch } from "react-icons/fa";
import Dropzone from "react-dropzone";
import { useSelector } from "react-redux";
import { imageUpload, createProduct } from "../../../services/operations/admin";
import { Card, Button, Input, Alert } from "../../ui";

function AddProduct() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const uploadImage = async (acceptedFiles) => {
    try {
      setUploading(true);
      const response = await imageUpload(acceptedFiles);
      const uploadedImages = response?.map((image) => ({
        public_id: image.asset_id,
        url: image.url,
      }));
      setImages((prevImages) => [...prevImages, ...uploadedImages]);
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (publicId) => {
    setImages(images.filter((image) => image.public_id !== publicId));
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(3, "Title must be at least 3 characters")
      .required("Title is required"),
    description: Yup.string()
      .min(10, "Description must be at least 10 characters")
      .required("Description is required"),
    price: Yup.number()
      .positive("Price must be positive")
      .required("Price is required"),
    highPrice: Yup.number()
      .positive("High price must be positive")
      .min(Yup.ref('price'), "High price must be greater than or equal to price")
      .required("High price is required"),
    sizes: Yup.string().required("Sizes are required"),
    slug: Yup.string().required("Slug is required"),
    metaTitle: Yup.string(),
    metaDescription: Yup.string(),
    keywords: Yup.string(),
    tags: Yup.string(),
  });

  const initialValues = {
    title: "",
    description: "",
    price: "",
    highPrice: "",
    sizes: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    tags: "",
  };

  const onSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      if (images.length === 0) {
        alert("Please upload at least one image");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("price", values.price);
      formData.append("highPrice", values.highPrice);
      formData.append("sizes", values.sizes);
      formData.append("slug", values.slug);
      formData.append("metaTitle", values.metaTitle || values.title);
      formData.append("metaDescription", values.metaDescription || values.description);
      formData.append("keywords", values.keywords);
      formData.append("tags", values.tags);
      formData.append("images", JSON.stringify(images));

      await createProduct(formData, token);
      resetForm();
      setImages([]);
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
    validationSchema,
  });

  // Auto-generate slug when title changes
  React.useEffect(() => {
    if (formik.values.title && !formik.touched.slug) {
      formik.setFieldValue('slug', generateSlug(formik.values.title));
    }
  }, [formik.values.title]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-dark-900 mb-2">
            Add New Product
          </h1>
          <p className="text-dark-600">
            Create a new product with SEO optimization
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <Card.Header>
              <Card.Title>Basic Information</Card.Title>
            </Card.Header>
            <Card.Body className="space-y-6">
              <Input
                label="Product Title"
                type="text"
                id="title"
                name="title"
                placeholder="Enter product name"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && formik.errors.title}
                required
              />

              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter detailed product description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows="5"
                  className="w-full px-4 py-3 border-2 border-dark-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 hover:border-dark-300"
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="mt-2 text-sm text-red-500">{formik.errors.description}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Member Price"
                  type="number"
                  id="price"
                  name="price"
                  placeholder="₹ 0"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.price && formik.errors.price}
                  required
                />

                <Input
                  label="Regular Price (MRP)"
                  type="number"
                  id="highPrice"
                  name="highPrice"
                  placeholder="₹ 0"
                  value={formik.values.highPrice}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.highPrice && formik.errors.highPrice}
                  required
                />
              </div>

              <Input
                label="Available Sizes"
                type="text"
                id="sizes"
                name="sizes"
                placeholder="S, M, L, XL, XXL"
                value={formik.values.sizes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sizes && formik.errors.sizes}
                helperText="Separate sizes with commas"
                required
              />
            </Card.Body>
          </Card>

          {/* SEO Settings */}
          <Card variant="gradient">
            <Card.Header>
              <div className="flex items-center gap-2">
                <FaSearch className="text-primary-600" />
                <Card.Title>SEO Settings</Card.Title>
              </div>
              <Card.Description>
                Optimize your product for search engines
              </Card.Description>
            </Card.Header>
            <Card.Body className="space-y-6">
              <Input
                label="URL Slug"
                type="text"
                id="slug"
                name="slug"
                placeholder="product-url-slug"
                value={formik.values.slug}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.slug && formik.errors.slug}
                helperText="Auto-generated from title, but you can customize it"
                required
              />

              <Input
                label="Meta Title"
                type="text"
                id="metaTitle"
                name="metaTitle"
                placeholder="SEO title for search engines"
                value={formik.values.metaTitle}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                helperText="Leave empty to use product title"
              />

              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  placeholder="SEO description for search engines (150-160 characters)"
                  value={formik.values.metaDescription}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-dark-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-dark-500">
                  {formik.values.metaDescription.length}/160 characters
                </p>
              </div>

              <Input
                label="Keywords"
                type="text"
                id="keywords"
                name="keywords"
                placeholder="keyword1, keyword2, keyword3"
                value={formik.values.keywords}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                icon={<FaTag />}
                helperText="Separate keywords with commas"
              />

              <Input
                label="Tags"
                type="text"
                id="tags"
                name="tags"
                placeholder="tag1, tag2, tag3"
                value={formik.values.tags}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                icon={<FaTag />}
                helperText="Product tags for categorization"
              />
            </Card.Body>
          </Card>

          {/* Product Images */}
          <Card>
            <Card.Header>
              <div className="flex items-center gap-2">
                <FaImage className="text-primary-600" />
                <Card.Title>Product Images</Card.Title>
              </div>
              <Card.Description>
                Upload high-quality product images
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <Dropzone onDrop={uploadImage} accept={{ 'image/*': [] }}>
                {({ getRootProps, getInputProps, isDragActive }) => (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                      isDragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-dark-300 hover:border-primary-400 hover:bg-dark-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <FaImage className="text-5xl text-dark-400 mx-auto mb-4" />
                    {uploading ? (
                      <p className="text-dark-600">Uploading...</p>
                    ) : isDragActive ? (
                      <p className="text-primary-600 font-semibold">Drop images here...</p>
                    ) : (
                      <>
                        <p className="text-dark-700 font-semibold mb-2">
                          Drag & drop images here, or click to select
                        </p>
                        <p className="text-sm text-dark-500">
                          Supports: JPG, PNG, WEBP (Max 5MB each)
                        </p>
                      </>
                    )}
                  </div>
                )}
              </Dropzone>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-40 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.public_id)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                      >
                        <FaTimes />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting || uploading}
            >
              {formik.isSubmitting ? "Creating Product..." : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                formik.resetForm();
                setImages([]);
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
