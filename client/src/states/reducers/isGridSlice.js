// store/isGridSlice.js
import { createSlice } from '@reduxjs/toolkit';

const isGridSlice = createSlice({
    name: 'layout',
    initialState: {
        isGrid: false,
    },
    reducers: {
        toggleLayout: (state) => {
            state.isGrid = !state.isGrid;
        },
        setGrid: (state, action) => {
            state.isGrid = action.payload;
        },
    },
});

export const { toggleLayout, setGrid } = isGridSlice.actions;
export default isGridSlice.reducer;
