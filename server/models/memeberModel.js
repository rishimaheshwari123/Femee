const mongoose = require("mongoose");

const memeberSchema = new mongoose.Schema(
    {
        fName: {
            type: String,
            required: true,
            trim: true,
        },
        lName: {
            type: String,
            required: true,
            trim: true,
        },
        userName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
        },
        phone: {
            type: Number,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },

        images: [
            {
                public_id: String,
                url: String,
            },
        ],
        address: {

            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["member", "admin"],
            default: "member",
        },
        tier: {
            type: String,
            enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Blue Diamond"],
            default: "Bronze",
            required: true,
        },


        acc: {
            type: String,
            trim: true,
        },
        ifsc: {
            type: String,
            trim: true,
        },
        bankName: {
            type: String,
            trim: true,

        },
        bankHolderName: {
            type: String,
            trim: true,
        },
        sContact: {
            type: Number,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: false
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Memeber"
        },
        child: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Memeber"
        }],

        // Product-wise binary trees with ROOT system
        productBinaryTrees: [{
            productId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Product",
                required: true 
            },
            
            // Multiple ROOTs for this product (each ROOT = 5 levels = 31 members max)
            roots: [{
                rootNumber: { type: Number, required: true }, // 1, 2, 3, etc.
                status: { 
                    type: String, 
                    enum: ['ACTIVE', 'COMPLETE', 'LOCKED'],
                    default: 'ACTIVE'
                },
                
                // Binary tree structure for this ROOT
                binaryPosition: {
                    leftLeg: [{
                        memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Memeber" },
                        joinedAt: { type: Date, default: Date.now },
                        level: { type: Number }, // 1-5
                        position: { type: String } // 'L', 'LL', 'LLL', etc.
                    }],
                    rightLeg: [{
                        memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Memeber" },
                        joinedAt: { type: Date, default: Date.now },
                        level: { type: Number }, // 1-5
                        position: { type: String } // 'R', 'RR', 'RRR', etc.
                    }],
                    
                    // Current cycle volumes
                    leftVolume: { type: Number, default: 0 },
                    rightVolume: { type: Number, default: 0 },
                    
                    // Carry forward from previous cycles
                    carryForward: {
                        left: { type: Number, default: 0 },
                        right: { type: Number, default: 0 }
                    },
                    
                    // Statistics
                    totalMatchedPairs: { type: Number, default: 0 },
                    totalMatchingBonus: { type: Number, default: 0 },
                    lastMatchingDate: { type: Date }
                },
                
                // Level-wise tracking (for UI display)
                // ROOT is excluded from level counting
                // Only Level 1 is used in new logic (ROOT's direct children)
                levels: {
                    level1: { filled: { type: Number, default: 0 }, capacity: { type: Number, default: 2 } },  // ROOT's children - ONLY LEVEL USED
                    level2: { filled: { type: Number, default: 0 }, capacity: { type: Number, default: 4 } },  // Not used
                    level3: { filled: { type: Number, default: 0 }, capacity: { type: Number, default: 8 } },  // Not used
                    level4: { filled: { type: Number, default: 0 }, capacity: { type: Number, default: 16 } }, // Not used
                    level5: { filled: { type: Number, default: 0 }, capacity: { type: Number, default: 32 } }  // Not used
                },
                
                totalMembers: { type: Number, default: 0 }, // Current count in this ROOT (excluding ROOT member)
                maxCapacity: { type: Number, default: 2 }, // Only 2 positions per ROOT (left + right)
                createdAt: { type: Date, default: Date.now },
                completedAt: { type: Date }
            }],
            
            // Current active ROOT number
            currentActiveRoot: { type: Number, default: 1 },
            
            // Purchase history for this product
            purchases: [{
                orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
                amount: { type: Number, required: true },
                quantity: { type: Number, default: 1 },
                purchaseDate: { type: Date, default: Date.now },
                referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "Memeber" },
                isFirstPurchase: { type: Boolean, default: false },
                rootNumber: { type: Number } // Which ROOT this purchase belongs to
            }],
            
            // Product-specific stats
            totalPurchases: { type: Number, default: 0 },
            totalSpent: { type: Number, default: 0 },
            firstPurchaseDate: { type: Date },
            lastPurchaseDate: { type: Date },
            isActive: { type: Boolean, default: false },
            
            // Referral stats for this product
            directReferrals: { type: Number, default: 0 },
            totalDownline: { type: Number, default: 0 }
        }],
        
        // Overall wallet and earnings
        wallet: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 },

        // Product Set Number Tracking
        productSetNumbers: [{
            productId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Product",
                required: true 
            },
            setNumber: { 
                type: Number, 
                required: true 
            },
            lastOrderDate: { 
                type: Date, 
                default: Date.now 
            }
        }],

        token: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Create indexes for efficient queries
memeberSchema.index({ "productBinaryTrees.productId": 1 });
memeberSchema.index({ "productBinaryTrees.roots.rootNumber": 1 });
memeberSchema.index({ "productBinaryTrees.currentActiveRoot": 1 });

module.exports = mongoose.model("Memeber", memeberSchema);