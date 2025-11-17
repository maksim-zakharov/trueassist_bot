import { createApi} from "@reduxjs/toolkit/query/react";
import {fetchBaseQuery} from "@reduxjs/toolkit/query";

export const openstreetmapApi = createApi({
    reducerPath: "openstreetmapApi",
    tagTypes: [
        "Reverse"
    ],
    baseQuery: fetchBaseQuery({ baseUrl: 'https://nominatim.openstreetmap.org' }),
    endpoints: (builder) => ({
        getReverse: builder.mutation<any, { lat: number, lon: number }>({
            query: (params) => ({
                url: `/reverse`,
                method: 'GET',
                params: {
                    ...params,
                    format: 'json',
                    'accept-language': 'en'
                }
            }),
            invalidatesTags: ['Reverse'],
        }),
    })
});

export const {
    useGetReverseMutation
} = openstreetmapApi;