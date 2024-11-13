import { configureStore } from "@reduxjs/toolkit";
import machineReducer from "./reducers/machineSlice";
import intervalReducer from "./reducers/intervalSlice";
import themeReducer from './reducers/themeSlice';

export const store = configureStore({
    reducer: {
        machines: machineReducer,
        interval: intervalReducer,
        theme: themeReducer,
    },
}, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())