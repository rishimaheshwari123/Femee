const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
const transactionSchema = new mongoose.Schema(
  {
    memberId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Memeber", 
      required: true 
    },
    
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    },
    
    transactionType: {
      type: String,
      enum: ['matching_bonus', 'direct_referral', 'withdrawal', 'adjustment', 'alml_claim'],
      required: true
    },
    
    amount: { 
      type: Number, 
      required: true 
    },
    
    description: { 
      type: String 
    },
    
    // For matching bonus transactions
    matchingDetails: {
      leftVolume: { type: Number },
      rightVolume: { type: Number },
      matchedVolume: { type: Number },
      matchingPercentage: { type: Number },
      carryForwardLeft: { type: Number },
      carryForwardRight: { type: Number }
    },
    
    // For ALML claim transactions
    almlDetails: {
      rootNumber: { type: Number },
      completedSteps: { type: Number },
      claimedAt: { type: Date }
    },
    
    // Reference to related order (if applicable)
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order" 
    },
    
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    },
    
    balanceBefore: { 
      type: Number 
    },
    balanceAfter: { 
      type: Number 
    }
  },
  { timestamps: true }
);

// Create indexes for efficient queries
transactionSchema.index({ memberId: 1 });
transactionSchema.index({ productId: 1 });
transactionSchema.index({ memberId: 1, productId: 1 });

// Export the model
module.exports = mongoose.model("Transaction", transactionSchema);
