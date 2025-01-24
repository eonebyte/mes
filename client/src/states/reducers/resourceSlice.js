import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    resources: [],
};

const resourceSlice = createSlice({
    name: 'resources',
    initialState,
    reducers: {
        setResourcesStore: (state, action) => {
            state.resources = action.payload;
        }
     
    }
});

export const { setResourcesStore } = resourceSlice.actions;

export default resourceSlice.reducer;
