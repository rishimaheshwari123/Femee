import { toast } from "react-hot-toast"

// import { updateCompletedLectures } from "../../slices/viewCourseSlice"
// import { setLoading } from "../../slices/profileSlice";
import { apiConnector } from "../apiConnector"
import { productEndpoints } from "../apis"
import { saveProduct } from "../../redux/product"


const {
    GET_ALL_PRODUCT_API,
    GET_PRODUCT_DETAILS,
    GET_COUPON
} =productEndpoints

export const getAllProduct = () => async (dispatch) => {
   ;
  try {
    const response = await apiConnector("GET", GET_ALL_PRODUCT_API);
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Product");
    }
    const result = response?.data?.data;
    console.log(response)
    dispatch(saveProduct(result)); // Dispatching action to save products
    return result;
  } catch (error) {
    console.log("GET_ALL_PRODUCT_API API ERROR:", error);
    toast.error(error.message);
     ;
    return [];
  }
};

  
export const fetchProductDetails = async (productID) => {
  //  

  let result = null
  try {
    const response = await apiConnector("POST", GET_PRODUCT_DETAILS, {
      productID,
    })
    console.log("GET_PRODUCT_DETAILS API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data
  } catch (error) {
    console.log("GET_PRODUCT_DETAILS API ERROR............", error)
    result = error.response.data
    toast.error(error.response.data.message);
  }
  //  
  //   dispatch(setLoading(false));
  return result
}
//COUPON 
  
export const fetchCoupon = async (name,token) => {
   
  console.log(name)

  let result = null
  try {
    const response = await apiConnector("POST", GET_COUPON, {name} )
    // console.log("GET_COUPON API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data
  } catch (error) {
    console.log("GET_COUPON API ERROR............", error)
    result = error.response.data
    toast.error(error.response.data.message);
  }
   
  //   dispatch(setLoading(false));
  return result
}

