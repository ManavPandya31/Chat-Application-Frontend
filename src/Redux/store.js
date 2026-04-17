import { configureStore } from "@reduxjs/toolkit";
import chatReducer  from "../Redux/slices/chatSlice";
import userReducer from "../Redux/slices/userSlice";

export const store = configureStore({
  reducer: {
    chat : chatReducer,
    user : userReducer,
  },
});