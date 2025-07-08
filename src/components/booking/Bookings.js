import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import { getUserReceipts } from '../../services/firebase';
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
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

// Sample receipts data (in a real app, this would come from Firebase)
const sampleReceipts = [
  {
    id: 'TICKET-1234567890',
    userId: 'user123',
    userName: 'John Doe',
    movieId: '1',
    movieTitle: 'Avengers: Endgame',
    showtime: '2023-06-15 18:30',
    seats: ['A1', 'A2'],
    totalAmount: '25.98',
    paymentId: 'pay_123456789',
    orderId: 'order_123456789',
    timestamp: '2023-06-10T12:30:45.123Z',
    status: 'CONFIRMED'
  },
  {
    id: 'TICKET-0987654321',
    userId: 'user123',
    userName: 'John Doe',
    movieId: '2',
    movieTitle: 'Joker',
    showtime: '2023-06-20 20:00',
    seats: ['C4', 'C5', 'C6'],
    totalAmount: '32.97',
    paymentId: 'pay_987654321',
    orderId: 'order_987654321',
    timestamp: '2023-06-12T15:45:30.456Z',
    status: 'CONFIRMED'
  },
  {
    id: 'TICKET-5678901234',
    userId: 'user123',
    userName: 'John Doe',
    movieId: '3',
    movieTitle: 'Parasite',
    showtime: '2023-06-25 19:15',
    seats: ['F7', 'F8'],
    totalAmount: '23.98',
    paymentId: 'pay_567890123',
    orderId: 'order_567890123',
    timestamp: '2023-06-14T09:20:15.789Z',
    status: 'CONFIRMED'
  }
];

const Bookings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/bookings' } });
      return;
    }

    const fetchReceipts = async () => {
      try {
        // In a real app, this would fetch from Firebase
        // const result = await getUserReceipts(currentUser.uid);
        // if (!result.success) {
        //   setError('Failed to fetch booking history');
        //   setLoading(false);
        //   return;
        // }
        // 
        // setReceipts(result.receipts);

        // Using sample data for now
        setReceipts(sampleReceipts);
        setLoading(false);
      } catch (error) {
        setError('An error occurred while loading your booking history');
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [currentUser, navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Bookings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {receipts.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No bookings found
          </Typography>
          <Typography variant="body1" paragraph>
            You haven't made any bookings yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
          >
            Browse Movies
          </Button>
        </Paper>
      ) : (
        <>
          <Typography variant="body1" paragraph>
            Your booking history is displayed below. Click on a booking to view details.
          </Typography>

          {receipts.map((receipt) => (
            <Accordion key={receipt.id} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${receipt.id}-content`}
                id={`panel-${receipt.id}-header`}
              >
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <ConfirmationNumberIcon color="primary" />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="subtitle1">{receipt.movieTitle}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {receipt.showtime} | {receipt.seats.length} {receipt.seats.length === 1 ? 'ticket' : 'tickets'}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      label={receipt.status}
                      color="success"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" component="span">
                      {formatDate(receipt.timestamp)}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Card variant="outlined">
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
                          {formatDate(receipt.timestamp)}
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
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}
    </Container>
  );
};

export default Bookings;