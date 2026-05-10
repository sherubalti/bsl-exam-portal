import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfEDxZWkzLf2e8Fs-fFAD7I9XuCSQtXOs",
  authDomain: "navttc-exam-portal.firebaseapp.com",
  databaseURL: "https://navttc-exam-portal-default-rtdb.firebaseio.com",
  projectId: "navttc-exam-portal",
  storageBucket: "navttc-exam-portal.firebasestorage.app",
  messagingSenderId: "417198915063",
  appId: "1:417198915063:web:9b218ec132d10e7e2402f2",
  measurementId: "G-X1T95GRGRK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);
