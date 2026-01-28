import { createApi} from "@reduxjs/toolkit/query/react";
import {baseQueryWithReauth} from "./baseQuery.ts";

export const ordersApi = createApi({
    reducerPath: "ordersApi",
    tagTypes: [
        "Order", 'User', 'Service', 'Variant', 'Application', 'Invite', 'Chat', 'Message'
    ],
    baseQuery: (...args) => baseQueryWithReauth(...args),
    endpoints: (builder) => ({
        getOrderById: builder.query<any, { id: number | string }>({
            query: (params) => ({
                url: `/orders/${params.id}`,
                params
            }),
            providesTags: ['Order'],
        }),
        getOrders: builder.query<any[], void>({
            query: (params) => ({
                url: "/orders",
                params
            }),
            providesTags: ['Order'],
        }),
        getAdminVariants: builder.query<any[], void>({
            query: (params) => ({
                url: "/admin/variants",
                params
            }),
            providesTags: ['Variant'],
        }),
        getAdminServices: builder.query<any[], void>({
            query: (params) => ({
                url: "/admin/services",
                params
            }),
            providesTags: ['Service'],
        }),
        getAdminApplications: builder.query<any, void>({
            query: (params) => ({
                url: `/admin/applications`,
            }),
            providesTags: ['Application'],
        }),
        getAdminApplicationByUserId: builder.query<any, { id: number | string }>({
            query: (params) => ({
                url: `/admin/applications/${params.id}`,
            }),
            providesTags: ['Application'],
        }),
        getAdminServicesById: builder.query<any, { id: number | string }>({
            query: (params) => ({
                url: `/admin/services/${params.id}`,
                params
            }),
            providesTags: ['Service'],
        }),
        deleteAdminServiceById: builder.mutation<void, { id: number | string }>({
            query: (params) => ({
                url:`/admin/services/${params.id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Service'],
        }),
        restoreAdminServiceById: builder.mutation<void, { id: number | string }>({
            query: (params) => ({
                url:`/admin/services/${params.id}`,
                method: 'POST',
            }),
            invalidatesTags: ['Service'],
        }),
        addAdminService: builder.mutation<any, any>({
            query: (params) => ({
                url: "/admin/services",
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['Service'],
        }),
        editAdminServiceById: builder.mutation<void, any>({
            query: (params) => ({
                url:`/admin/services/${params.id}`,
                method: 'PUT',
                body: params
            }),
            invalidatesTags: ['Service'],
        }),
        getAdminUsers: builder.query<any[], void>({
            query: (params) => ({
                url: "/admin/users",
                params
            }),
            providesTags: ['User'],
        }),
        getAdminUserById: builder.query<any, { id: number | string }>({
            query: (params) => ({
                url: `/admin/users/${params.id}`
            }),
            providesTags: ['User'],
        }),
        getAdminOrdersByUserId: builder.query<any, { id: number | string }>({
            query: (params) => ({
                url: `/admin/users/${params.id}/orders`
            }),
            providesTags: ['Order'],
        }),
        getAdminBonusesByUserId: builder.query<any, { id: number | string }>({
            query: (params) => ({
                url: `/admin/users/${params.id}/bonuses`
            }),
            providesTags: ['Invite'],
        }),
        deleteAdminUserById: builder.mutation<void, { id: string }>({
            query: (params) => ({
                url: `/admin/users/${params.id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User', 'Order', 'Application', 'Invite', 'Chat'],
        }),
        addBonus: builder.mutation<void, any>({
            query: (params) => ({
                url: `/admin/users/${params.id}/bonuses`,
                method: 'POST',
                body: params
            }),
            invalidatesTags: ['Invite'],
        }),
        getAdminOrders: builder.query<any[], void>({
            query: (params) => ({
                url: "/admin/orders",
                params
            }),
            providesTags: ['Order'],
        }),
        getAdminChats: builder.query<any[], void>({
            query: (params) => ({
                url: "/admin/chat",
                params
            }),
            providesTags: ['Chat'],
        }),
        getAdminChatDetails: builder.query<any, { id: number | string }>({
            query: (params) => ({
                url: `/admin/chat/${params.id}`,
                params
            }),
            providesTags: ['Chat'],
        }),
        sendAdminChatMessage: builder.mutation<any, any>({
            query: (params) => ({
                url: `admin/chat/${params.id}`,
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['Chat'],
        }),
        startAdminChatMessage: builder.mutation<any, any>({
            query: (params) => ({
                url: `admin/chat/${params.id}/start`,
                method: 'POST',
            }),
            invalidatesTags: ['Chat'],
        }),
        closeAdminChatMessage: builder.mutation<any, any>({
            query: (params) => ({
                url: `admin/chat/${params.id}/close`,
                method: 'POST',
            }),
            invalidatesTags: ['Chat'],
        }),
        deleteAdminChatMessage: builder.mutation<any, { chatId: number | string, id: number | string }>({
            query: (params) => ({
                url: `admin/chat/${params.chatId}/messages/${params.id}`,
                method: 'DELETE',
                body: params,
            }),
            invalidatesTags: ['Message'],
        }),
        getAdminOrderById: builder.query<any, { id: number | string }>({
            query: (params) => ({
                url: `/admin/orders/${params.id}`,
                params
            }),
            providesTags: ['Order'],
        }),
        editAdminOrder: builder.mutation<any, any>({
            query: (params) => ({
                url: `admin/orders/${params.id}`,
                method: 'PUT',
                body: params,
            }),
            invalidatesTags: ['Order'],
        }),
        patchAdminOrder: builder.mutation<any, any>({
            query: (params) => ({
                url: `admin/orders/${params.id}`,
                method: 'PATCH',
                body: params,
            }),
            invalidatesTags: ['Order'],
        }),
        cancelAdminOrder: builder.mutation<any, any>({
            query: (params) => ({
                url: `admin/orders/${params.id}/cancel`,
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['Order'],
        }),
        restoreAdminOrder: builder.mutation<any, any>({
            query: (params) => ({
                url: `admin/orders/${params.id}`,
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['Order'],
        }),
        addOrder: builder.mutation<any, any>({
            query: (params) => ({
                url: "/orders",
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['Order'],
        }),
        editOrder: builder.mutation<any, any>({
            query: (params) => ({
                url: `/orders/${params.id}`,
                method: 'PUT',
                body: params,
            }),
            invalidatesTags: ['Order'],
        }),
        processedOrder: builder.mutation<any, any>({
            query: (params) => ({
                url: `/executor/orders/${params.id}/processed`,
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['Order'],
        }),
        rejectExecutorOrder: builder.mutation<any, any>({
            query: (params) => ({
                url: `/executor/orders/${params.id}/reject`,
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['Order'],
        }),
        approveApplication: builder.mutation<any, any>({
            query: (params) => ({
                url: `/admin/applications/${params.id}/approve`,
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['Application'],
        }),
        rejectApplication: builder.mutation<any, any>({
            query: (params) => ({
                url: `/admin/applications/${params.id}/reject`,
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['Application'],
        }),
        completeOrder: builder.mutation<any, any>({
            query: (params) => ({
                url: `/executor/orders/${params.id}/complete`,
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['Order'],
        }),
        cancelOrder: builder.mutation<any, any>({
            query: (params) => ({
                url: `/orders/${params.id}/cancel`,
                method: 'POST',
                body: params,
            }),
            invalidatesTags: ['Order'],
        }),
        patchOrder: builder.mutation<any, any>({
            query: (params) => ({
                url: `/orders/${params.id}`,
                method: 'PATCH',
                body: params,
            }),
            invalidatesTags: ['Order'],
        }),
        getExecutorOrders: builder.query<any[], void>({
            query: (params) => ({
                url: "/executor/orders",
                params
            }),
            providesTags: ['Order'],
        }),
        getOrderByIdFromExecutor: builder.query<any, { id: number | string }>({
            query: (params) => ({
                url: `/executor/orders/${params.id}`,
                params
            }),
            providesTags: ['Order'],
        }),
        patchExecutorOrder: builder.mutation<any, any>({
            query: (params) => ({
                url: `executor/orders/${params.id}`,
                method: 'PATCH',
                body: params,
            }),
            invalidatesTags: ['Order'],
        }),
    })
});

export const {
    useGetOrdersQuery,
    useAddOrderMutation,
    useGetOrderByIdQuery,
    useCancelOrderMutation,
    useGetAdminUsersQuery,
    useEditOrderMutation,
    useGetAdminVariantsQuery,
    useGetAdminServicesQuery,
    useGetAdminBonusesByUserIdQuery,
    useGetAdminApplicationByUserIdQuery,
    useGetAdminUserByIdQuery,
    useDeleteAdminUserByIdMutation,
    useGetAdminServicesByIdQuery,
    useGetOrderByIdFromExecutorQuery,
    usePatchOrderMutation,
    useGetExecutorOrdersQuery,
    useCompleteOrderMutation,
    useProcessedOrderMutation,
    useRejectExecutorOrderMutation,
    useGetAdminOrdersByUserIdQuery,
    useGetAdminOrdersQuery,
    useApproveApplicationMutation,
    useAddBonusMutation,
    useRejectApplicationMutation,
    useGetAdminApplicationsQuery,
    useAddAdminServiceMutation,
    useDeleteAdminServiceByIdMutation,
    useRestoreAdminServiceByIdMutation,
    useEditAdminServiceByIdMutation,
    useGetAdminOrderByIdQuery,
    useEditAdminOrderMutation,
    usePatchAdminOrderMutation,
    usePatchExecutorOrderMutation,
    useCancelAdminOrderMutation,
    useRestoreAdminOrderMutation,
    useGetAdminChatsQuery,
    useGetAdminChatDetailsQuery,
    useSendAdminChatMessageMutation,
    useDeleteAdminChatMessageMutation,
    useStartAdminChatMessageMutation,
    useCloseAdminChatMessageMutation
} = ordersApi;
