import React, { useEffect, useState } from "react";
import {
  getAllGalleryApi,
  deleteGalleryApi,
} from "../services/operations/memeber";
import { RiDeleteBinFill } from "react-icons/ri";
import SocialMediaBar from "../components/comman/SocialMedia";

const Gallery = () => {
  const [gallery, setGallery] = useState([]);

  const getGallery = async () => {
    try {
      const response = await getAllGalleryApi();
      setGallery(response);
      console.log(response);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  };

  useEffect(() => {
    getGallery();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-5 h-screen">
      <div className=" flex flex-col  w-full items-center">
        <h3 className=" text-2xl lg:text-4xl font-semibold   mt-2">
          Our Gallery
        </h3>
        <br />
        <div className="flex items-center w-[75px]">
          <div className="h-0.5 bg-[#cee21a]"></div>
          <div className="h-1 w-1 bg-[#cee21a] rounded-full mx-1"></div>
          <div className="h-1 w-1 bg-[#cee21a] rounded-full mx-1"></div>
          <div className="h-1 w-1 bg-[#cee21a] rounded-full mx-1"></div>
          <div
            className="h-[4px] rounded-full w-[10px] flex-grow"
            style={{ backgroundColor: "#cee21a" }}
          ></div>
        </div>
                  
      </div>{" "}
      {gallery.length === 0 ? (
        <p className="text-center text-xl text-gray-500">No gallery found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {gallery?.map((item) =>
            item.images?.map((currElem, index) => (
              <div
                key={`${item._id}-${index}`}
                className="relative w-full h-64"
              >
                <img
                  src={currElem?.url}
                  className="w-full h-full object-cover rounded-lg"
                  alt="Gallery"
                />
              </div>
            ))
          )}
        </div>
      )}
      <SocialMediaBar />
    </div>
  );
};

export default Gallery;
