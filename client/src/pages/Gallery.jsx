import React, { useEffect, useState } from "react";
import { FaImages } from "react-icons/fa";
import { getAllGalleryApi } from "../services/operations/memeber";
import SocialMediaBar from "../components/comman/SocialMedia";
import { Container, Card, Spinner } from "../components/ui";

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGallery = async () => {
    try {
      setLoading(true);
      const response = await getAllGalleryApi();
      setGallery(response);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGallery();
  }, []);

  if (loading) {
    return <Spinner fullScreen size="lg" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <FaImages className="text-primary-500 text-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our collection of memorable moments and achievements
          </p>
          <div className="flex items-center justify-center mt-6">
            <div className="h-1 w-20 bg-secondary-500 rounded-full"></div>
          </div>
        </div>

        {/* Gallery Grid */}
        {gallery.length === 0 ? (
          <Card className="text-center py-16">
            <FaImages className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No images in gallery yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gallery?.map((item) =>
              item.images?.map((currElem, index) => (
                <Card
                  key={`${item._id}-${index}`}
                  padding="none"
                  hover
                  className="overflow-hidden group cursor-pointer"
                >
                  <div className="relative aspect-square">
                    <img
                      src={currElem?.url}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      alt={`Gallery ${index + 1}`}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Social Media Bar */}
        <div className="mt-12">
          <SocialMediaBar />
        </div>
      </Container>
    </div>
  );
};

export default Gallery;
