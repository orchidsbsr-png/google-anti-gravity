/**
 * Service to interact with Baserow Database
 * NOW PROXIED VIA BACKEND to use secure Env Vars
 */

export const saveOrderToBaserow = async (order) => {
    try {
        console.log("Saving order to Baserow via API...", order.id);

        const response = await fetch('/api/sync_to_baserow', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ order })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Baserow Sync API Failed:", data.error);
            // We return false but don't crash the app
            return false;
        }

        console.log("✅ Order successfully synced to Baserow:", data.id);
        return true;

    } catch (error) {
        console.error("⚠️ Failed to call Baserow Sync API:", error.message);
        return false;
    }
};
