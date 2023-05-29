import { useEffect } from 'react';
import {EventsOn, EventsOnce, EventsOff} from "../wailsjs/runtime/runtime.js";

export function useEventSubscription(eventName, eventHandler) {
    useEffect(() => {
        EventsOn(eventName, eventHandler);
        return () => {
            EventsOff(eventName);
        };
    }, [eventName, eventHandler]);
}

export function useEventSubscriptionOnce(eventName, eventHandler) {
    useEffect(() => {
        EventsOnce(eventName, eventHandler);
        return () => {}
    }, [eventName, eventHandler]);
}
