import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deleteProduct } from "../../../services/operations/admin";
import { getAllProduct } from "../../../services/operations/product";

function AllProduct() {
  const dispatch = useDispatch();
  const { allProduct } = useSelector((state) => state.product);
  const { token } = useSelector((state) => state.auth);
const[products,setProduct] = useState(allProduct || [])


  const getAll =async()=>{
      await dispatch(getAllProduct())
    }

    useEffect(()=>{
      getAll()

    },[])
  const handleDelete = async (id) => {
    try {
        console.log(id)
      await deleteProduct({id},token);
      setProduct(products.filter((prod)=> prod._id !== id))
      // Dispatch an action or refetch the products to update the state
      // e.g., dispatch(fetchProducts());
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  useEffect(() => {
    console.log(allProduct);
  }, [allProduct]);

  return (
    <div className="p-4">
    <h2 className="text-2xl font-semibold mb-4">All Products</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product._id} className="bg-white shadow-md rounded p-4 flex flex-col">
          <div className="mb-4">
            <img
              src={product.images[0].url} // Assuming 'image' is a URL field in your product object
              alt={product.title}
              className="h-40 w-full object-cover rounded"
            />
          </div>
          <div className="flex flex-col flex-grow">
            <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
            <p className="text-lg font-bold mb-2">INR :-{""}{product.price}</p>
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
