/**
 * Service to interact with Baserow Database
 */

export const saveOrderToBaserow = async (order) => {
    // Configuration
    const TABLE_ID = "768923";
    const API_TOKEN = "nAkq4vySqytbVFpjUT0lDOQsiOK9iLUC";
    const BASE_URL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/?user_field_names=true`;

    try {
        console.log("Saving order to Baserow...", order.id);

        // Map Items to readable string
        // Assuming order.cart_items or order.items exists
        // Structure based on Admin.jsx usage: item.productName || item.varietyName, quantity, quantityKg
        const itemsList = (order.cart_items || []).map(item => {
            const name = item.productName || item.varietyName || "Unknown Item";
            const qty = item.quantity || 1;
            const weight = item.quantityKg ? `${item.quantityKg}kg` : '';
            return `${qty}x ${name} ${weight}`.trim();
        }).join(", ");

        // Customer Details: Name + Address
        const customerName = order.customer_details?.name || "Guest";
        let addressStr = "";
        const addr = order.customer_details?.address;
        if (typeof addr === 'string') {
            addressStr = addr;
        } else if (addr) {
            addressStr = `${addr.addressLine1 || ''}, ${addr.city || ''} ${addr.pincode || ''}`;
        }
        const customerDetails = `${customerName} - ${addressStr}`;

        // Prepare Payload
        // Sync Order ID format with Admin/Email (First 8 chars, uppercase)
        const shortOrderId = order.id ? order.id.slice(0, 8).toUpperCase() : order.id;

        const payload = {
            "Order ID": shortOrderId,
            "Customer Details": customerDetails,
            "Order Status": "Pending", // Matches Single Select "Pending"
            "Items": itemsList,
            "Total Amount": order.total_price || order.totalAmount || 0
        };

        // Send POST Request
        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Authorization": `Token ${API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Baserow Error Response:", errorData);
            throw new Error(`Baserow API responded with status ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Order successfully saved to Baserow:", data.id);
        return true;

    } catch (error) {
        // Robus Error Handling: Log but DO NOT throw to main thread
        console.error("⚠️ Failed to save order to Baserow:", error.message);
        // We explicitly return false but do not reject the promise
        return false;
    }
};
