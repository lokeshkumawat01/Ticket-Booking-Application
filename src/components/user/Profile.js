import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAuth, updateProfile } from 'firebase/auth';
// import { updateUserProfile, getUserProfile } from '../../services/firebase';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    const fetchProfile = async () => {
      try {
        // In a real app, this would fetch from Firebase
        // const result = await getUserProfile(currentUser.uid);
        // if (!result.success) {
        //   setError('Failed to fetch profile information');
        //   setLoading(false);
        //   return;
        // }
        // 
        // setProfile({
        //   displayName: result.profile.displayName || '',
        //   email: result.profile.email || '',
        //   phoneNumber: result.profile.phoneNumber || '',
        //   address: result.profile.address || ''
        // });

        // Using sample data for now
        setProfile({
          displayName: currentUser.displayName || 'John Doe',
          email: currentUser.email || 'john.doe@example.com',
          phoneNumber: '+1 (555) 123-4567',
          address: '123 Main St, Anytown, USA'
        });
        
        setLoading(false);
      } catch (error) {
        setError('An error occurred while loading your profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    try {
      // In a real app, this would update Firebase
      // const result = await updateUserProfile(currentUser.uid, {
      //   displayName: profile.displayName,
      //   phoneNumber: profile.phoneNumber,
      //   address: profile.address
      // });
      // 
      // if (!result.success) {
      //   throw new Error(result.error || 'Failed to update profile');
      // }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update displayName in Firebase Auth
      const auth = getAuth();
      await updateProfile(auth.currentUser, { displayName: profile.displayName });
      setSuccess(true);
      setIsEditing(false);
    } catch (error) {
      setError(error.message || 'An error occurred while updating your profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
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
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}
          >
            {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : <AccountCircleIcon fontSize="large" />}
          </Avatar>
          <Box>
            <Typography variant="h5">{profile.displayName}</Typography>
            <Typography variant="body1" color="text.secondary">{profile.email}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="displayName"
                value={profile.displayName}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profile.email}
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={!isEditing}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                {isEditing ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => setIsEditing(false)}
                      sx={{ mr: 2 }}
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={updating}
                    >
                      {updating ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account Security
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate('/change-password')}
          sx={{ mr: 2 }}
        >
          Change Password
        </Button>
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;