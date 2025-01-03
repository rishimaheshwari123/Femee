import { useEffect, useState } from "react";
import { createCategory, fetchCategory } from "../../../serivces/operations/admin";
import { useSelector } from "react-redux";

function AddCategory() {
  const [categories, setCategories] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const fetchCategoryMain = async () => {
      try {
        const response = await fetchCategory();
        setCategories(response);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategoryMain();
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      const newCategory = await createCategory({ name: categoryName },token);
      setCategories([...categories, newCategory]);
      setCategoryName("");  // Reset the input field
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <div>
     <div className="product border-2 p-4">

   
     <div className=" text-center mb-[10px]  font-bold ">
    Add Category
    </div>

 <form onSubmit={handleSubmit} className=" flex gap-4">
        <input
          type="text"
          placeholder="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
          className="form-input"
        />
        <button type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        
        >Add Category</button>
      </form>

     </div>

      {/* All Categories */}
      <div>

      <div className=" text-center mb-[10px]  font-bold">
    All Category
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category?._id} className="flex items-center justify-between p-4 border border-gray-300 rounded-lg shadow-sm">
            <span className=" font-bold">{category?.name}</span>
            <button
              className="text-red-500 hover:text-red-600 transition"
            >
             
            </button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default AddCategory;
