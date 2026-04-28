import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBk6iBG4bUpKIHEWLff3FhCO4EV3AkAqV0",
  authDomain: "raga-3a343.firebaseapp.com",
  projectId: "raga-3a343",
  storageBucket: "raga-3a343.firebasestorage.app",
  messagingSenderId: "808051689982",
  appId: "1:808051689982:web:63e7ab93f45fa54bcdd8af",
  measurementId: "G-04WWNKE98P"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
