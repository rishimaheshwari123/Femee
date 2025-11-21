import { toast } from "react-hot-toast"

// import { updateCompletedLectures } from "../../slices/viewCourseSlice"
// import { setLoading } from "../../slices/profileSlice";
import { apiConnector } from "../apiConnector"
import { adminEndPoints } from "../apis"


const {
  ADD_PRODUCT_API,
  EDIT_PRODUCT_API,
  DELETE_PRODUCT_API,
  DASHBOARD_STATS_API,



  IMAGE_UPLOAD,

  //Order
  GET_ALL_ORDER,
  UPDATE_ORDER
} = adminEndPoints


export const createProduct = async (data, token) => {
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", ADD_PRODUCT_API, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) {
      throw new Error("Could Not Add PRODUCT Details")
    }
    toast.success(response?.data?.message)

  } catch (error) {
    console.log("CREATE PRODUCT API ERROR............", error)
    toast.error(error.response?.data?.message)
  }
  toast.dismiss(toastId)

}



export const updateProduct = async (data, token) => {
  const toastId = toast.loading("Updating product...")
  try {
    const response = await apiConnector("POST", EDIT_PRODUCT_API, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE PRODUCT API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Update Product Details")
    }
    toast.success("Product Updated Successfully")
    return response.data

  } catch (error) {
    console.log("UPDATE PRODUCT API ERROR............", error)
    toast.error(error.response?.data?.message || error.message)
  }
  toast.dismiss(toastId)
}

// Dashboard Stats API
export const getDashboardStats = async (token) => {
  try {
    const response = await apiConnector("GET", DASHBOARD_STATS_API, null, {
      Authorization: `Bearer ${token}`,
    })
    
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Dashboard Stats")
    }
    
    return response.data.data
  } catch (error) {
    console.log("DASHBOARD STATS API ERROR............", error)
    return null
  }
}

export const deleteProduct = async (id, token) => {

  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", DELETE_PRODUCT_API, id, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) {
      throw new Error("Could Not Delete ")
    }
    toast.success(response?.data?.message)

  } catch (error) {
    console.log("DELETE  API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)

}




//Image 


export const imageUpload = async (data, token) => {
  let result = []
  console.log(data)
  const toastId = toast.loading("Loading...")
  try {

    const formData = new FormData();
    for (let i = 0; i < data.length; i++) {
      formData.append("thumbnail", data[i]);
    }
    const response = await apiConnector("POST", IMAGE_UPLOAD, formData, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    })
    // console.log("CREATE IMAGE API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Add IMAGE Details")
    }
    toast.success("IMAGE Details Added Successfully")
    result = response?.data?.images

  } catch (error) {
    console.log("CREATE IMAGE API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result

}




// order

export const getAllOrders = async (token) => {
  ;
  try {
    const response = await apiConnector("GET", GET_ALL_ORDER, null, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    });
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Product");
    }

    const result = response?.data?.data;

    return result;
  } catch (error) {
    console.log("GET_ALL_PRODUCT_API API ERROR:", error);
    toast.error(error.message);
    ;
    return [];
  }
};


export const updateOrder = async (data, token) => {

  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", UPDATE_ORDER, data, {
      Authorization: `Bearer ${token}`,
    })
    // console.log("UPDATE  API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not update ")
    }
    toast.success("Order    update")

  } catch (error) {
    console.log("UPDATE  API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)

}