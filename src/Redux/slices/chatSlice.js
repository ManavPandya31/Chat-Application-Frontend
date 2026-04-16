import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    users : [],
    selectedUser : null,
    messages : [],
    onlineUsers : [],
    typing : false,
    unreadCounts : {},
}

const chatSlice = createSlice({

    name  : "chat",
    initialState,
    reducers : {
        setUsers : (state , action ) => {
            state.users = action.payload
        },

        setSelectedUser  : (state , action) => {
            state.selectedUser  = action.payload
        },

        setMessages : (state , action) => {
            state.messages = action.payload
        },

        addMessage : (state , action) => {
            state.messages.push(action.payload)
        },

        setOnlineUsers : (state , action) => {
            state.onlineUsers = action.payload
        },

        setTyping : (state , action ) => {
            state.typing = action.payload
        },

        incrementUnread : (state , action) =>{
            const senderId = action.payload

            if(!state.unreadCounts[senderId]) {
                state.unreadCounts[senderId] = 0;
            }
            state.unreadCounts[senderId] += 1;
        },

        clearUnread : (state , action) =>{
            const userId = action.payload  
            state.unreadCounts[userId] = 0; 
        },

        updateMessageSeen : (state , action) => {
            const id = action.payload;
            state.messages = state.messages.map((msg) =>
                msg._id === id ? { ...msg, seen: true } : msg
            );
        },
    }
});

export const  { setUsers , setSelectedUser , setMessages , addMessage , setOnlineUsers , setTyping , updateMessageSeen,incrementUnread,clearUnread} = chatSlice.actions;
export default chatSlice.reducer;