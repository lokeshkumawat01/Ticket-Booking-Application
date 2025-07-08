import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// import { getMovies } from '../../services/firebase';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Rating,
  Chip,
  CardActions
} from '@mui/material';

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
    releaseDate: '2019-04-26'
  },
  {
    id: '2',
    title: 'Joker',
    description: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime. This path brings him face-to-face with his alter-ego: the Joker.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Joker_%282019_film%29_poster.jpg',
    rating: 4.5,
    duration: '2h 2m',
    genre: 'Crime, Drama, Thriller',
    releaseDate: '2019-10-04'
  },
  {
    id: '3',
    title: 'Parasite',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png',
    rating: 4.6,
    duration: '2h 12m',
    genre: 'Comedy, Drama, Thriller',
    releaseDate: '2019-11-08'
  },
  {
    id: '4',
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    imageUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    rating: 4.9,
    duration: '2h 32m',
    genre: 'Action, Crime, Drama',
    releaseDate: '2008-07-18'
  },
  {
    id: '5',
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    imageUrl: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    rating: 4.7,
    duration: '2h 28m',
    genre: 'Action, Adventure, Sci-Fi',
    releaseDate: '2010-07-16'
  },
  {
    id: '6',
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
    rating: 4.7,
    duration: '2h 49m',
    genre: 'Adventure, Drama, Sci-Fi',
    releaseDate: '2014-11-07'
  }
];

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // In a real app, this would fetch from Firebase
        // const result = await getMovies();
        // if (result.success) {
        //   setMovies(result.movies);
        // } else {
        //   setError('Failed to fetch movies');
        // }
        
        // Using sample data for now
        setMovies(sampleMovies);
        setLoading(false);
      } catch (error) {
        setError('An error occurred while fetching movies');
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Now Showing
      </Typography>
      <Grid container spacing={4}>
        {movies.map((movie) => (
          <Grid item key={movie.id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {movie.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={movie.rating} precision={0.1} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {movie.rating}/5
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Chip label={movie.duration} size="small" sx={{ mr: 0.5 }} />
                  {movie.genre.split(', ').map((genre, index) => (
                    <Chip key={index} label={genre} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {movie.description.length > 100
                    ? `${movie.description.substring(0, 100)}...`
                    : movie.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={RouterLink}
                  to={`/movies/${movie.id}`}
                  fullWidth
                  variant="contained"
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MovieList;