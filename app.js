import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaiqQnXJHjxE16WvEGjxbFQJZQnPVASVk",
  authDomain: "vidaro-e9b55.firebaseapp.com",
  projectId: "vidaro-e9b55",
  storageBucket: "vidaro-e9b55.firebasestorage.app",
  messagingSenderId: "1048856992681",
  appId: "1:1048856992681:web:5c05859353365caca002b8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// UI Elements
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout-btn");
const authModal = document.getElementById("auth-modal");
const authModalTitle = document.getElementById("auth-modal-title");
const authSubmit = document.getElementById("auth-submit");
const authCancel = document.getElementById("auth-cancel");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("auth-error");

let isLoginMode = true;

// Show auth modal in login or signup mode
loginBtn.addEventListener("click", () => {
  isLoginMode = true;
  authModalTitle.textContent = "Log In";
  authModal.classList.remove("hidden");
});

signupBtn.addEventListener("click", () => {
  isLoginMode = false;
  authModalTitle.textContent = "Sign Up";
  authModal.classList.remove("hidden");
});

authCancel.addEventListener("click", () => {
  authModal.classList.add("hidden");
  errorMsg.textContent = "";
});

// Submit login or signup
authSubmit.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    if (isLoginMode) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    // Close modal & clear inputs
    authModal.classList.add("hidden");
    emailInput.value = "";
    passwordInput.value = "";
    errorMsg.textContent = "";
  } catch (error) {
    console.error(error);
    errorMsg.textContent = error.message.replace("Firebase: ", "");
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

// Track login state and update UI
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
});