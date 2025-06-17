// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  OAuthProvider // For Microsoft
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics"; // Optional, can be added if needed

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCU-rv6dFJny3BJGDkcllkHXTAy15qw1bM",
  authDomain: "job-boardly-a3c9f.firebaseapp.com",
  projectId: "job-boardly-a3c9f",
  storageBucket: "job-boardly-a3c9f.appspot.com", // Corrected, should be .appspot.com
  messagingSenderId: "23731268255",
  appId: "1:23731268255:web:9effd3a2e34ab806aa50aa",
  measurementId: "G-MM3W03PMVT" // Optional
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize storage, though not used in this iteration
// const analytics = getAnalytics(app); // Optional

// Initialize Auth Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com'); // For Microsoft Account

export { app, auth, db, storage, googleProvider, githubProvider, microsoftProvider };
