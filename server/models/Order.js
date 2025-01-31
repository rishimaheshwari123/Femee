const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const orderSchema = new mongoose.Schema(
  {

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Memeber",
      required: true,
    },
    shippingInfo: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      other: {
        type: String,
      },
      pincode: {
        type: Number,
        required: true,
      },
    },
    paymentInfo: {
      utr: {
        type: String,
        required: true,
      },

    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },

      },
    ],
    paidAt: {
      type: Date,
      default: Date.now(),
    },
    month: {
      type: Number,
      default: new Date().getMonth(),
    },
    totalPrice: {
      type: String,
      required: true,
    },

    orderStatus: {
      type: String,
      enum: ['Ordered', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Ordered',
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Order", orderSchema);
