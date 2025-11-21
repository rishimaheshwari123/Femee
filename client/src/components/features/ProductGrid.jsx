import React from 'react';
import ProductCard from './ProductCard';
import Container from '../ui/Container';

const ProductGrid = ({ products, loading = false, emptyMessage = 'No products found' }) => {
  if (loading) {
    return (
      <Container>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-64 sm:h-72 lg:h-80 rounded-lg mb-3" />
              <div className="bg-gray-200 h-4 rounded mb-2" />
              <div className="bg-gray-200 h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </Container>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-600">{emptyMessage}</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </Container>
  );
};

export default ProductGrid;
