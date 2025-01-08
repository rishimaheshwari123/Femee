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
            enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond","Blue Diamond"],
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


        token: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Memeber", memeberSchema);