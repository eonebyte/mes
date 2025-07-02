import { configureStore } from "@reduxjs/toolkit";
import machineReducer from "./reducers/machineSlice";
import intervalReducer from "./reducers/intervalSlice";
import themeReducer from './reducers/themeSlice';
import authReducer from './reducers/authSlice';
import resourceReducer from './reducers/resourceSlice';
import planReducer from './reducers/planSlice';
import isGgridReducer from './reducers/isGridSlice';
export const store = configureStore({
    reducer: {
        auth: authReducer,
        machines: machineReducer,
        resources: resourceReducer,
        plans: planReducer,
        interval: intervalReducer,
        theme: themeReducer,
        layout: isGgridReducer

    },
}, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())