import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  step: 1,
  checkout : false,
  addressData:null
}

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
      setStep: (state, action) => {
        state.step = action.payload
      },
      setCheckout: (state, action) => {
        console.log("setCheckout reducer called with:", action.payload); // Debug log
        state.checkout = action.payload
        console.log("checkout state updated to:", state.checkout); // Debug log
      },
      setAddressData(state, value) {
        state.addressData = value.payload;
      },
      resetPayment: (state) => {
        state.step = 1;
        state.checkout = false;
        state.addressData = null;
      },
    },
  })
  
  export const {
    setStep,
    setCheckout,
    setAddressData,
    resetPayment
   
  } = paymentSlice.actions
  
  export default paymentSlice.reducer
  