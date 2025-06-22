// js/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfMNyQwkSWeGw28ojygiVQwwfXnwXoOYk",
  authDomain: "supermarket-b930f.firebaseapp.com",
  projectId: "supermarket-b930f",
  storageBucket: "supermarket-b930f.firebasestorage.app",
  messagingSenderId: "916317111235",
  appId: "1:916317111235:web:e82d5c11f39eadb3947376",
  measurementId: "G-2H6SZ8MB3Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { app, auth, analytics };
