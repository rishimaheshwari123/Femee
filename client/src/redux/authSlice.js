import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null,
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,

};

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setUser(state, actions) {
            state.user = actions.payload
            localStorage.setItem("user", JSON.stringify(actions.payload))
        },

        setToken(state, actions) {
            state.token = actions.payload;
            localStorage.setItem("token", JSON.stringify(actions.payload))
        },
    },
});

export const { setUser, setToken } = authSlice.actions;

export default authSlice.reducer;
