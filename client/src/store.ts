
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {api} from "./api/api.ts";
import createOrderSlice from "./slices/createOrderSlice.ts";
import {ordersApi} from "./api/ordersApi.ts";
import {openstreetmapApi} from "./api/openstreetmap.api.ts";

export const reducers = {
    [api.reducerPath]: api.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [openstreetmapApi.reducerPath]: openstreetmapApi.reducer,
    [createOrderSlice.reducerPath]: createOrderSlice.reducer,
};

const reducer = combineReducers(reducers);

export const store = configureStore({
    reducer,
    devTools: false, // process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    })
        .concat(api.middleware)
        .concat(openstreetmapApi.middleware)
        .concat(ordersApi.middleware),
});