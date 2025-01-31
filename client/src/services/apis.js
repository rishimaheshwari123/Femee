
// const BASE_URL = process.env.REACT_APP_BASE_URL;
const BASE_URL = "https://femee-8iq1.onrender.com/api/v1";


export const auth = {
  LOGIN_API: BASE_URL + "/auth/login",
  SIGNUP_API: BASE_URL + "/auth/register",
  IMAGE_UPLOAD: BASE_URL + "/image/multi",
  GET_ALL_MEMBER: BASE_URL + "/auth/getAll",
  GET_MEMBER: BASE_URL + "/auth/get",
  UPDATE_MEMBER: BASE_URL + "/auth/verify",
  UPDATE_TIER: BASE_URL + "/auth/update",
  UPDATE_MEMBER_PROFILE: BASE_URL + "/auth/update-profile",
  CREATE_GALLERY: BASE_URL + "/gallery/create",
  GET_GALLERY: BASE_URL + "/gallery/get",
  DELETE_GALLERY: BASE_URL + "/gallery/delete",
  DELETE_MEMBER: BASE_URL + "/auth/delete",

}
export const user = {
  LOGIN_API: BASE_URL + "/user/login",
  SIGNUP_API: BASE_URL + "/user/register",


}



export const productEndpoints = {
  GET_ALL_PRODUCT_API: BASE_URL + "/product/all-product",
  GET_PRODUCT_DETAILS: BASE_URL + "/product/getProductDetails",


  //COUPON APIS 
  GET_COUPON: BASE_URL + "/coupon/get"

}





export const paymentEndpoints = {
  PRODUCT_PAYMENT_API: BASE_URL + "/order/capturePayment",
  PRODUCT_VERIFY_API: BASE_URL + "/order/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/order/sendPaymentSuccessEmail",


  // Get all orders
  GET_ALL_ORDER: BASE_URL + "/order/get",


}





// ADMIN APIS 

export const adminEndPoints = {
  ADD_PRODUCT_API: BASE_URL + "/product/create",
  EDIT_PRODUCT_API: BASE_URL + "/product/create",
  DELETE_PRODUCT_API: BASE_URL + "/product/delete",



  //Category
  ADD_CATEGORY_API: BASE_URL + "/product/createCategory",
  EDIT_CATEGORY_API: BASE_URL + "/product/editCategory",
  DELTE_CATEGORY_API: BASE_URL + "/product/deleteCategory",
  GET_ALL_CATEGORY_API: BASE_URL + "/product/showAllCategories",


  IMAGE_UPLOAD: BASE_URL + "/image/multi",


  //Order
  GET_ALL_ORDER: BASE_URL + "/product/adminGetOrder",
  UPDATE_ORDER: BASE_URL + "/product/updateOrder"



}




export const ratingEndpoints = {
  ADD_RATING_API: BASE_URL + "/rating/create",
  UPDATE_RATING_API: BASE_URL + "/rating/edit",
  GETALL_RATING_API: BASE_URL + "/rating/getAll",
}