const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    highPrice: {
      type: Number,
      required: true,
    },

    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    sizes: {
      type: String,
    }

    ,

  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Product", productSchema);
