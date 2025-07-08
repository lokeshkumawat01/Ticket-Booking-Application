import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, arrayUnion, /* arrayRemove, query, where, */ getDocs } from 'firebase/firestore';
// We'll dynamically import getAnalytics to avoid SSR issues

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// The apiKey is now loaded from an environment variable for security. See .env setup in README.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "ticket-booking-app-eb1cc.firebaseapp.com",
  projectId: "ticket-booking-app-eb1cc",
  storageBucket: "ticket-booking-app-eb1cc.firebasestorage.app",
  messagingSenderId: "233071071335",
  appId: "1:233071071335:web:3ad082a7e1f760f84d04c2",
  measurementId: "G-N6B46GWJ9B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics
let analytics = null;
if (typeof window !== 'undefined') {
  // Only initialize analytics on the client side
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  }).catch(error => {
    console.error('Analytics failed to load:', error);
  });
}

// Authentication functions
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Firestore functions
export const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getMovies = async () => {
  try {
    const moviesRef = collection(db, 'movies');
    const querySnapshot = await getDocs(moviesRef);
    const movies = [];
    querySnapshot.forEach((doc) => {
      movies.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, movies };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getMovieById = async (movieId) => {
  try {
    const movieDoc = await getDoc(doc(db, 'movies', movieId));
    if (movieDoc.exists()) {
      return { success: true, movie: { id: movieDoc.id, ...movieDoc.data() } };
    } else {
      return { success: false, error: 'Movie not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const bookSeats = async (movieId, showtime, seats, userId) => {
  try {
    const bookingRef = doc(db, 'bookings', `${movieId}_${showtime}`);
    const bookingDoc = await getDoc(bookingRef);
    
    if (bookingDoc.exists()) {
      const bookingData = bookingDoc.data();
      const bookedSeats = bookingData.bookedSeats || [];
      
      // Check if any of the selected seats are already booked
      const alreadyBooked = seats.some(seat => bookedSeats.includes(seat));
      if (alreadyBooked) {
        return { success: false, error: 'Some seats are already booked' };
      }
      
      // Update the booking document with the new seats
      await updateDoc(bookingRef, {
        bookedSeats: arrayUnion(...seats),
        [`reservations.${userId}`]: arrayUnion(...seats)
      });
    } else {
      // Create a new booking document
      await setDoc(bookingRef, {
        movieId,
        showtime,
        bookedSeats: seats,
        reservations: { [userId]: seats }
      });
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getBookedSeats = async (movieId, showtime) => {
  try {
    const bookingRef = doc(db, 'bookings', `${movieId}_${showtime}`);
    const bookingDoc = await getDoc(bookingRef);
    
    if (bookingDoc.exists()) {
      const bookingData = bookingDoc.data();
      return { success: true, bookedSeats: bookingData.bookedSeats || [] };
    } else {
      return { success: true, bookedSeats: [] };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const saveReceipt = async (userId, receiptData) => {
  try {
    const receiptsRef = collection(db, 'users', userId, 'receipts');
    await setDoc(doc(receiptsRef), {
      ...receiptData,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserReceipts = async (userId) => {
  try {
    const receiptsRef = collection(db, 'users', userId, 'receipts');
    const querySnapshot = await getDocs(receiptsRef);
    const receipts = [];
    querySnapshot.forEach((doc) => {
      receipts.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, receipts };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export { auth, db, analytics };