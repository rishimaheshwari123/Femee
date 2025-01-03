import { combineReducers } from "@reduxjs/toolkit"

import authReducer from "./authSlice"
import cartReducer from "./cartSlice"
import productReducer from "./product"
import paymentReducer from "./paymentSlice"

const rootReducer = combineReducers({
  auth: authReducer,
 
  cart: cartReducer,
  product: productReducer,
  payment :paymentReducer,


  })
  
  export default rootReducer