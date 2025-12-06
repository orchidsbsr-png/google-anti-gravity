/**
 * Cashfree Payment Integration
 * 
 * SETUP:
 * 1. Sign up: https://www.cashfree.com/
 * 2. Get credentials from: https://merchant.cashfree.com/merchant/pg
 * 3. Add to .env:
 *    VITE_CASHFREE_APP_ID=CFxxxxx
 *    VITE_CASHFREE_MODE=TEST (or PROD)
 * 4. See CASHFREE_SETUP.md for details
 */

const CASHFREE_APP_ID = import.meta.env.VITE_CASHFREE_APP_ID || 'CF_TEST_REPLACE_WITH_YOUR_APP_ID';
const CASHFREE_MODE = import.meta.env.VITE_CASHFREE_MODE || 'TEST';

/**
 * Load Cashfree SDK
 */
export const loadCashfree = () => {
    return new Promise((resolve) => {
        // Cashfree Checkout SDK
        const script = document.createElement('script');
        const mode = CASHFREE_MODE === 'PROD' ? 'prod' : 'sandbox';
        script.src = `https://sdk.cashfree.com/js/v3/${mode}/cashfree.js`;
        script.onload = () => {
            console.log('✅ Cashfree SDK loaded');
            resolve(true);
        };
        script.onerror = () => {
            console.error('❌ Failed to load Cashfree SDK');
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

/**
 * Create Cashfree Order
 * Note: In production, this should be done on your backend for security
 */
export const createCashfreeOrder = async (orderDetails) => {
    const { amount, orderId, customerDetails } = orderDetails;

    // In production, call your backend API here
    // Backend will create order using Cashfree API with secret key

    // For testing, we'll create a mock order structure
    const orderData = {
        order_id: `CF_ORDER_${orderId}_${Date.now()}`,
        order_amount: parseFloat(amount).toFixed(2),
        order_currency: 'INR',
        customer_details: {
            customer_id: `CUST_${Date.now()}`,
            customer_name: customerDetails.name,
            customer_email: customerDetails.email || 'customer@farmfresh.com',
            customer_phone: customerDetails.phone
        },
        order_meta: {
            return_url: `${window.location.origin}/order-confirmation`,
            notify_url: `${window.location.origin}/api/cashfree/webhook` // Your backend webhook
        }
    };

    console.log('📦 Cashfree order created:', orderData);
    return orderData;
};

/**
 * Initiate Cashfree Payment
 * 
 * @param {Object} options - Payment options
 * @param {number} options.amount - Amount in rupees
 * @param {string} options.orderId - Your order ID
 * @param {Object} options.customerDetails - Customer information
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onFailure - Failure callback
 */
export const initiateCashfreePayment = async (options) => {
    const {
        amount,
        orderId,
        customerDetails,
        onSuccess,
        onFailure
    } = options;

    try {
        // Load Cashfree SDK
        const loaded = await loadCashfree();
        if (!loaded) {
            throw new Error('Failed to load Cashfree SDK');
        }

        // Create order
        const cashfreeOrder = await createCashfreeOrder({
            amount,
            orderId,
            customerDetails
        });

        // Initialize Cashfree
        const cashfree = window.Cashfree({
            mode: CASHFREE_MODE === 'PROD' ? 'production' : 'sandbox'
        });

        // Payment options
        const paymentOptions = {
            paymentSessionId: cashfreeOrder.order_id, // In production, get session_id from backend
            returnUrl: `${window.location.origin}/payment-status`,
            redirectTarget: '_modal' // Open in popup modal
        };

        // Checkout configuration
        const checkoutConfig = {
            paymentMethod: {
                // Enable all payment methods
                upi: true,
                card: true,
                netBanking: true,
                wallet: true,
                emi: false
            },
            theme: {
                backgroundColor: '#7FB347',
                primaryColor: '#7FB347',
                color: '#ffffff'
            },
            customerDetails: {
                customerId: cashfreeOrder.customer_details.customer_id,
                customerName: customerDetails.name,
                customerPhone: customerDetails.phone,
                customerEmail: customerDetails.email || ''
            }
        };

        // Payment callbacks
        cashfree.checkout({
            ...paymentOptions,
            ...checkoutConfig,
            onSuccess: (data) => {
                console.log('✅ Payment successful:', data);
                onSuccess?.(data);
            },
            onFailure: (error) => {
                console.error('❌ Payment failed:', error);
                onFailure?.(error.message || 'Payment failed');
            },
            onNavigate: (data) => {
                console.log('Payment navigation:', data);
            }
        });

    } catch (error) {
        console.error('❌ Cashfree payment error:', error);
        onFailure?.(error.message || 'Payment initialization failed');
    }
};

/**
 * Verify Payment (should be done on backend)
 */
export const verifyCashfreePayment = async (orderId, paymentId) => {
    // In production, call your backend to verify payment
    // Backend will use Cashfree API with secret key to verify

    console.log('Verifying payment:', { orderId, paymentId });

    // For testing, assume verification passed
    return Promise.resolve(true);
};

/**
 * Test Cashfree configuration
 */
export const testCashfree = () => {
    if (!CASHFREE_APP_ID || CASHFREE_APP_ID === 'CF_TEST_REPLACE_WITH_YOUR_APP_ID') {
        console.error('❌ Cashfree App ID not configured!');
        console.log('📖 Please follow CASHFREE_SETUP.md to set up Cashfree');
        return false;
    }

    console.log('✅ Cashfree configured');
    console.log('   App ID:', CASHFREE_APP_ID);
    console.log('   Mode:', CASHFREE_MODE);
    return true;
};

export default {
    initiateCashfreePayment,
    testCashfree
};
