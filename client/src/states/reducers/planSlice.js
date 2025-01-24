// src/store/planSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    plans: [],
};

const planSlice = createSlice({
    name: 'plans',
    initialState,
    reducers: {
        setPlansStore: (state, action) => {
            state.plans = action.payload;
        }
    }
});

export const { setPlansStore } = planSlice.actions;

export default planSlice.reducer;
