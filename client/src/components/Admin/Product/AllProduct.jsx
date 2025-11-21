import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaTag
} from "react-icons/fa";
import { deleteProduct } from "../../../services/operations/admin";
import { getAllProduct } from "../../../services/operations/product";
import { Card, Button, Badge, Modal, Input } from "../../ui";

function AllProduct() {
  const dispatch = useDispatch();
  const { allProduct } = useSelector((state) => state.product);
  const { token } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    dispatch(getAllProduct());
  }, [dispatch]);

  useEffect(() => {
    setProducts(allProduct);
  }, [allProduct]);

  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProduct({ id: selectedProduct._id }, token);
      dispatch(getAllProduct());
      setDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const filteredProducts = products?.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-dark-900 mb-2">
              All Products
            </h1>
            <p className="text-dark-600">
              Manage your product inventory
            </p>
          </div>
          <Button to="/admin/add-product" variant="primary" size="lg">
            <FaPlus className="mr-2" />
            Create Product
          </Button>
        </div>

        {/* Search & Filter */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<FaSearch />}
                iconPosition="left"
              />
            </div>
            <Button variant="outline" size="md">
              <FaFilter className="mr-2" />
              Filters
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-1">
              {products?.length || 0}
            </div>
            <div className="text-sm text-dark-600">Total Products</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {products?.filter(p => p.stock > 0).length || 0}
            </div>
            <div className="text-sm text-dark-600">In Stock</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {products?.filter(p => p.stock === 0).length || 0}
            </div>
            <div className="text-sm text-dark-600">Out of Stock</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {filteredProducts?.length || 0}
            </div>
            <div className="text-sm text-dark-600">Filtered</div>
          </Card>
        </div>

        {/* Products Grid */}
        {filteredProducts?.length === 0 ? (
          <Card className="text-center py-16">
            <div className="text-6xl text-dark-300 mb-4">📦</div>
            <h3 className="text-xl font-semibold text-dark-900 mb-2">
              No Products Found
            </h3>
            <p className="text-dark-600 mb-6">
              {searchTerm ? "Try a different search term" : "Start by creating your first product"}
            </p>
            <Button to="/admin/add-product" variant="primary">
              <FaPlus className="mr-2" />
              Create Product
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts?.map((product) => (
              <Card
                key={product._id}
                hover
                className="group overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative h-64 overflow-hidden rounded-t-2xl -m-6 mb-4">
                  <img
                    src={product.images[0]?.url}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                      <Link
                        to={`/product/${product._id}`}
                        className="flex-1 bg-white text-dark-900 px-4 py-2 rounded-lg text-center font-semibold hover:bg-dark-100 transition-colors"
                      >
                        <FaEye className="inline mr-2" />
                        View
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setDeleteModal(true);
                        }}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                      >
                        <FaTrash className="inline mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Discount Badge */}
                  {product.highPrice > product.price && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="danger" size="md">
                        {Math.round(((product.highPrice - product.price) / product.highPrice) * 100)}% OFF
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-900 line-clamp-2 mb-1">
                      {product.title}
                    </h3>
                    <p className="text-sm text-dark-600 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary-600">
                      ₹{product.price}
                    </span>
                    {product.highPrice > product.price && (
                      <span className="text-sm text-dark-400 line-through">
                        ₹{product.highPrice}
                      </span>
                    )}
                  </div>

                  {/* Sizes */}
                  {product.sizes && (
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.split(",").slice(0, 5).map((size, index) => (
                        <Badge key={index} variant="default" size="sm">
                          {size.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* SEO Info */}
                  {product.slug && (
                    <div className="pt-3 border-t border-dark-200">
                      <div className="flex items-center gap-2 text-xs text-dark-500">
                        <FaTag />
                        <span className="truncate">/{product.slug}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      to={`/admin/edit-product/${product._id}`}
                      variant="outline"
                      size="sm"
                      fullWidth
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product);
                        setDeleteModal(true);
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedProduct(null);
        }}
        title="Delete Product"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-dark-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{selectedProduct?.title}</span>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              fullWidth
              onClick={handleDelete}
            >
              Yes, Delete
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setDeleteModal(false);
                setSelectedProduct(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AllProduct;
