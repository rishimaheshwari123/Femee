import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allProduct: localStorage.getItem("allProduct")
    ? JSON.parse(localStorage.getItem("allProduct"))
    : [],
    isFilterOpen:false,
    isMenuOpen:false,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    saveProduct: (state, action) => {
      state.allProduct = action.payload;
      localStorage.setItem("allProduct", JSON.stringify(state.allProduct));
    },

    handleIsFilterOpen: (state, action) => {
      return {
        ...state,
        isFilterOpen: action.payload !== undefined ? action.payload : !state.isFilterOpen
      };
    },
    handleIsMenuOpen: (state, action) => {
      return {
        ...state,
        isMenuOpen: action.payload !== undefined ? action.payload : !state.isMenuOpen
      };
    },

    resetProduct: (state) =>{
      state.allProduct = []
    localStorage.removeItem("allProduct")


  }
  },
});

export const { saveProduct,handleIsFilterOpen,handleIsMenuOpen } = productSlice.actions;

export default productSlice.reducer;
