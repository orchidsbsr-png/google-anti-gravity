// Client-side web-push helpers. The service worker (public/sw.js) shows
// the notifications; api/_lib/push.js sends them.

import { supabase } from '../supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const pushSupported = () =>
    'serviceWorker' in navigator && 'PushManager' in window && Boolean(VAPID_PUBLIC_KEY);

export const pushEnabled = () =>
    pushSupported() && Notification.permission === 'granted';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// Ask permission, subscribe this browser, and save the subscription
// against the user so order-status webhooks can reach them.
export async function enableOrderNotifications(userId) {
    if (!pushSupported() || !userId) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    const { error } = await supabase.from('push_subscriptions').upsert({
        endpoint: subscription.endpoint,
        user_id: userId,
        data: subscription.toJSON()
    });

    if (error) {
        console.error('Failed to save push subscription:', error);
        return false;
    }
    return true;
}
