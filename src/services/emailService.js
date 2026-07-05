import { BRAND } from '../config/brand';

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;

export const sendOrderConfirmationEmail = async (order, customerEmail) => {
    if (!BREVO_API_KEY) {
        console.error('❌ BREVO API KEY NOT FOUND - Check .env file');
        return;
    }

    try {
        const inr = (n) => Number(n || 0).toLocaleString('en-IN');

        const itemsRowsHtml = order.cart_items.map(item => `
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E4D8; font-family: Georgia, serif; font-size: 15px; color: #1C2313;">
                    ${item.productName}
                    <span style="display: block; font-family: Arial, sans-serif; font-size: 12px; color: #83866F; padding-top: 3px;">
                        ${item.varietyName} &middot; ${item.quantityKg}kg &times; ${item.quantity} box${item.quantity > 1 ? 'es' : ''}
                    </span>
                </td>
                <td align="right" style="padding: 12px 0; border-bottom: 1px solid #E8E4D8; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #1C2313; white-space: nowrap;">
                    ₹${inr(item.price * item.quantity)}
                </td>
            </tr>`
        ).join('');

        const orderRef = order.id ? order.id.slice(0, 8).toUpperCase() : 'PENDING';

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
                subject: `Your fruit is being picked — Order #${orderRef}`,
                htmlContent: `
                    <div style="background-color: #F7F4EC; padding: 32px 16px; margin: 0;">
                        <div style="max-width: 580px; margin: 0 auto;">

                            <!-- Header -->
                            <div style="background-color: #2D3319; border-radius: 18px 18px 0 0; padding: 40px 36px; text-align: center;">
                                <p style="margin: 0 0 14px; font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #C9A227;">
                                    Order Confirmed &middot; #${orderRef}
                                </p>
                                <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-weight: normal; font-size: 30px; line-height: 1.2; color: #F7F4EC;">
                                    Your fruit is being <em>picked.</em>
                                </h1>
                                <p style="margin: 18px 0 0; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.7; color: rgba(247,244,236,0.75);">
                                    Hi ${order.customer_details.name}, thank you for ordering from our orchard.
                                    We harvest only after you order &mdash; that's why it tastes like the mountains.
                                </p>
                            </div>

                            <!-- Body -->
                            <div style="background-color: #FDFCF7; border: 1px solid #E8E4D8; border-top: none; border-radius: 0 0 18px 18px; padding: 32px 36px;">

                                <p style="margin: 0 0 6px; font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #C44536;">
                                    Your Harvest
                                </p>
                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                    ${itemsRowsHtml}
                                    <tr>
                                        <td style="padding: 16px 0 0; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #83866F;">
                                            Total &middot; ${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                                        </td>
                                        <td align="right" style="padding: 16px 0 0; font-family: Georgia, serif; font-size: 22px; color: #1C2313;">
                                            ₹${inr(order.total_price)}
                                        </td>
                                    </tr>
                                </table>

                                ${order.is_gift && order.gift_note ? `
                                <div style="margin-top: 24px; background-color: #F2EDE0; border-left: 3px solid #C9A227; border-radius: 0 10px 10px 0; padding: 14px 18px;">
                                    <p style="margin: 0 0 4px; font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #C9A227;">Gift Note</p>
                                    <p style="margin: 0; font-family: Georgia, serif; font-style: italic; font-size: 14px; color: #4A4F3E;">&ldquo;${order.gift_note}&rdquo;</p>
                                </div>` : ''}

                                <!-- Journey -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; border-collapse: collapse; text-align: center;">
                                    <tr>
                                        <td style="font-family: Arial, sans-serif; font-size: 11px; color: #4A6B2A; font-weight: bold;">&#9679; Harvest</td>
                                        <td style="font-family: Arial, sans-serif; font-size: 11px; color: #B9B7A8;">&#9675; Pack</td>
                                        <td style="font-family: Arial, sans-serif; font-size: 11px; color: #B9B7A8;">&#9675; Ship</td>
                                        <td style="font-family: Arial, sans-serif; font-size: 11px; color: #B9B7A8;">&#9675; Doorstep</td>
                                    </tr>
                                </table>

                                <p style="margin: 26px 0 0; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.7; color: #4A4F3E; text-align: center;">
                                    We'll write to you when your box leaves the valley.
                                </p>

                                <div style="text-align: center; margin-top: 22px;">
                                    <a href="https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(`Hello! I have a question about order #${orderRef}.`)}"
                                       style="display: inline-block; background-color: #2D3319; color: #F7F4EC; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; padding: 13px 28px; border-radius: 30px;">
                                        Chat with the farmer
                                    </a>
                                </div>
                            </div>

                            <p style="margin: 22px 0 0; text-align: center; font-family: Arial, sans-serif; font-size: 11px; color: #83866F;">
                                Farm Fresh &middot; ${BRAND.originShort}<br>
                                Four generations, father to son, above the Hatkoti valley.
                            </p>
                        </div>
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
