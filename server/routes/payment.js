const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

/**
 * Create a new Razorpay order
 * POST /api/orders
 */
router.post('/orders', paymentController.createOrder);

/**
 * Verify payment signature
 * POST /api/verify-payment
 */
router.post('/verify-payment', paymentController.verifyPayment);

/**
 * Webhook for payment events
 * POST /api/webhook
 */
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;