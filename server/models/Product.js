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
    },
    // SEO Fields
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    keywords: {
      type: String,
    },
    tags: {
      type: String,
    },
    
    // Binary tree configuration for this product
    binaryConfig: {
      rootMemberId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Memeber",
        required: false, // Not required - each member has their own ROOT in productBinaryTrees
        validate: {
          validator: async function(value) {
            if (!value) return true; // Allow null/undefined
            const Member = mongoose.model("Memeber");
            const member = await Member.findById(value);
            return !!member;
          },
          message: "Root member must exist in the database"
        }
      },
      matchingPercentage: {
        Bronze: { type: Number, default: 10 },
        Silver: { type: Number, default: 12 },
        Gold: { type: Number, default: 15 },
        Platinum: { type: Number, default: 18 },
        Diamond: { type: Number, default: 20 },
        "Blue Diamond": { type: Number, default: 22 }
      },
      isActive: { type: Boolean, default: true },
      totalMembers: { type: Number, default: 0 },
      totalVolume: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Product", productSchema);
