/**
 * Razorpay Payment Integration
 * 
 * SETUP REQUIRED:
 * 1. Sign up at https://razorpay.com/
 * 2. Get API Key from Dashboard
 * 3. Add to .env: VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
 * 4. See RAZORPAY_SETUP.md for complete guide
 */

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_REPLACE_WITH_YOUR_KEY';

/**
 * Load Razorpay SDK
 */
export const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

/**
 * Create Razorpay Order
 * 
 * @param {Object} orderDetails - Order information
 * @param {number} orderDetails.amount - Amount in rupees (will be converted to paise)
 * @param {string} orderDetails.currency - Currency code (default: INR)
 * @param {string} orderDetails.receipt - Order receipt/ID
 * @returns {Promise<Object>} Razorpay order
 */
export const createRazorpayOrder = async (orderDetails) => {
    // In production, this should call your backend API
    // Backend will create order using Razorpay API and return order_id

    // For now, we'll create order on frontend for testing
    // NOTE: In production, NEVER expose Key Secret on frontend!

    const amount = Math.round(orderDetails.amount * 100); // Convert to paise

    return {
        order_id: `order_${Date.now()}`, // In production, this comes from backend
        amount: amount,
        currency: orderDetails.currency || 'INR',
        receipt: orderDetails.receipt
    };
};

/**
 * Open Razorpay Payment Checkout
 * 
 * @param {Object} options - Payment options
 * @param {number} options.amount - Total amount in rupees
 * @param {string} options.orderId - Firestore order ID
 * @param {Object} options.customerDetails - Customer info
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onFailure - Failure callback
 */
export const initiatePayment = async (options) => {
    const {
        amount,
        orderId,
        customerDetails,
        onSuccess,
        onFailure
    } = options;

    // Load Razorpay SDK
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        onFailure?.('SDK Load Failed');
        return;
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
        amount: amount,
        currency: 'INR',
        receipt: orderId
    });

    // Razorpay options
    const razorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Farm Fresh',
        description: 'Fresh Organic Fruits',
        image: '/logo.png', // Optional: Add your logo
        order_id: razorpayOrder.order_id,

        // Customer details (pre-fill)
        prefill: {
            name: customerDetails.name,
            email: customerDetails.email || '',
            contact: customerDetails.phone
        },

        // Theme
        theme: {
            color: '#7FB347' // Your app's primary green color
        },

        // Payment methods
        config: {
            display: {
                blocks: {
                    banks: {
                        name: 'All payment methods',
                        instruments: [
                            {
                                method: 'upi'
                            },
                            {
                                method: 'card'
                            },
                            {
                                method: 'netbanking'
                            },
                            {
                                method: 'wallet'
                            }
                        ]
                    }
                },
                sequence: ['block.banks'],
                preferences: {
                    show_default_blocks: true
                }
            }
        },

        // Success handler
        handler: function (response) {
            console.log('✅ Payment Success:', response);

            // Verify payment on backend (in production)
            verifyPayment(response, orderId)
                .then(() => {
                    onSuccess?.(response);
                })
                .catch((error) => {
                    console.error('Payment verification failed:', error);
                    onFailure?.('Verification Failed');
                });
        },

        // Modal options
        modal: {
            ondismiss: function () {
                console.log('Payment cancelled by user');
                onFailure?.('Payment Cancelled');
            },

            // Escape key
            escape: true,

            // Backdrop click
            backdropclose: false
        }
    };

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(razorpayOptions);

    razorpay.on('payment.failed', function (response) {
        console.error('❌ Payment Failed:', response.error);
        onFailure?.(response.error.description);
    });

    razorpay.open();
};

/**
 * Verify payment signature (should be done on backend in production)
 * 
 * @param {Object} response - Razorpay payment response
 * @param {string} orderId - Order ID
 * @returns {Promise<boolean>}
 */
const verifyPayment = async (response, orderId) => {
    // In production, send this to your backend to verify:
    // - response.razorpay_order_id
    // - response.razorpay_payment_id
    // - response.razorpay_signature

    // Backend should verify signature using Key Secret and update order status

    console.log('Payment verification data:', {
        orderId: orderId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
    });

    // For now, we'll assume verification passed
    return Promise.resolve(true);
};

/**
 * Test Razorpay Integration
 */
export const testRazorpay = () => {
    if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'rzp_test_REPLACE_WITH_YOUR_KEY') {
        console.error('❌ Razorpay Key not configured!');
        console.log('📖 Please follow RAZORPAY_SETUP.md to set up Razorpay');
        return false;
    }

    console.log('✅ Razorpay configured with key:', RAZORPAY_KEY_ID);
    return true;
};

export default {
    initiatePayment,
    testRazorpay
};
