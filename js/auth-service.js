// js/auth-service.js
import { 
  auth,
} from './firebase-config.js';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged
} from "firebase/auth";

// Initialize providers
const googleProvider = new GoogleAuthProvider();

// Auth state observer
export const initAuthObserver = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Email/Password Sign Up
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Send verification email
    await sendEmailVerification(user);
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Email/Password Sign In
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Anonymous Sign In (Guest)
export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Phone Sign In
export const setupRecaptcha = (containerID) => {
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerID, {
    'size': 'invisible',
  });
  return window.recaptchaVerifier;
};

export const signInWithPhone = async (phoneNumber, recaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const verifyOTP = async (otp) => {
  try {
    const result = await window.confirmationResult.confirm(otp);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Password Reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign Out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get Current User
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Check if user is verified
export const isEmailVerified = () => {
  const user = getCurrentUser();
  return user ? user.emailVerified : false;
};
