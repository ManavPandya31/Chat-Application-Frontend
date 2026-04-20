import { io } from "socket.io-client";

const token = localStorage.getItem("token");

export const socket = io(import.meta.env.VITE_API_URL, {
  auth: {
    token,
  },
  transports: ["websocket"], 
});