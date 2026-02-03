/**
 * ALML Achievement Model
 * Separate schema to track achievements without modifying binary tree
 */

const mongoose = require("mongoose");

const almlAchievementSchema = new mongoose.Schema(
  {
    // Member who owns this achievement
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Memeber",
      required: true
    },
    
    // Product for which achievement is tracked
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    
    // ROOT number
    rootNumber: {
      type: Number,
      required: true
    },
    
    // Achievement Steps (5 steps)
    steps: [
      {
        step: { type: Number, required: true }, // 1, 2, 3, 4, 5
        requiredMembers: { type: Number, required: true }, // 2, 4, 8, 16, 32
        currentMembers: { type: Number, default: 0 },
        bonusAmount: { type: Number, required: true }, // 600, 600, 800, 800, 1600
        isComplete: { type: Boolean, default: false },
        completedAt: { type: Date }
      }
    ],
    
    // Summary
    totalSteps: { type: Number, default: 5 },
    completedSteps: { type: Number, default: 0 },
    totalBonusAmount: { type: Number, default: 4400 },
    
    // Claim Status
    allStepsComplete: { type: Boolean, default: false },
    isClaimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
    claimedAmount: { type: Number, default: 0 },
    
    // Metadata
    lastUpdated: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETE', 'CLAIMED'],
      default: 'ACTIVE'
    }
  },
  { timestamps: true }
);

// Compound index for fast lookups
almlAchievementSchema.index({ memberId: 1, productId: 1, rootNumber: 1 }, { unique: true });
almlAchievementSchema.index({ memberId: 1, isClaimed: 1 });
almlAchievementSchema.index({ allStepsComplete: 1, isClaimed: 1 });

module.exports = mongoose.model("ALMLAchievement", almlAchievementSchema);
