// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

// DOM Elements
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout-btn");
const authModal = document.getElementById("auth-modal");
const authModalTitle = document.getElementById("auth-modal-title");
const authSubmit = document.getElementById("auth-submit");
const authCancel = document.getElementById("auth-cancel");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const authError = document.getElementById("auth-error");

const videoInput = document.getElementById("video-url");
const loadVideoBtn = document.getElementById("load-video");
const videoFrame = document.getElementById("video-frame");

const reactionGroupContainer = document.getElementById("reaction-group-container");
const addReactionGroupBtn = document.getElementById("add-reaction-group");
const reactionBubble = document.getElementById("reaction-bubble");

let authMode = "login";

// UI Events
loginBtn.onclick = () => {
  authMode = "login";
  authModalTitle.textContent = "Log In";
  authModal.classList.remove("hidden");
};

signupBtn.onclick = () => {
  authMode = "signup";
  authModalTitle.textContent = "Sign Up";
  authModal.classList.remove("hidden");
};

authCancel.onclick = () => {
  authModal.classList.add("hidden");
  authError.textContent = "";
};

authSubmit.onclick = async () => {
  await handleAuthSubmit();
};

// Enable Enter key to submit form
["email", "password"].forEach((id) => {
  document.getElementById(id).addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleAuthSubmit();
    }
  });
});

async function handleAuthSubmit() {
  const email = emailInput.value;
  const password = passInput.value;
  try {
    if (authMode === "login") {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    authModal.classList.add("hidden");
    emailInput.value = "";
    passInput.value = "";
    authError.textContent = "";
  } catch (error) {
    switch (error.code) {
      case "auth/user-not-found":
        authError.textContent = "No account found with this email.";
        break;
      case "auth/wrong-password":
        authError.textContent = "Incorrect password.";
        break;
      case "auth/email-already-in-use":
        authError.textContent = "Email already in use.";
        break;
      case "auth/invalid-email":
        authError.textContent = "Invalid email address.";
        break;
      default:
        authError.textContent = "Something went wrong. Try again.";
    }
  }
}

logoutBtn.onclick = async () => {
  await signOut(auth);
};

// React to auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    authModal.classList.add("hidden");
  } else {
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
});

// Load Video
loadVideoBtn.onclick = () => {
  const url = videoInput.value;
  if (!url) return;
  videoFrame.src = url.includes("youtube.com") || url.includes("youtu.be")
    ? convertYouTubeToEmbed(url)
    : url;
};

// YouTube URL -> Embed
function convertYouTubeToEmbed(url) {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

// Add Reaction Group (basic placeholder)
addReactionGroupBtn.onclick = () => {
  const groupDiv = document.createElement("div");
  groupDiv.className = "reaction-group";
  ["Needs Improvement", "Good", "Excellent"].forEach((label) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.onclick = () => showBubble(label);
    groupDiv.appendChild(btn);
  });
  reactionGroupContainer.appendChild(groupDiv);
};

// Show feedback bubble in top right of video
function showBubble(text) {
  reactionBubble.textContent = text;
  reactionBubble.classList.remove("hidden");
  setTimeout(() => {
    reactionBubble.classList.add("hidden");
  }, 2000);
}