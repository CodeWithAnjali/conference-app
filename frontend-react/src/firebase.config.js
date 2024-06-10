// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "ADMIN_DOMAIN",
  projectId: "PROJECT_ID",
  storageBucket: "STORAGE_BUCKET_ID",
  messagingSenderId: "MESSAGINGSENDERID",
  appId: "APP_ID",
  measurementId: "MEASUREMENT_ID"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const firestore = getFirestore(app);