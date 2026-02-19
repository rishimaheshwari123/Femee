
const BASE_URL = process.env.REACT_APP_BASE_URL;


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
  EDIT_PRODUCT_API: BASE_URL + "/product/update",
  DELETE_PRODUCT_API: BASE_URL + "/product/delete",
  DASHBOARD_STATS_API: BASE_URL + "/product/dashboard-stats",



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

// PAIR REWARD SYSTEM APIS
export const pairEndpoints = {
  // Member APIs
  SUBMIT_PAIR_REQUEST: BASE_URL + "/pair/submit",
  GET_MY_PAIR_REQUESTS: BASE_URL + "/pair/my-requests",
  GET_PAIR_DASHBOARD: BASE_URL + "/pair/dashboard",

  // Admin APIs
  GET_ALL_PAIR_REQUESTS_ADMIN: BASE_URL + "/pair/admin/all",
  GET_PAIR_REQUEST_BY_ID_ADMIN: BASE_URL + "/pair/admin",
  APPROVE_PAIR_REQUEST_ADMIN: BASE_URL + "/pair/admin/approve",
  REJECT_PAIR_REQUEST_ADMIN: BASE_URL + "/pair/admin/reject",
}

// REFERRAL SYSTEM APIS
export const referralEndpoints = {
  GENERATE_REFERRAL_LINK_API: BASE_URL + "/referral/generate",
  VALIDATE_REFERRAL_LINK_API: BASE_URL + "/referral/validate",
  GET_REFERRAL_STATS_API: BASE_URL + "/referral/stats",
}

// MEMBER/BINARY TREE APIS
export const memberEndpoints = {
  GET_BINARY_TREE_STRUCTURE: BASE_URL + "/auth/:memberId/binary-tree/:productId",
}

// ALML (Achievement Level-based Member Logic) APIS
export const almlEndpoints = {
  GET_ACHIEVEMENT_CHART: BASE_URL + "/alml/:memberId/chart/:productId/:rootNumber",
  GET_ALL_ROOT_ACHIEVEMENTS: BASE_URL + "/alml/:memberId/all/:productId",
  CLAIM_ACHIEVEMENTS: BASE_URL + "/alml/:memberId/claim",
  GET_ALML_SUMMARY: BASE_URL + "/alml/:memberId/summary",
}

// SET NUMBER TRACKING APIS
export const setNumberEndpoints = {
  GET_USER_SET_NUMBERS: BASE_URL + "/setNumber/getUserSetNumbers",
}