/**
 * Service to interact with Google Sheets (via SheetDB)
 * Proxied via backend to use secure Env Vars
 */

export const saveOrderToSheet = async (order) => {
    try {
        console.log("Saving order to Google Sheet via API...", order.id);

        const response = await fetch('/api/sync_to_sheets', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ order })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("SheetDB Sync API Failed:", data.error);
            return false;
        }

        console.log("✅ Order successfully synced to Sheet:", data.id);
        return true;

    } catch (error) {
        console.error("⚠️ Failed to call Sheet API:", error.message);
        return false;
    }
};
