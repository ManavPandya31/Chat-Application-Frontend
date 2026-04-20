import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: (() => {
    try {
      const data = localStorage.getItem("user");

      if (!data || data === "undefined" || data === "null") {
        return null;
      }

      return JSON.parse(data);
    } catch (err) {
      return null;
    }
  })(),
};  

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        updateUser: (state, action) => {
             state.user = { ...(state.user || {}), ...action.payload };
        },
        logoutUser: (state) => {
            state.user = null;
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        }
    }
});

export const { setUser, updateUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;