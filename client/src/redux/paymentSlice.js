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
        state.checkout = action.payload
      },
      setAddressData(state, value) {
        state.addressData = value.payload;
      },
    },
  })
  
  export const {
    setStep,
    setCheckout,
    setAddressData
   
  } = paymentSlice.actions
  
  export default paymentSlice.reducer
  