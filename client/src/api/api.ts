import { createApi} from "@reduxjs/toolkit/query/react";
import {baseQueryWithReauth, TELEGRAM_HEADER} from "./baseQuery.ts";

export const api = createApi({
    reducerPath: "api",
    tagTypes: [
        "Service", 'Address', 'User', 'Schedule', 'Application', 'Bonus'
    ],
    baseQuery: (...args) => baseQueryWithReauth(...args),
    endpoints: (builder) => ({
        getUserInfo: builder.query<void, void>({
            query: () => '/auth/userinfo',
            providesTags: ['User'],
        }),
        getBonuses: builder.query<any[], void>({
            query: () => '/auth/bonuses',
            providesTags: ['Bonus'],
        }),
        login: builder.mutation<{ access_token: string }, string | void>({
            query: (role) => ({
                url: '/auth/login',
                method: 'POST',
                body: {role},
                headers: {[TELEGRAM_HEADER]: Telegram.WebApp?.initData}
            }),
            invalidatesTags: ['User'],
        }),
        getServices: builder.query<any[], void>({
            query: () => ({
                url: "/services"
            }),
            providesTags: ['Service'],
        }),
        updateSchedule: builder.mutation<any, any>({
            query: (params) => ({
                url: "/schedule",
                method: 'PUT',
                body: params,
            }),
            invalidatesTags: ['Schedule'],
        }),
        getSchedule: builder.query<any, any>({
            query: () => ({
                url: "/schedule",
            }),
            providesTags: ['Schedule'],
        }),
        getAddresses: builder.query<any[], void>({
            query: (params) => ({
                url: "/addresses",
                params
            }),
            providesTags: ['Address'],
        }),
        addAddress: builder.mutation<any, any>({
            query: (params) => ({
                url: "/addresses",
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['Address'],
        }),
        editAddress: builder.mutation<any, any>({
            query: (params) => ({
                url: `/addresses/${params.id}`,
                method: 'PUT',
                body: params,
            }),
            invalidatesTags: ['Address'],
        }),
        deleteAddress: builder.mutation<any, any>({
            query: (params) => ({
                url: `/addresses/${params.id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Address'],
        }),
        sendApplication: builder.mutation<any, any>({
            query: (params) => ({
                url: "/application",
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['Application'],
        }),
        getApplication: builder.query<any, void>({
            query: (params) => ({
                url: "/application",
                body: params,
            }),
            providesTags: ['Application'],
        }),
        getExecutorAvailableSlots: builder.query<{ timestamp: number }[], {
            date: string;
            serviceVariantId: number;
            optionIds?: number[];
        }>({
            query: ({ date, serviceVariantId, optionIds }) => ({
                url: `/schedule/available-slots`,
                method: 'GET',
                params: { 
                    date,
                    serviceVariantId,
                    optionIds: optionIds?.join(',')
                }
            }),
        }),
        getAvailableDates: builder.query<string[], { serviceVariantId: number; optionIds: number[] }>({
            query: ({ serviceVariantId, optionIds }) => ({
                url: '/schedule/available-dates',
                params: { serviceVariantId, optionIds },
            }),
        }),
    })
});

export const {
    useGetBonusesQuery,
    useLoginMutation,
    useGetUserInfoQuery,
    useGetServicesQuery,
    useGetAddressesQuery,
    useAddAddressMutation,
    useEditAddressMutation,
    useDeleteAddressMutation,
    useUpdateScheduleMutation,
    useGetScheduleQuery,
    useGetApplicationQuery,
    useSendApplicationMutation,
    useGetExecutorAvailableSlotsQuery,
    useGetAvailableDatesQuery,
} = api;