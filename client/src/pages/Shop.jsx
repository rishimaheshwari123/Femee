import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { FaShoppingBag, FaFilter } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import ProductGrid from "../components/features/ProductGrid";
import Container from "../components/ui/Container";

// Exporting available sizes and genders
export const sizes = ["S", "M", "L", "XL", "XXL"];
export const genders = ["Male", "Female", "Unisex"];

function Shop() {
  const { allProduct } = useSelector((state) => state.product);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Hero Section */}
        {/* <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
          <Container>
            <div className="text-center" data-aos="fade-down">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-6 animate-float">
                <FaShoppingBag className="text-4xl" />
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
                Our Products
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
                Discover our premium collection of health & wellness products
              </p>
              <div className="flex items-center justify-center mt-6 gap-2">
                <div className="h-1 w-20 bg-white/50 rounded-full"></div>
                <div className="h-2 w-2 bg-white rounded-full"></div>
                <div className="h-1 w-20 bg-white/50 rounded-full"></div>
              </div>
            </div>
          </Container>
        </div> */}

      {/* Products Section */}
      <div className="py-12">
        <Container>
          {/* Stats Bar */}
          <div className="mb-8" data-aos="fade-up">
            <div className="bg-white rounded-3xl shadow-soft p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-2 rounded-full font-semibold">
                  {allProduct.length} Products
                </div>
                <span className="text-dark-600">Available Now</span>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 border-2 border-dark-200 rounded-full hover:border-primary-500 hover:bg-primary-50 transition-all duration-300">
                <FaFilter />
                <span className="font-semibold">Filters</span>
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div data-aos="fade-up" data-aos-delay="200">
            <ProductGrid
              products={allProduct}
              emptyMessage="No products are available at the moment"
            />
          </div>
        </Container>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white py-12">
        <Container>
          <div className="text-center" data-aos="zoom-in">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-lg text-white/90 mb-6">
              Contact us and we'll help you find the perfect product
            </p>
            <button className="bg-white text-secondary-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform duration-300 shadow-xl">
              Contact Us
            </button>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default Shop;
