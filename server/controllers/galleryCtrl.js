const galleryModel = require("../models/gallery")
const createGalleryCtrl = async (req, res) => {
    try {
        const { images } = req.body;
        const imageArray = typeof images === 'string' ? JSON.parse(images) : images;

        if (!imageArray) {
            return res.status(400).json({
                success: false,
                message: "Please Provide All Fields"
            });
        }

        const gallery = await galleryModel.create({
            images: imageArray
        });

        return res.status(201).json({
            success: true,
            message: "Gallery created successfully!",
            gallery
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in creating gallery"
        });
    }
}




const getAllGalleryCtrl = async (req, res) => {
    try {
        const gallerys = await galleryModel.find({});
        return res.status(200).json({
            totalGallery: gallerys.length,
            success: true,
            gallerys,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Error in getting all gallery"
        })
    }
}
const deleteGalleryCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        await galleryModel.findByIdAndDelete(id)
        return res.status(200).json({
            success: true,
            message: "Gallery Deleted successfully!"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Error in deleting gallery"
        })
    }
}
module.exports = { createGalleryCtrl, getAllGalleryCtrl, deleteGalleryCtrl }