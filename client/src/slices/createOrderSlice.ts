import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {api} from "../api/api.ts";
import {ordersApi} from "../api/ordersApi.ts";
import {Address} from "node:cluster";
import {REF_HEADER} from "../api/baseQuery.ts";

interface CreateOrderState {
    baseService?: any;
    options: any[];
    serviceVariant?: any;
    id?: number;

    fullAddress?: any;
    date?: number;
    bonuses?: number;

    services: any[]

    userInfo?: any;

    token?: any;

    geo?: { address: Address };
}

export const getLocalStorageItemOrDefault = (key: string, defaultValue: any) => {
    const result = localStorage.getItem(key)
    if (!result) {
        return defaultValue;
    }
    return JSON.parse(result);
}

export const saveInLocalStorage = (key: string, value: any) => {
    if (value) {
        localStorage.setItem(key, JSON.stringify(value))
    } else {
        localStorage.removeItem(key)
    }
}

const _clearState = (state) => {
    state.id = undefined;
    state.baseService = undefined;
    state.serviceVariant = undefined;
    state.options = [];
    // state.fullAddress = null;
    state.date = undefined;

    saveInLocalStorage('id', state.id)
    saveInLocalStorage('baseService', state.baseService)
    saveInLocalStorage('serviceVariant', state.serviceVariant)
    // saveInLocalStorage('fullAddress', state.fullAddress)
    saveInLocalStorage('date', state.date)
    saveInLocalStorage('options', null)
}

const _saveToken = (state, action: PayloadAction<{ token: string }>) => {
    state.token = action.payload.token;
    saveInLocalStorage('token', state.token)
}

const _logout = (state, action: PayloadAction) => {
    state.token = undefined;
    saveInLocalStorage(REF_HEADER, undefined)
    _clearState(state)
    saveInLocalStorage('token', state.token)
}

const initialState: CreateOrderState = {
    id: getLocalStorageItemOrDefault('id', null),
    baseService: getLocalStorageItemOrDefault('baseService', null),
    options: getLocalStorageItemOrDefault('options', []),
    serviceVariant: getLocalStorageItemOrDefault('serviceVariant', null),
    fullAddress: getLocalStorageItemOrDefault('fullAddress', null),
    date: getLocalStorageItemOrDefault('date', 0),
    token: getLocalStorageItemOrDefault('token', null),
    geo: getLocalStorageItemOrDefault('geo', null),
    services: []
};

const createOrderSlice = createSlice({
    name: 'createOrder',
    initialState,
    reducers: {
        saveToken: _saveToken,
        logout: _logout,
        updateGeo: (state, action: PayloadAction) => {
            state.geo = action.payload;
            saveInLocalStorage('geo', state.geo)
        },
        startOrderFlow: (state, action: PayloadAction<Pick<CreateOrderState, 'baseService' | 'serviceVariant'>>) => {
            state.baseService = action.payload.baseService;
            state.serviceVariant = action.payload.serviceVariant;

            saveInLocalStorage('serviceVariant', state.serviceVariant)
            saveInLocalStorage('baseService', state.baseService)

            state.id = undefined;
            state.options = [];
            state.date = undefined;
            saveInLocalStorage('id', state.id)
            saveInLocalStorage('date', state.date)
            saveInLocalStorage('options', null)
        },
        selectBonus: (state, action: PayloadAction<Pick<CreateOrderState, 'bonuses'>>) => {
            state.bonuses = action.payload.bonuses;
            saveInLocalStorage('bonuses', state.bonuses)
        },
        selectDate: (state, action: PayloadAction<Pick<CreateOrderState, 'date'>>) => {
            state.date = action.payload.date;
            saveInLocalStorage('date', state.date)
        },
        selectVariant: (state, action: PayloadAction<Pick<CreateOrderState, 'serviceVariant'>>) => {
            state.serviceVariant = action.payload.serviceVariant;
            saveInLocalStorage('serviceVariant', state.serviceVariant)
        },
        selectOptions: (state, action: PayloadAction<Pick<CreateOrderState, 'options'>>) => {
            state.options = action.payload.options;
            saveInLocalStorage('options', state.options)
        },
        retryOrder: (state, action: PayloadAction<Pick<CreateOrderState, 'baseService' | 'serviceVariant' | 'options' | 'fullAddress'>>) => {
            state.options = action.payload.options;
            state.baseService = action.payload.baseService;
            state.serviceVariant = action.payload.serviceVariant;
            state.fullAddress = {fullAddress: action.payload.fullAddress};

            saveInLocalStorage('baseService', state.baseService)
            saveInLocalStorage('serviceVariant', state.serviceVariant)
            saveInLocalStorage('options', state.options)
            saveInLocalStorage('fullAddress', state.fullAddress)
        },
        selectBaseService: (state, action: PayloadAction<Pick<CreateOrderState, 'baseService' | 'serviceVariant' | 'options' | 'id'>>) => {
            state.id = action.payload.id;
            state.baseService = action.payload.baseService;
            state.serviceVariant = action.payload.serviceVariant;
            state.options = action.payload.options;

            saveInLocalStorage('id', state.id)
            saveInLocalStorage('baseService', state.baseService)
            saveInLocalStorage('serviceVariant', state.serviceVariant)
            saveInLocalStorage('options', state.options)
        },
        selectFullAddress: (state, action: PayloadAction<Pick<CreateOrderState, 'fullAddress'>>) => {
            state.fullAddress = action.payload;
            saveInLocalStorage('fullAddress', state.fullAddress)
        },
        clearState: _clearState,
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(ordersApi.endpoints.addOrder.matchFulfilled, _clearState)
            .addMatcher(api.endpoints.getServices.matchFulfilled, (state, action) => {
                state.services = action.payload;
            })
            .addMatcher(api.endpoints.getUserInfo.matchFulfilled, (state, action) => {
                state.userInfo = action.payload;
            })
            .addMatcher(api.endpoints.login.matchFulfilled, (state, action) => _saveToken(state, {payload: {token: action.payload.access_token}} as any))
    },
});

export const {
    logout,
    saveToken,
    retryOrder,
    selectDate,
    startOrderFlow,
    selectBaseService,
    selectOptions,
    selectFullAddress,
    selectVariant,
    clearState,
    updateGeo,
    selectBonus
} = createOrderSlice.actions;

export default createOrderSlice;