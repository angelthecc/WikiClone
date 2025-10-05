import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9eLg5CJXzakMGEUfykW25Vay-pvcf2gQ",
  authDomain: "wikicloneangel.firebaseapp.com",
  projectId: "wikicloneangel",
  storageBucket: "wikicloneangel.firebasestorage.app",
  messagingSenderId: "326980840327",
  appId: "1:326980840327:web:7b8cf54747be1adc1f8122",
  measurementId: "G-XQ7ZHJ4DLN"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
