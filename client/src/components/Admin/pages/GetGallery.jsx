import React, { useEffect, useState } from "react";
import {
  getAllGalleryApi,
  deleteGalleryApi,
} from "../../../services/operations/memeber";
import { RiDeleteBinFill } from "react-icons/ri";

const GetGallery = () => {
  const [gallery, setGallery] = useState([]);

  const getGallery = async () => {
    try {
      const response = await getAllGalleryApi();
      setGallery(response); // Corrected typo
      console.log(response);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGalleryApi(id);
      setGallery(gallery.filter((currElem) => currElem._id !== id)); // Removing the deleted image from the state
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  useEffect(() => {
    getGallery();
  }, []);

  return (
    <div>
      {gallery.length === 0 ? (
        <p className="text-center text-xl text-gray-500">No gallery found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {gallery?.map((item) =>
            item.images?.map((currElem, index) => (
              <div key={`${item._id}-${index}`} className="relative">
                <img
                  src={currElem?.url}
                  className="w-full h-auto object-cover rounded-lg z-0"
                  alt="Gallery"
                />
                <RiDeleteBinFill
                  className="absolute top-0 right-0 text-3xl cursor-pointer z-50 text-red-500 hover:text-red-700 transition-all duration-300 ease-in-out transform hover:scale-110"
                  onClick={() => handleDelete(item._id)}
                  aria-label="Delete Image"
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default GetGallery;
