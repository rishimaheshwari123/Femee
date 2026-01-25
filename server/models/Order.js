const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    sequenceNumber: {
      type: Number,
      unique: true,
      required: true,
    },
    internalNumber: {
      type: String,
      required: true,
    },
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
      phone1: {
        type: Number,
        required: true,
      },
      phone2: {
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
        price: {
          type: Number,
          required: true,
        },
        
        // Referral tracking per product
        referrerId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Memeber" 
        },
        isFirstPurchase: { 
          type: Boolean, 
          default: false 
        },
        placedInLeg: { 
          type: String, 
          enum: ['left', 'right', 'none'], 
          default: 'none' 
        }
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
