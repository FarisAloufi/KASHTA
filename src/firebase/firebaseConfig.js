import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// --- Configuration ---

// Firebase configuration using Environment Variables for security.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (location.hostname === "localhost") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}
// --- Initialization ---

// Initialize the Firebase App instance
const app = initializeApp(firebaseConfig);

// --- Service Exports ---

// Initialize and export specific Firebase services to be used across the app
export const auth = getAuth(app);       // Handles Authentication (Login/Signup)
export const db = getFirestore(app);    // Handles Firestore Database (Data storage)
export const storage = getStorage(app); // Handles Cloud Storage (Image uploads)