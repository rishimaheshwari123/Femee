import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deleteProduct } from "../../../services/operations/admin";
import { getAllProduct } from "../../../services/operations/product";

function AllProduct() {
  const dispatch = useDispatch();
  const { allProduct } = useSelector((state) => state.product);
  const { token } = useSelector((state) => state.auth);
  const [products, setProduct] = useState([]);

  useEffect(() => {
    dispatch(getAllProduct());
  }, [dispatch]);

  useEffect(() => {
    setProduct(allProduct);
  }, [allProduct]);

  const handleDelete = async (id) => {
    try {
      await deleteProduct({ id }, token);
      dispatch(getAllProduct()); // Delete ke baad list refresh karein
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">All Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products?.map((product) => (
          <div
            key={product._id}
            className="bg-white shadow-md rounded p-4 flex flex-col"
          >
            <div className="mb-4">
              <img
                src={product.images[0]?.url}
                alt={product.title}
                className="h-full w-full object-cover rounded"
              />
            </div>
            <div className="flex flex-col flex-grow">
              <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {product.description}
              </p>
              <p className="text-lg font-bold mb-2">
                <del className="text-gray-500">₹{product.highPrice}</del> ₹
                {product.price}
              </p>

              <div className="flex flex-wrap gap-2">
                {product.sizes?.split(",").map((size, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 text-sm font-semibold border border-gray-400 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                  >
                    {size.trim()}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="self-end mt-4 text-red-600 hover:text-red-800"
              onClick={() => handleDelete(product._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllProduct;
