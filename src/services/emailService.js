const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;

export const sendOrderConfirmationEmail = async (order, customerEmail) => {
    if (!BREVO_API_KEY) {
        console.error('❌ BREVO API KEY NOT FOUND - Check .env file');
        return;
    }

    try {
        const itemsListHtml = order.cart_items.map(item =>
            `<li>${item.productName} (${item.varietyName}) - ${item.quantity} x ${item.quantityKg}kg - ₹${item.price * item.quantity}</li>`
        ).join('');

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: "BSR Orchids",
                    email: "orchids.bsr@gmail.com"
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
                        <p style="font-size: 12px; color: #666;">BSR Orchids Team</p>
                    </div>
                `
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ Brevo API Error:", errorData);
        } else {
            console.log("✅ Order confirmation email sent successfully!");
        }
    } catch (error) {
        console.error("❌ Email service error:", error);
    }
};
