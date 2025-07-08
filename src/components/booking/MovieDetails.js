import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { getMovieById } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Rating,
  Divider,
  CircularProgress,
  Alert,
  // Paper
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';

// Sample movie data (in a real app, this would come from Firebase)
const sampleMovies = [
  {
    id: '1',
    title: 'Avengers: Endgame',
    description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg',
    rating: 4.8,
    duration: '3h 1m',
    genre: 'Action, Adventure, Drama',
    releaseDate: '2019-04-26',
    director: 'Anthony Russo, Joe Russo',
    cast: 'Robert Downey Jr., Chris Evans, Mark Ruffalo, Chris Hemsworth, Scarlett Johansson',
    showtimes: [
      { id: 's1', time: '10:00 AM', date: '2023-06-15' },
      { id: 's2', time: '1:30 PM', date: '2023-06-15' },
      { id: 's3', time: '5:00 PM', date: '2023-06-15' },
      { id: 's4', time: '8:30 PM', date: '2023-06-15' },
      { id: 's5', time: '11:00 AM', date: '2023-06-16' },
      { id: 's6', time: '2:30 PM', date: '2023-06-16' },
    ]
  },
  {
    id: '2',
    title: 'Joker',
    description: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime. This path brings him face-to-face with his alter-ego: the Joker.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Joker_%282019_film%29_poster.jpg',
    rating: 4.5,
    duration: '2h 2m',
    genre: 'Crime, Drama, Thriller',
    releaseDate: '2019-10-04',
    director: 'Todd Phillips',
    cast: 'Joaquin Phoenix, Robert De Niro, Zazie Beetz',
    showtimes: [
      { id: 's1', time: '11:00 AM', date: '2023-06-15' },
      { id: 's2', time: '2:30 PM', date: '2023-06-15' },
      { id: 's3', time: '6:00 PM', date: '2023-06-15' },
      { id: 's4', time: '9:30 PM', date: '2023-06-15' },
    ]
  },
  {
    id: '3',
    title: 'Parasite',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png',
    rating: 4.6,
    duration: '2h 12m',
    genre: 'Comedy, Drama, Thriller',
    releaseDate: '2019-11-08',
    director: 'Bong Joon Ho',
    cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong',
    showtimes: [
      { id: 's1', time: '10:30 AM', date: '2023-06-15' },
      { id: 's2', time: '1:00 PM', date: '2023-06-15' },
      { id: 's3', time: '3:30 PM', date: '2023-06-15' },
      { id: 's4', time: '6:00 PM', date: '2023-06-15' },
      { id: 's5', time: '8:30 PM', date: '2023-06-15' },
    ]
  },
  {
    id: '4',
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    imageUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    rating: 4.9,
    duration: '2h 32m',
    genre: 'Action, Crime, Drama',
    releaseDate: '2008-07-18',
    director: 'Christopher Nolan',
    cast: 'Christian Bale, Heath Ledger, Aaron Eckhart',
    showtimes: [
      { id: 's1', time: '11:30 AM', date: '2023-06-15' },
      { id: 's2', time: '2:00 PM', date: '2023-06-15' },
      { id: 's3', time: '4:30 PM', date: '2023-06-15' },
      { id: 's4', time: '7:00 PM', date: '2023-06-15' },
      { id: 's5', time: '9:30 PM', date: '2023-06-15' },
    ]
  },
  {
    id: '5',
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    imageUrl: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    rating: 4.7,
    duration: '2h 28m',
    genre: 'Action, Adventure, Sci-Fi',
    releaseDate: '2010-07-16',
    director: 'Christopher Nolan',
    cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page',
    showtimes: [
      { id: 's1', time: '10:00 AM', date: '2023-06-15' },
      { id: 's2', time: '12:30 PM', date: '2023-06-15' },
      { id: 's3', time: '3:00 PM', date: '2023-06-15' },
      { id: 's4', time: '5:30 PM', date: '2023-06-15' },
      { id: 's5', time: '8:00 PM', date: '2023-06-15' },
      { id: 's6', time: '10:30 PM', date: '2023-06-15' },
    ]
  },
  {
    id: '6',
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
    rating: 4.7,
    duration: '2h 49m',
    genre: 'Adventure, Drama, Sci-Fi',
    releaseDate: '2014-11-07',
    director: 'Christopher Nolan',
    cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
    showtimes: [
      { id: 's1', time: '11:00 AM', date: '2023-06-15' },
      { id: 's2', time: '2:00 PM', date: '2023-06-15' },
      { id: 's3', time: '5:00 PM', date: '2023-06-15' },
      { id: 's4', time: '8:00 PM', date: '2023-06-15' },
    ]
  }
];

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // In a real app, this would fetch from Firebase
        // const result = await getMovieById(id);
        // if (result.success) {
        //   setMovie(result.movie);
        // } else {
        //   setError('Failed to fetch movie details');
        // }
        
        // Using sample data for now
        const foundMovie = sampleMovies.find(movie => movie.id === id);
        if (foundMovie) {
          setMovie(foundMovie);
        } else {
          setError('Movie not found');
        }
        setLoading(false);
      } catch (error) {
        setError('An error occurred while fetching movie details');
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const handleShowtimeSelect = (showtime) => {
    setSelectedShowtime(showtime);
  };

  const handleBookSeats = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/movies/${id}` } });
      return;
    }
    
    if (!selectedShowtime) {
      alert('Please select a showtime');
      return;
    }
    
    navigate(`/movies/${id}/booking`, { state: { showtime: selectedShowtime } });
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              image={movie.imageUrl}
              alt={movie.title}
              sx={{
                maxWidth: 250,
                height: 375,
                objectFit: 'cover',
                mx: 'auto',
                mt: 2,
                borderRadius: 2
              }}
              onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/250x375?text=No+Image'; }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            {movie.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={movie.rating} precision={0.1} readOnly />
            <Typography variant="body1" sx={{ ml: 1 }}>
              {movie.rating}/5
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip icon={<AccessTimeIcon />} label={movie.duration} />
            <Chip icon={<DateRangeIcon />} label={movie.releaseDate} />
            {movie.genre.split(', ').map((genre, index) => (
              <Chip key={index} icon={<LocalMoviesIcon />} label={genre} />
            ))}
          </Box>
          
          <Typography variant="body1" paragraph>
            {movie.description}
          </Typography>
          
          <Typography variant="subtitle1" fontWeight="bold">
            Director:
          </Typography>
          <Typography variant="body1" paragraph>
            {movie.director}
          </Typography>
          
          <Typography variant="subtitle1" fontWeight="bold">
            Cast:
          </Typography>
          <Typography variant="body1" paragraph>
            {movie.cast}
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h5" gutterBottom>
            Showtimes
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            {movie.showtimes.map((showtime) => (
              <Button
                key={showtime.id}
                variant={selectedShowtime?.id === showtime.id ? 'contained' : 'outlined'}
                sx={{ m: 1 }}
                onClick={() => handleShowtimeSelect(showtime)}
              >
                {showtime.date} - {showtime.time}
              </Button>
            ))}
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleBookSeats}
            disabled={!selectedShowtime}
          >
            Book Seats
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MovieDetails;