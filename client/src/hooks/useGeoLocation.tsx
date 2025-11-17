import {useEffect} from "react";
import {useGetReverseMutation} from "../api/openstreetmap.api.ts";
import {useDispatch} from "react-redux";
import {updateGeo} from "../slices/createOrderSlice.ts";

export const useGeoLocation = ({enabled}: { enabled: boolean }) => {
    const dispatch = useDispatch();
    const [reverse] = useGetReverseMutation();

    useEffect(() => {
        if (!enabled) {
            return;
        }
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const data = await reverse({lat: pos.coords.latitude, lon: pos.coords.longitude}).unwrap()
            dispatch(updateGeo(data))
        });
    }, [dispatch, reverse, enabled]);
}