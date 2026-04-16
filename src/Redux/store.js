import { configureStore } from "@reduxjs/toolkit";
import chatReducer  from "../Redux/slices/chatSlice";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
});