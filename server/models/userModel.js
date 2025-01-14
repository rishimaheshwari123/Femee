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


        address: {

            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["user"],
            default: "user",
        },


        token: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("user", memeberSchema);