const functions = require('firebase-functions');
const fetch = require('node-fetch');

// This function sends order confirmation emails via Brevo
exports.sendOrderEmail = functions.https.onCall(async (data, context) => {
    // Security: Verify the request is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to send emails'
        );
    }

    const { order, customerEmail } = data;

    // Validate input
    if (!order || !customerEmail) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Order data and customer email are required'
        );
    }

    // Get the API key from environment config
    const BREVO_API_KEY = functions.config().brevo.apikey;

    if (!BREVO_API_KEY) {
        console.error('Brevo API key not configured');
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Email service not configured'
        );
    }

    try {
        // Build items list HTML
        const itemsListHtml = order.cart_items.map(item =>
            `<li>${item.productName} (${item.varietyName}) - ${item.quantity} x ${item.quantityKg}kg - ₹${item.price * item.quantity}</li>`
        ).join('');

        // Send email via Brevo API
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: "Farm Fresh",
                    email: "orders@farmfresh.com"
                },
                to: [
                    {
                        email: customerEmail,
                        name: order.customer_details.name
                    }
                ],
                subject: `Order Confirmation - #${order.id ? order.id.slice(0, 8).toUpperCase() : 'New Order'}`,
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #4a5d23;">Thank you for your order!</h1>
                        <p>Hi ${order.customer_details.name},</p>
                        <p>We have received your order successfully. Here are the details:</p>
                        
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3>Order Summary</h3>
                            <p><strong>Order ID:</strong> #${order.id ? order.id.slice(0, 8).toUpperCase() : 'PENDING'}</p>
                            <p><strong>Total Amount:</strong> ₹${order.total_price}</p>
                            <p><strong>Payment Method:</strong> ${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                        </div>

                        <h3>Items Ordered:</h3>
                        <ul>
                            ${itemsListHtml}
                        </ul>

                        <p>We will notify you once your order is out for delivery.</p>
                        <hr>
                        <p style="font-size: 12px; color: #666;">Farm Fresh Team</p>
                    </div>
                `
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Brevo API Error:", errorData);
            throw new functions.https.HttpsError(
                'internal',
                'Failed to send email'
            );
        }

        console.log("✅ Order confirmation email sent to:", customerEmail);
        return { success: true, message: 'Email sent successfully' };

    } catch (error) {
        console.error("Email sending error:", error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to send email: ' + error.message
        );
    }
});
