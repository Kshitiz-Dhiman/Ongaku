import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

export const sliceName = createSlice({
    name: "",
    initialState,
    reducers: {
        dothis: (state, action) => { },
        dothat: (state, action) => { }
    }
})

export const { dothis, dothat } = sliceName.actions;

export default sliceName.reducer;
