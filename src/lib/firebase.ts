
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

// Your web app's Firebase configuration - Using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};


// Initialize Firebase
// Check if all required Firebase config keys are present
const requiredKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

let app;

if (missingKeys.length > 0) {
  console.warn(`Firebase initialization skipped. Missing environment variables: ${missingKeys.join(', ')}. Please ensure all NEXT_PUBLIC_FIREBASE_ variables are set in your .env file.`);
  // Optionally, you could throw an error or set app to a dummy object if Firebase is critical
  // For now, we'll let it proceed, but Firebase services might not work.
} else {
   app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
}


const auth = app ? getAuth(app) : getAuth(); // Fallback to getAuth() to avoid error if app is undefined, though it might not work correctly
const db = app ? getFirestore(app) : getFirestore();
const storage = app ? getStorage(app) : getStorage(); 
// const analytics = getAnalytics(app); // Optional

// Initialize Auth Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com'); 

export { app, auth, db, storage, googleProvider, githubProvider, microsoftProvider };
