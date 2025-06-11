// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaiqQnXJHjxE16WvEGjxbFQJZQnPVASVk",
  authDomain: "vidaro-e9b55.firebaseapp.com",
  projectId: "vidaro-e9b55",
  storageBucket: "vidaro-e9b55.appspot.com",
  messagingSenderId: "1048856992681",
  appId: "1:1048856992681:web:5c05859353365caca002b8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };