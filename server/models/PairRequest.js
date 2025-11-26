const mongoose = require("mongoose");

const pairRequestSchema = new mongoose.Schema(
    {
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Memeber",
            required: true,
        },
        pairNumber: {
            type: Number,
            required: true,
            min: 1,
            max: 4,
            validate: {
                validator: Number.isInteger,
                message: "Pair number must be an integer between 1 and 4",
            },
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        adminNotes: {
            type: String,
            trim: true,
        },
        adminProof: {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            },
        },
    },
    { timestamps: true }
);

// Compound index to prevent duplicate pair submissions
pairRequestSchema.index({ member: 1, pairNumber: 1 }, { unique: true });

module.exports = mongoose.model("PairRequest", pairRequestSchema);
