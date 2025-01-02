const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gallerySchema = new Schema(
    {


        images: [
            {
                public_id: String,
                url: String,
            },
        ],

    },
    { timestamps: true }
);



module.exports = mongoose.model("Gallery", gallerySchema); 
