// Web Push via VAPID. Set in Vercel env vars:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  (generate once: npx web-push generate-vapid-keys)
//   VITE_VAPID_PUBLIC_KEY must hold the same public key for the client.
// Subscriptions are stored in the push_subscriptions table (see SUPABASE_MIGRATIONS.sql).

import webpush from 'web-push';
import { supabaseAdmin } from './supabase_admin.js';

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const configured = Boolean(publicKey && privateKey);

if (configured) {
    webpush.setVapidDetails('mailto:orchids.bsr@gmail.com', publicKey, privateKey);
}

// payload: { title, body, url }
export async function sendPushToUser(userId, payload) {
    if (!configured || !supabaseAdmin) return;
    if (!userId || userId === 'guest') return;

    const { data: subs, error } = await supabaseAdmin
        .from('push_subscriptions')
        .select('endpoint, data')
        .eq('user_id', userId);

    if (error || !subs || subs.length === 0) return;

    await Promise.all(subs.map(async (sub) => {
        try {
            await webpush.sendNotification(sub.data, JSON.stringify(payload));
        } catch (err) {
            // 404/410 = subscription expired or unsubscribed — clean it up
            if (err.statusCode === 404 || err.statusCode === 410) {
                await supabaseAdmin
                    .from('push_subscriptions')
                    .delete()
                    .eq('endpoint', sub.endpoint);
            } else {
                console.error(`Push send failed (${err.statusCode || '?'}):`, err.message);
            }
        }
    }));
}
