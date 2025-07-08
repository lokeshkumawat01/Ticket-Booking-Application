import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { getAuth, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';
import { auth } from '../../services/firebase';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setVerificationError('');
    setShowResend(false);
    setLoading(true);

    let email = identifier;
    if (identifier === 'admin') {
      email = 'admin@example.com';
    }

    try {
      const result = await loginUser(email, password);
      if (result.success) {
        const user = result.user;
        if (!user.emailVerified) {
          setVerificationError('Your email is not verified. Please check your inbox.');
          setShowResend(true);
          setLoading(false);
          return;
        }
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setVerificationError('');
    try {
      const auth = getAuth();
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await sendEmailVerification(auth.currentUser);
        setVerificationError('Verification email resent. Please check your inbox.');
        setShowResend(false);
      } else {
        setError('Unable to resend verification email. Please try logging in again.');
      }
    } catch (err) {
      setError('Failed to resend verification email.');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Login
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {verificationError && (
            <Alert severity="warning" sx={{ mb: 2 }}>{verificationError}</Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="identifier"
              label="Email or Username"
              name="identifier"
              autoComplete="email"
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
            {showResend && (
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleResendVerification}
                sx={{ mb: 2 }}
                disabled={loading}
              >
                Resend Verification Email
              </Button>
            )}
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Don't have an account? Register
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;