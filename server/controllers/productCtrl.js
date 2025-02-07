const Product = require("../models/Product");
const validateMongoDbId = require("../utils/validateMongoDbId");

// Controller to create a new product
exports.createProduct = async (req, res) => {
  try {
    // Extracting data from the request body
    const { title, description, price, highPrice, sizes } = req.body;

    const imagesArray = JSON.parse(req.body.images);

    if (
      !title ||
      !description ||
      !price ||
      !sizes ||
      !imagesArray
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      });
    }

    // Creating a new product object
    const newProduct = await Product.create({
      title,
      description,
      price,
      highPrice,
      sizes,
      images: imagesArray,
    });

    res.status(200).json({
      success: true,
      newProduct,
      message: "Product Created Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    const allProduct = await Product.find();
    res.status(200).json({
      success: true,
      allProduct,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const { productID } = req.body;
    validateMongoDbId(productID);
    const productDetails = await Product.findOne({
      _id: productID,
    });
    // .populate("ratingAndReviews").exec()

    if (!productDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${productID}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        productDetails,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {

    const { id } = req.body;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete product",
        error: error.message,
      });
  }
};
