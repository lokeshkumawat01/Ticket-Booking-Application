// Razorpay integration service

// Backend API URL - should be in .env in production
const API_URL = 'http://localhost:5000/api';

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const initiatePayment = async (options) => {
  const res = await loadRazorpayScript();
  
  if (!res) {
    alert('Razorpay SDK failed to load. Check your internet connection');
    return { success: false };
  }
  
  try {
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    
    return new Promise((resolve) => {
      // These callbacks will be triggered after payment completion or failure
      options.handler = (response) => {
        resolve({ success: true, data: response });
      };
      
      options.modal = {
        ondismiss: () => {
          resolve({ success: false, error: 'Payment cancelled by user' });
        },
      };
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createPaymentOrder = async (amount, currency = 'INR') => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: `receipt_${Date.now()}`,
      }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create order');
    }
    
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error creating payment order:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment order',
    };
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const response = await fetch(`${API_URL}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Payment verification failed');
    }
    
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify payment',
    };
  }
};