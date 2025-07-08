import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import { bookSeats, saveReceipt } from '../../services/firebase';
import { loadRazorpayScript, createPaymentOrder, verifyPayment } from '../../services/razorpay';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Checkout = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Get data from location state
  const movie = location.state?.movie;
  const showtime = location.state?.showtime;
  const selectedSeats = location.state?.selectedSeats || [];
  const totalPrice = location.state?.totalPrice;

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      navigate('/login', { state: { from: `/movies/${id}/checkout` } });
      return;
    }

    // Check if we have all required data
    if (!movie || !showtime || !selectedSeats.length || !totalPrice) {
      navigate(`/movies/${id}`);
      return;
    }

    // Load Razorpay script
    const loadRazorpaySDK = async () => {
      try {
        const result = await loadRazorpayScript();
        setRazorpayLoaded(result);
        if (!result) {
          setError('Failed to load payment gateway. Please try again.');
        }
      } catch (error) {
        setError('Failed to load payment gateway. Please try again.');
      }
    };

    loadRazorpaySDK();
  }, [currentUser, id, movie, navigate, selectedSeats.length, showtime, totalPrice]);

  const steps = ['Confirm Details', 'Payment', 'Receipt'];

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order using our backend API
      const orderData = await createPaymentOrder(
        parseFloat(totalPrice),
        'INR'
      );

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Configure Razorpay options
      const options = {
        key: orderData.data.key_id || process.env.REACT_APP_RAZORPAY_KEY_ID, // Use key from server response or env variable
        amount: orderData.data.amount, // Use the amount from the order
        currency: orderData.data.currency,
        name: 'Movie Ticket Booking',
        description: `Tickets for ${movie.title}`,
        order_id: orderData.data.id, // Use the order ID from the response
        handler: async function (response) {
          // Verify payment using our backend API
          const verificationData = await verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });

          if (verificationData.success && verificationData.data.verified) {
            // Book seats in Firebase
            // In a real app, this would call Firebase
            // const bookingResult = await bookSeats(id, showtime.id, selectedSeats, currentUser.uid, true);
            // if (!bookingResult.success) {
            //   setError(bookingResult.error || 'Failed to confirm booking');
            //   setLoading(false);
            //   return;
            // }

            // Generate receipt
            const receiptData = {
              id: `TICKET-${Date.now()}`,
              userId: currentUser.uid,
              userName: currentUser.displayName || currentUser.email,
              movieId: id,
              movieTitle: movie.title,
              showtime: `${showtime.date} ${showtime.time}`,
              seats: selectedSeats,
              totalAmount: totalPrice,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              timestamp: new Date().toISOString(),
              status: 'CONFIRMED'
            };

            // Save receipt to Firebase
            // In a real app, this would call Firebase
            // const saveResult = await saveReceipt(receiptData);
            // if (!saveResult.success) {
            //   setError('Payment successful but failed to save receipt. Please contact support.');
            //   setLoading(false);
            //   return;
            // }

            setReceipt(receiptData);
            setPaymentSuccess(true);
            setActiveStep(2); // Move to receipt step
          } else {
            setError('Payment verification failed. Please contact support.');
          }
          setLoading(false);
        },
        prefill: {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          contact: ''
        },
        theme: {
          color: '#3f51b5'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setError(error.message || 'Failed to process payment');
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      setActiveStep(1);
    } else if (activeStep === 1) {
      handlePayment();
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate(`/movies/${id}/booking`, { state: { showtime } });
    } else {
      setActiveStep((prevStep) => prevStep - 1);
    }
  };

  const handleViewBookings = () => {
    navigate('/bookings');
  };

  const handleBookMore = () => {
    navigate('/');
  };

  if (!movie || !showtime || !selectedSeats.length) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Missing booking information. Please select a movie and seats.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {activeStep === 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Booking Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1">Movie:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">{movie.title}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">Showtime:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">{showtime.date} - {showtime.time}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">Selected Seats:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedSeats.map(seat => (
                  <Chip key={seat} label={seat} size="small" />
                ))}
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">Number of Tickets:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">{selectedSeats.length}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">Price per Ticket:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">${movie.price.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" fontWeight="bold">Total Amount:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" fontWeight="bold">${totalPrice}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeStep === 1 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Payment
          </Typography>
          <Typography variant="body1" paragraph>
            Please click the button below to proceed with payment using Razorpay.
          </Typography>
          <Typography variant="body2" paragraph>
            You will be redirected to a secure payment gateway to complete your transaction.
          </Typography>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6">Amount to Pay: ${totalPrice}</Typography>
          </Box>
          {!razorpayLoaded && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Loading payment gateway...
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {activeStep === 2 && paymentSuccess && receipt && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h5" color="success.main" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body1">
              Your booking has been confirmed. Here's your receipt.
            </Typography>
          </Box>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Receipt #{receipt.id}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{receipt.userName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">
                    {new Date(receipt.timestamp).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Movie</Typography>
                  <Typography variant="body1">{receipt.movieTitle}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Showtime</Typography>
                  <Typography variant="body1">{receipt.showtime}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Seats</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {receipt.seats.map(seat => (
                      <Chip key={seat} label={seat} size="small" />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip label={receipt.status} color="success" size="small" />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Payment ID</Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {receipt.paymentId}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Order ID</Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {receipt.orderId}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" fontWeight="bold">Total Amount</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" fontWeight="bold">${receipt.totalAmount}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Typography variant="body2" color="text.secondary" paragraph>
            A copy of this receipt has been sent to your email address.
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {activeStep < 2 ? (
          <>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={loading || (activeStep === 1 && !razorpayLoaded)}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Processing...
                </>
              ) : activeStep === 0 ? 'Continue to Payment' : 'Pay Now'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={handleViewBookings}
            >
              View My Bookings
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBookMore}
            >
              Book More Tickets
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Checkout;