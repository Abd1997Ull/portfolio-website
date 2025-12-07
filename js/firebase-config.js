// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDIqS9idTWmamsHPaBlHmLwJw3FP3P_o2k",
    authDomain: "portfolio-website-6cf65.firebaseapp.com",
    projectId: "portfolio-website-6cf65",
    storageBucket: "portfolio-website-6cf65.firebasestorage.app",
    messagingSenderId: "347623713136",
    appId: "1:347623713136:web:15915e3274277e665807b5",
    measurementId: "G-NKC6TNVVF1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('✅ Firebase initialized successfully!');
