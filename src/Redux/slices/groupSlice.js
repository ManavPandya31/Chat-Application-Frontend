import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

const initialState = {
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  groupTyping: false,
};

const groupSlice = createSlice({

    name : "group",
    initialState,
    reducers : {

        setGroups : (state,action) => {
            state.groups = action.payload;
        },

        setSelectedGroup : (state,action) => {
            state.selectedGroup  = action.payload;
        },

        setGroupMessages : (state,action) => {
            state.groupMessages = action.payload;
        },

        addGroupMessage: (state, action) => {
            state.groupMessages.push(action.payload);
    },

        setGroupTyping: (state, action) => {
            state.groupTyping = action.payload;
    },

    }
});

export const {setGroups,setSelectedGroup,setGroupMessages,addGroupMessage,setGroupTyping,} = groupSlice.actions;
export default groupSlice.reducer;