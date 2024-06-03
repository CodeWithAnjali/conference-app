// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxdc-KCrxwAp_uerl7shHNkzfm7aQL1zc",
  authDomain: "conferencing-99719.firebaseapp.com",
  projectId: "conferencing-99719",
  storageBucket: "conferencing-99719.appspot.com",
  messagingSenderId: "89724815493",
  appId: "1:89724815493:web:ae59be7ad9b2f8d26b01ec",
  measurementId: "G-CHQLNQ2FP1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const firestore = getFirestore(app);