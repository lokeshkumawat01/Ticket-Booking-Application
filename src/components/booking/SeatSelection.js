import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
// import { getMovieById, getBookedSeats, bookSeats } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
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
  Chip,
  CardMedia
} from '@mui/material';

// Sample movie data (in a real app, this would come from Firebase)
const sampleMovies = [
  {
    id: '1',
    title: 'Avengers: Endgame',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg',
    price: 12.99
  },
  {
    id: '2',
    title: 'Joker',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Joker_%282019_film%29_poster.jpg',
    price: 10.99
  },
  {
    id: '3',
    title: 'Parasite',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png',
    price: 11.99
  },
  {
    id: '4',
    title: 'The Dark Knight',
    imageUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    price: 12.99
  },
  {
    id: '5',
    title: 'Inception',
    imageUrl: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    price: 11.99
  },
  {
    id: '6',
    title: 'Interstellar',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
    price: 12.99
  }
];

// Sample booked seats (in a real app, this would come from Firebase)
const sampleBookedSeats = ['A1', 'A2', 'B5', 'C7', 'D4', 'E10', 'F2', 'F3', 'G8'];

const SeatSelection = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Define seat layout
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/movies/${id}/booking` } });
      return;
    }

    if (!location.state?.showtime) {
      navigate(`/movies/${id}`);
      return;
    }

    const fetchData = async () => {
      try {
        // In a real app, this would fetch from Firebase
        // const movieResult = await getMovieById(id);
        // if (!movieResult.success) {
        //   setError('Failed to fetch movie details');
        //   setLoading(false);
        //   return;
        // }
        // 
        // const seatsResult = await getBookedSeats(id, location.state.showtime.id);
        // if (!seatsResult.success) {
        //   setError('Failed to fetch booked seats');
        //   setLoading(false);
        //   return;
        // }
        // 
        // setMovie(movieResult.movie);
        // setBookedSeats(seatsResult.bookedSeats);

        // Using sample data for now
        const foundMovie = sampleMovies.find(movie => movie.id === id);
        if (foundMovie) {
          setMovie(foundMovie);
          setShowtime(location.state.showtime);
          setBookedSeats(sampleBookedSeats);
        } else {
          setError('Movie not found');
        }
        
        setLoading(false);
      } catch (error) {
        setError('An error occurred while loading the booking page');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, location.state, navigate, currentUser]);

  const handleSeatClick = (seat) => {
    if (bookedSeats.includes(seat)) {
      return; // Seat is already booked
    }

    setSelectedSeats(prevSelected =>
      prevSelected.includes(seat)
        ? prevSelected.filter(s => s !== seat)
        : [...prevSelected, seat]
    );
  };

  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    try {
      // In a real app, this would call Firebase to temporarily block the seats
      // const result = await bookSeats(id, showtime.id, selectedSeats, currentUser.uid);
      // if (!result.success) {
      //   setError(result.error || 'Failed to book seats');
      //   return;
      // }

      // For demo, we'll just proceed to checkout
      navigate(`/movies/${id}/checkout`, {
        state: {
          movie,
          showtime,
          selectedSeats,
          totalPrice: (selectedSeats.length * movie.price).toFixed(2)
        }
      });
    } catch (error) {
      setError('An error occurred while booking seats');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !movie) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Movie not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Select Seats
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">{movie.title}</Typography>
        <Typography variant="body1">
          {showtime.date} - {showtime.time}
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Paper 
            elevation={1} 
            sx={{ 
              width: '80%', 
              height: '20px', 
              mx: 'auto', 
              mb: 4, 
              backgroundColor: '#ccc',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography variant="caption">SCREEN</Typography>
          </Paper>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: '#fff', border: '1px solid #ccc', mr: 1 }} />
                <Typography variant="caption">Available</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: '#f44336', mr: 1 }} />
                <Typography variant="caption">Booked</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: '#4caf50', mr: 1 }} />
                <Typography variant="caption">Selected</Typography>
              </Box>
            </Box>
          </Box>
          
          {rows.map((row) => (
            <Box key={row} sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ width: 30, textAlign: 'center' }}>{row}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {Array.from({ length: seatsPerRow }, (_, i) => {
                  const seatNumber = i + 1;
                  const seat = `${row}${seatNumber}`;
                  const isBooked = bookedSeats.includes(seat);
                  const isSelected = selectedSeats.includes(seat);
                  
                  return (
                    <Box
                      key={seat}
                      onClick={() => handleSeatClick(seat)}
                      sx={{
                        width: 30,
                        height: 30,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: isBooked ? 'not-allowed' : 'pointer',
                        backgroundColor: isBooked ? '#f44336' : isSelected ? '#4caf50' : '#fff',
                        color: isBooked || isSelected ? '#fff' : '#000',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        '&:hover': {
                          backgroundColor: isBooked ? '#f44336' : isSelected ? '#4caf50' : '#e0e0e0'
                        }
                      }}
                    >
                      {seatNumber}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Booking Summary
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
              {selectedSeats.length > 0 ? (
                selectedSeats.map(seat => (
                  <Chip key={seat} label={seat} size="small" />
                ))
              ) : (
                <Typography variant="body1">None selected</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Price per Ticket:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">${movie.price.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight="bold">Total:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight="bold">
              ${(selectedSeats.length * movie.price).toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/movies/${id}`)}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleProceedToCheckout}
          disabled={selectedSeats.length === 0}
        >
          Proceed to Checkout
        </Button>
      </Box>

      <CardMedia
        component="img"
        image={movie.imageUrl}
        alt={movie.title}
        sx={{
          maxWidth: 180,
          height: 270,
          objectFit: 'cover',
          mx: 'auto',
          mt: 2,
          borderRadius: 2
        }}
        onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/180x270?text=No+Image'; }}
      />
    </Container>
  );
};

export default SeatSelection;