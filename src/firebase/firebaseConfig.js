import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// --- Configuration ---

// Firebase configuration object containing keys and identifiers for your app.
const firebaseConfig = {
  apiKey: "AIzaSyA-YkBrWIapCXCbRh6HJtQG5jhdPM74bE4",
  authDomain: "kashta-9b2bc.firebaseapp.com",
  projectId: "kashta-9b2bc",
  storageBucket: "kashta-9b2bc.firebasestorage.app",
  messagingSenderId: "184279619423",
  appId: "1:184279619423:web:787e26be56bd8ab3a608ea",
  measurementId: "G-XD0SFM6C6M",
};

// --- Initialization ---

// Initialize the Firebase App instance
const app = initializeApp(firebaseConfig);

// --- Service Exports ---

// Initialize and export specific Firebase services to be used across the app
export const auth = getAuth(app);       // Handles Authentication (Login/Signup)
export const db = getFirestore(app);    // Handles Firestore Database (Data storage)
export const storage = getStorage(app); // Handles Cloud Storage (Image uploads)