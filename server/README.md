# Ticket Booking App - Backend Server

This is the backend server for the Ticket Booking App, providing Razorpay payment integration.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Create a `.env` file in the server directory
   - Add the following variables:
     ```
     RAZORPAY_KEY_ID=your_razorpay_key_id
     RAZORPAY_KEY_SECRET=your_razorpay_key_secret
     PORT=5000
     WEBHOOK_SECRET=your_webhook_secret
     ```

3. Start the server:
   ```
   npm start
   ```
   For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

### Create Payment Order

- **URL**: `/api/orders`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "amount": 500,
    "currency": "INR",
    "receipt": "receipt_123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "order_123456789",
      "amount": 50000,
      "currency": "INR",
      "receipt": "receipt_123"
    }
  }
  ```

### Verify Payment

- **URL**: `/api/verify-payment`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "razorpay_payment_id": "pay_123456789",
    "razorpay_order_id": "order_123456789",
    "razorpay_signature": "signature_hash"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "verified": true,
      "paymentId": "pay_123456789",
      "orderId": "order_123456789",
      "signature": "signature_hash"
    }
  }
  ```

### Webhook

- **URL**: `/api/webhook`
- **Method**: `POST`
- **Headers**:
  ```
  x-razorpay-signature: signature_hash
  ```
- **Request Body**: Razorpay event payload
- **Response**:
  ```json
  {
    "success": true
  }
  ```

## Security

- All API keys are stored in environment variables
- Payment verification is done using cryptographic signatures
- Webhook events are verified using signatures