import React, { useState, useEffect } from 'react';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Divider,
  Chip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ADMIN_EMAIL = 'vikashkushwahaa28@gmail.com';

const defaultForm = {
  title: '',
  description: '',
  imageUrl: '',
  showtimes: '',
  rating: '',
  duration: '',
  genre: '',
  releaseDate: '',
  director: '',
  cast: '',
};

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);
  const [user, setUser] = useState(null);
  const [genreFilter, setGenreFilter] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const MOVIES_PER_PAGE = 5;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMovie, setModalMovie] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmEdit, setConfirmEdit] = useState({ open: false, id: null });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const querySnapshot = await getDocs(collection(db, 'movies'));
    setMovies(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'movies'), {
        ...form,
        showtimes: form.showtimes.split(',').map(s => s.trim()),
        rating: parseFloat(form.rating),
      });
      setForm(defaultForm);
      await fetchMovies();
    } catch (error) {
      alert('Error adding movie: ' + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setConfirmDelete({ open: true, id });
  };

  const confirmDeleteAction = async () => {
    if (confirmDelete.id) {
      await deleteDoc(doc(db, 'movies', confirmDelete.id));
      await fetchMovies();
    }
    setConfirmDelete({ open: false, id: null });
  };

  const startEdit = (movie) => {
    setEditingId(movie.id);
    setEditForm({
      title: movie.title || '',
      description: movie.description || '',
      imageUrl: movie.imageUrl || '',
      showtimes: Array.isArray(movie.showtimes) ? movie.showtimes.join(', ') : movie.showtimes || '',
      rating: movie.rating || '',
      duration: movie.duration || '',
      genre: movie.genre || '',
      releaseDate: movie.releaseDate || '',
      director: movie.director || '',
      cast: movie.cast || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(defaultForm);
  };

  const handleEditSubmit = async (id) => {
    setConfirmEdit({ open: true, id });
  };

  const confirmEditAction = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'movies', confirmEdit.id), {
        ...editForm,
        showtimes: editForm.showtimes.split(',').map(s => s.trim()),
        rating: parseFloat(editForm.rating),
      });
      setEditingId(null);
      setEditForm(defaultForm);
      await fetchMovies();
    } catch (error) {
      alert('Error updating movie: ' + error.message);
    }
    setLoading(false);
    setConfirmEdit({ open: false, id: null });
  };

  // Get all unique genres from movies
  const allGenres = Array.from(
    new Set(
      movies
        .flatMap(m => (m.genre ? m.genre.split(',').map(g => g.trim()) : []))
        .filter(Boolean)
    )
  );

  // Filtered movies based on genre only
  const filteredMovies = movies.filter(movie => {
    const matchesGenre = genreFilter ? (movie.genre && movie.genre.split(',').map(g => g.trim()).includes(genreFilter)) : true;
    return matchesGenre;
  });

  // Sort filtered movies
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    let aValue = a[sortField] || '';
    let bValue = b[sortField] || '';
    if (sortField === 'rating') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    } else if (sortField === 'releaseDate') {
      aValue = aValue || '';
      bValue = bValue || '';
    } else {
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
    }
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const pageCount = Math.ceil(sortedMovies.length / MOVIES_PER_PAGE);
  const paginatedMovies = sortedMovies.slice((page - 1) * MOVIES_PER_PAGE, page * MOVIES_PER_PAGE);

  // Reset page to 1 when filters/sort change
  useEffect(() => { setPage(1); }, [genreFilter, sortField, sortOrder]);

  if (!user) {
    return <Box sx={{ p: 4 }}>Please log in as admin to access this page.</Box>;
  }
  if (user.email !== ADMIN_EMAIL) {
    return <Box sx={{ p: 4 }}>Access denied. Admins only.</Box>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      {/* Search and Filter Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Filter by Genre"
          value={genreFilter}
          onChange={e => setGenreFilter(e.target.value)}
          size="small"
          select
          SelectProps={{ native: true }}
          sx={{ minWidth: 180 }}
        >
          <option value="">All Genres</option>
          {allGenres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </TextField>
        <TextField
          label="Sort By"
          value={sortField}
          onChange={e => setSortField(e.target.value)}
          size="small"
          select
          SelectProps={{ native: true }}
          sx={{ minWidth: 140 }}
        >
          <option value="title">Title</option>
          <option value="releaseDate">Release Date</option>
          <option value="rating">Rating</option>
        </TextField>
        <TextField
          label="Order"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          size="small"
          select
          SelectProps={{ native: true }}
          sx={{ minWidth: 120 }}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </TextField>
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: 3, borderRadius: 2, boxShadow: 2, bgcolor: '#fafafa' }}>
        <Typography variant="h6" gutterBottom>Add New Movie</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Image URL" name="imageUrl" value={form.imageUrl} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth required multiline rows={2} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Showtimes (comma separated)" name="showtimes" value={form.showtimes} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Rating (0-5)" name="rating" value={form.rating} onChange={handleChange} fullWidth required type="number" inputProps={{ min: 0, max: 5, step: 0.1 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Duration (e.g. 2h 30m)" name="duration" value={form.duration} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Genre (comma separated)" name="genre" value={form.genre} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Release Date" name="releaseDate" value={form.releaseDate} onChange={handleChange} fullWidth required type="date" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Director" name="director" value={form.director} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Cast (comma separated)" name="cast" value={form.cast} onChange={handleChange} fullWidth required />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }} disabled={loading}>
          {loading ? 'Adding...' : 'Add Movie'}
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="h5" gutterBottom>Existing Movies</Typography>
      <Grid container spacing={3}>
        {paginatedMovies.map(movie => (
          <Grid item xs={12} key={movie.id}>
            <Card sx={{ display: 'flex', mb: 2, boxShadow: 1 }}>
              <CardMedia
                component="img"
                image={movie.imageUrl}
                alt={movie.title}
                sx={{ width: 120, height: 180, objectFit: 'cover', borderRadius: 2, m: 2 }}
                onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/120x180?text=No+Image'; }}
              />
              <CardContent sx={{ flex: 1 }}>
                {editingId === movie.id ? (
                  <Box>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Title" name="title" value={editForm.title} onChange={handleEditChange} fullWidth required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Image URL" name="imageUrl" value={editForm.imageUrl} onChange={handleEditChange} fullWidth required />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField label="Description" name="description" value={editForm.description} onChange={handleEditChange} fullWidth required multiline rows={2} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Showtimes (comma separated)" name="showtimes" value={editForm.showtimes} onChange={handleEditChange} fullWidth required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Rating (0-5)" name="rating" value={editForm.rating} onChange={handleEditChange} fullWidth required type="number" inputProps={{ min: 0, max: 5, step: 0.1 }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Duration (e.g. 2h 30m)" name="duration" value={editForm.duration} onChange={handleEditChange} fullWidth required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Genre (comma separated)" name="genre" value={editForm.genre} onChange={handleEditChange} fullWidth required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Release Date" name="releaseDate" value={editForm.releaseDate} onChange={handleEditChange} fullWidth required type="date" InputLabelProps={{ shrink: true }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Director" name="director" value={editForm.director} onChange={handleEditChange} fullWidth required />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField label="Cast (comma separated)" name="cast" value={editForm.cast} onChange={handleEditChange} fullWidth required />
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                      <Button onClick={() => handleEditSubmit(movie.id)} variant="contained" color="primary" sx={{ mr: 1 }} disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button onClick={cancelEdit} variant="outlined">Cancel</Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6">{movie.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{movie.description}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      <Chip label={`Rating: ${movie.rating || 'N/A'}`} size="small" />
                      <Chip label={movie.duration} size="small" />
                      {movie.genre && movie.genre.split(',').map((g, i) => (
                        <Chip key={i} label={g.trim()} size="small" />
                      ))}
                    </Box>
                    <Typography variant="body2"><b>Release Date:</b> {movie.releaseDate || 'N/A'}</Typography>
                    <Typography variant="body2"><b>Director:</b> {movie.director || 'N/A'}</Typography>
                    <Typography variant="body2"><b>Cast:</b> {movie.cast || 'N/A'}</Typography>
                    <Typography variant="body2"><b>Showtimes:</b> {Array.isArray(movie.showtimes) ? movie.showtimes.join(', ') : movie.showtimes}</Typography>
                    <CardActions sx={{ mt: 1 }}>
                      <Button onClick={() => startEdit(movie)} variant="outlined" color="primary" sx={{ mr: 1 }}>Edit</Button>
                      <Button onClick={() => handleDelete(movie.id)} variant="outlined" color="error">Delete</Button>
                      <Button onClick={() => { setModalMovie(movie); setModalOpen(true); }} variant="contained" color="info">View Details</Button>
                    </CardActions>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
      {/* Movie Details Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Movie Details
          <IconButton onClick={() => setModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {modalMovie && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <img
                  src={modalMovie.imageUrl}
                  alt={modalMovie.title}
                  style={{ maxWidth: 240, maxHeight: 360, borderRadius: 8 }}
                  onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/240x360?text=No+Image'; }}
                />
              </Box>
              <Typography variant="h5" gutterBottom>{modalMovie.title}</Typography>
              <Typography variant="subtitle1" gutterBottom>{modalMovie.description}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label={`Rating: ${modalMovie.rating || 'N/A'}`} size="small" />
                <Chip label={modalMovie.duration} size="small" />
                {modalMovie.genre && modalMovie.genre.split(',').map((g, i) => (
                  <Chip key={i} label={g.trim()} size="small" />
                ))}
              </Box>
              <Typography variant="body2"><b>Release Date:</b> {modalMovie.releaseDate || 'N/A'}</Typography>
              <Typography variant="body2"><b>Director:</b> {modalMovie.director || 'N/A'}</Typography>
              <Typography variant="body2"><b>Cast:</b> {modalMovie.cast || 'N/A'}</Typography>
              <Typography variant="body2"><b>Showtimes:</b> {Array.isArray(modalMovie.showtimes) ? modalMovie.showtimes.join(', ') : modalMovie.showtimes}</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this movie?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, id: null })}>Cancel</Button>
          <Button onClick={confirmDeleteAction} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      {/* Edit Confirmation Dialog */}
      <Dialog open={confirmEdit.open} onClose={() => setConfirmEdit({ open: false, id: null })}>
        <DialogTitle>Confirm Save</DialogTitle>
        <DialogContent>Are you sure you want to save changes to this movie?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmEdit({ open: false, id: null })}>Cancel</Button>
          <Button onClick={confirmEditAction} color="primary" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 