// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKnWIHEwjFoEmOUeantbDcNOtHYR4gMAs",
  authDomain: "campusaura-12c16.firebaseapp.com",
  projectId: "campusaura-12c16",
  storageBucket: "campusaura-12c16.firebasestorage.app",
  messagingSenderId: "61154748746",
  appId: "1:61154748746:web:7bf72151769668f4ceb9b3",
  measurementId: "G-SLE1W4GERD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);      
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
