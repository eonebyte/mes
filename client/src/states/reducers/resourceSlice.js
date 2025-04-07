import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    resources: [],
    resource: null, // <--- Tambahkan ini untuk satu resource

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
        }

    }
});

export const { setResourcesStore, setResourceStore } = resourceSlice.actions;

export default resourceSlice.reducer;
