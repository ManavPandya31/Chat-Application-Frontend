import { configureStore } from "@reduxjs/toolkit";
import chatReducer  from "../Redux/slices/chatSlice";
import userReducer from "../Redux/slices/userSlice";
import groupReducer from "../Redux/slices/groupSlice";

export const store = configureStore({
  reducer: {
    chat : chatReducer,
    user : userReducer,
    group : groupReducer,
  },
});