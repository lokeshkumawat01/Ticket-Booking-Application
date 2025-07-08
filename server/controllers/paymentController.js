const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance with proper key formatting
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID.trim(),
  key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
});

/**
 * Create a new Razorpay order
 */
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'ticket_receipt_' + Date.now() } = req.body;
    
    // Validate request
    if (!amount) {
      return res.status(400).json({ success: false, error: 'Amount is required' });
    }

    console.log('Creating order with credentials:', {
      keyId: process.env.RAZORPAY_KEY_ID,
      // Don't log the actual secret, just log that it exists
      hasSecret: !!process.env.RAZORPAY_KEY_SECRET,
      amount: amount * 100,
      currency,
      receipt
    });

    // Create order options
    const options = {
      amount: amount * 100, // Convert to smallest currency unit (paise)
      currency,
      receipt,
      payment_capture: 1, // Auto-capture payment
    };

    // Create order
    const order = await razorpay.orders.create(options);

    // Return order details
    res.json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        key_id: process.env.RAZORPAY_KEY_ID.trim(), // Include key_id for frontend
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      details: error.message,
    });
  }
};

/**
 * Verify payment signature
 */
exports.verifyPayment = (req, res) => {
  try {
    // Get payment details from request body
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Validate request
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment verification parameters',
      });
    }

    // Create signature verification string
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    // Verify signature
    if (digest === razorpay_signature) {
      // Payment is legitimate
      res.json({
        success: true,
        data: {
          verified: true,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          signature: razorpay_signature,
        },
      });
    } else {
      // Invalid signature
      res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment',
      details: error.message,
    });
  }
};

/**
 * Handle webhook events
 */
exports.handleWebhook = (req, res) => {
  try {
    // Verify webhook signature
    const webhookSignature = req.headers['x-razorpay-signature'];
    
    if (!webhookSignature) {
      return res.status(400).json({ success: false, error: 'Missing webhook signature' });
    }

    // Create signature verification
    const shasum = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    // Verify webhook signature
    if (digest === webhookSignature) {
      // Process the webhook event
      const event = req.body;
      console.log('Webhook event received:', event);

      // Handle different event types
      if (event.event === 'payment.captured') {
        // Payment was successful
        console.log('Payment captured successfully:', event.payload.payment.entity);
        // Here you would update your database, mark the order as paid, etc.
      }

      res.json({ success: true });
    } else {
      // Invalid webhook signature
      res.status(400).json({ success: false, error: 'Invalid webhook signature' });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
      details: error.message,
    });
  }
};