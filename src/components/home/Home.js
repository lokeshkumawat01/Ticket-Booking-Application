import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Rating,
  // Divider,
  Paper
} from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import SecurityIcon from '@mui/icons-material/Security';
import DevicesIcon from '@mui/icons-material/Devices';
import { useAuth } from '../../context/AuthContext';

// Sample featured movies (in a real app, this would come from Firebase)
const featuredMovies = [
  {
    id: '1',
    title: 'Avengers: Endgame',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg',
    rating: 4.8,
    genre: 'Action, Adventure, Sci-Fi',
    duration: '3h 1m'
  },
  {
    id: '2',
    title: 'Joker',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Joker_%282019_film%29_poster.jpg',
    rating: 4.5,
    genre: 'Crime, Drama, Thriller',
    duration: '2h 2m'
  },
  {
    id: '3',
    title: 'Parasite',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png',
    rating: 4.6,
    genre: 'Comedy, Drama, Thriller',
    duration: '2h 12m'
  },
  {
    id: '4',
    title: 'The Dark Knight',
    imageUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    rating: 4.9,
    genre: 'Action, Crime, Drama',
    duration: '2h 32m'
  },
  {
    id: '5',
    title: 'Inception',
    imageUrl: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    rating: 4.7,
    genre: 'Action, Adventure, Sci-Fi',
    duration: '2h 28m'
  }
];

const Home = () => {
  const { currentUser } = useAuth();
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Book Movie Tickets Online
              </Typography>
              <Typography variant="h5" paragraph>
                Experience the magic of cinema with our easy booking system
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={Link}
                to="/movies"
                sx={{ mt: 2 }}
              >
                Browse Movies
              </Button>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {/* Decorative movie tickets */}
                {[15, -5, -25].map((rotation, index) => (
                  <Paper
                    key={index}
                    elevation={6}
                    sx={{
                      width: 240,
                      height: 120,
                      position: 'absolute',
                      transform: `rotate(${rotation}deg)`,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ADMIT ONE
                      </Typography>
                      <LocalActivityIcon color="primary" />
                    </Box>
                    <Typography variant="body2" color="text.primary">
                      {['Avengers: Endgame', 'Joker', 'Parasite'][index]}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        SEAT: {['A12', 'B7', 'C4'][index]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {['18:30', '20:00', '19:15'][index]}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Movies Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Featured Movies
        </Typography>
        <Grid container spacing={4}>
          {featuredMovies.map((movie) => (
            <Grid item key={movie.id} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)'
                  }
                }}
              >
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
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h3">
                    {movie.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating
                      name={`rating-${movie.id}`}
                      value={movie.rating}
                      precision={0.1}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {movie.rating}/5
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {movie.genre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {movie.duration}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    component={Link}
                    to={`/movies/${movie.id}`}
                    fullWidth
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/movies"
            size="large"
          >
            View All Movies
          </Button>
        </Box>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6, mb: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Why Choose Us
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <MovieIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Latest Movies
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access to the latest blockbusters and indie films as soon as they hit theaters.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <LocalActivityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Easy Booking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Simple and intuitive seat selection and booking process for a hassle-free experience.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Secure Payments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Safe and secure payment processing with Razorpay for peace of mind.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <DevicesIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Responsive Design
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Book tickets on any device - desktop, tablet, or mobile - with our responsive interface.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action (only show if not logged in) */}
      {!currentUser && (
        <Container maxWidth="md" sx={{ mb: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              borderRadius: 2
            }}
          >
            <Typography variant="h5" component="h3" gutterBottom>
              Ready to Experience the Magic of Cinema?
            </Typography>
            <Typography variant="body1" paragraph>
              Sign up now to start booking tickets and enjoy exclusive offers!
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={Link}
                to="/register"
                sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
              >
                Sign Up
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                component={Link}
                to="/login"
              >
                Login
              </Button>
            </Box>
          </Paper>
        </Container>
      )}
    </Box>
  );
};

export default Home;