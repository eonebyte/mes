import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    resources: [],
    resource: null, // <--- Tambahkan ini untuk satu resource,
    refreshCounter: 0,
};

const resourceSlice = createSlice({
    name: 'resources',
    initialState,
    reducers: {
        setResourcesStore: (state, action) => {
            state.resources = action.payload;
        },
        setResourceStore: (state, action) => {
            state.resource = action.payload;
        },
        refreshResources: (state) => {
            state.refreshCounter += 1;
        },

    }
});

export const { setResourcesStore, setResourceStore, refreshResources } = resourceSlice.actions;

export default resourceSlice.reducer;
