// intervalSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    intervalId: null,
};

export const intervalSlice = createSlice({
    name: 'interval',
    initialState,
    reducers: {
        setIntervalId: (state, action) => {
            state.intervalId = action.payload;
        },
    },
});

export const { setIntervalId } = intervalSlice.actions;

export default intervalSlice.reducer;
