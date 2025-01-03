import { toast } from "react-hot-toast"

// import { updateCompletedLectures } from "../../slices/viewCourseSlice"
// import { setLoading } from "../../slices/profileSlice";
import { apiConnector } from "../apiConnector"
import { adminEndPoints } from "../apis"


const {
    ADD_PRODUCT_API,
    EDIT_PRODUCT_API,
    DELETE_PRODUCT_API,

 

    IMAGE_UPLOAD,

    //Order
    GET_ALL_ORDER,
    UPDATE_ORDER
} = adminEndPoints


export const createProduct = async (data, token) => {
    console.log(data)
    const toastId = toast.loading("Loading...")
    try {
        const response = await apiConnector("POST", ADD_PRODUCT_API, data, {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        })
      console.log("CREATE PRODUCT API RESPONSE............", response)
      if (!response?.data?.success) {
        throw new Error("Could Not Add PRODUCT Details")
      }
      toast.success("PRODUCT Details Added Successfully")
   
    } catch (error) {
      console.log("CREATE PRODUCT API ERROR............", error)
      toast.error(error.message)
    }
    toast.dismiss(toastId)
   
  }



  export const editProduct = async (data, token) => {
   
    const toastId = toast.loading("Loading...")
    try {
      const response = await apiConnector("POST", EDIT_PRODUCT_API, data, {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      })
      console.log("EDIT COURSE API RESPONSE............", response)
      if (!response?.data?.success) {
        throw new Error("Could Not Update Course Details")
      }
      toast.success("Course Details Updated Successfully")
    
    } catch (error) {
      console.log("EDIT COURSE API ERROR............", error)
      toast.error(error.message)
    }
    toast.dismiss(toastId)
     }

  export const deleteProduct = async (data, token) => {

    const toastId = toast.loading("Loading...")
    try {
      const response = await apiConnector("POST", DELETE_PRODUCT_API, data, {
        Authorization: `Bearer ${token}`,
      })
      // console.log("DELETE  API RESPONSE............", response)
      if (!response?.data?.success) {
        throw new Error("Could Not Delete ")
      }
      toast.success("Category   Deleted")
  
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

  export const getAllOrders  = async (token) => {
    ;
   try {
     const response = await apiConnector("GET", GET_ALL_ORDER,null,{
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