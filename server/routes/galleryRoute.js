const express = require("express")
const { createGalleryCtrl, getAllGalleryCtrl, deleteGalleryCtrl } = require("../controllers/galleryCtrl")
const router = express.Router()


router.post("/create", createGalleryCtrl)
router.get("/get", getAllGalleryCtrl)
router.delete("/delete/:id", deleteGalleryCtrl)



module.exports = router


