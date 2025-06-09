import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDvJqIfGCy-xxxxx", // use your values here
  authDomain: "vidaro-e9b55.firebaseapp.com",
  projectId: "vidaro-e9b55",
  storageBucket: "vidaro-e9b55.appspot.com",
  messagingSenderId: "245885912071",
  appId: "1:245885912071:web:xxxx"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elements
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout-btn");
const authModal = document.getElementById("auth-modal");
const authTitle = document.getElementById("auth-modal-title");
const authSubmit = document.getElementById("auth-submit");
const authCancel = document.getElementById("auth-cancel");
const authError = document.getElementById("auth-error");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const videoInput = document.getElementById("video-url");
const videoFrame = document.getElementById("video-frame");
const loadVideoBtn = document.getElementById("load-video");
const addFolderBtn = document.getElementById("add-folder");
const folderSelect = document.getElementById("folder-select");
const addReactionGroupBtn = document.getElementById("add-reaction-group");
const reactionContainer = document.getElementById("reaction-group-container");

let currentUser = null;
let authMode = "login";

// Auth listeners
loginBtn.onclick = () => {
  authMode = "login";
  authTitle.textContent = "Log In";
  authModal.classList.remove("hidden");
};
signupBtn.onclick = () => {
  authMode = "signup";
  authTitle.textContent = "Sign Up";
  authModal.classList.remove("hidden");
};
authCancel.onclick = () => {
  authModal.classList.add("hidden");
  emailInput.value = "";
  passInput.value = "";
  authError.textContent = "";
};
logoutBtn.onclick = () => {
  signOut(auth);
};

// Submit login/signup
authSubmit.onclick = async () => {
  const email = emailInput.value;
  const password = passInput.value;
  try {
    if (authMode === "login") {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    authModal.classList.add("hidden");
  } catch (error) {
    authError.textContent = "Authentication failed. Check your details.";
  }
};

// Auth state change
onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) {
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    loadFolders();
  } else {
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    folderSelect.innerHTML = "";
  }
});

// Load video
loadVideoBtn.onclick = () => {
  const url = videoInput.value;
  videoFrame.src = url.includes("youtube.com") || url.includes("youtu.be")
    ? `https://www.youtube.com/embed/${extractYouTubeID(url)}`
    : url;
};

function extractYouTubeID(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : "";
}

// Folder system
addFolderBtn.onclick = async () => {
  const name = prompt("Folder name?");
  if (!name || !currentUser) return;
  const ref = doc(db, "users", currentUser.uid);
  await setDoc(ref, { folders: arrayUnion(name) }, { merge: true });
  loadFolders();
};

async function loadFolders() {
  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const folders = snap.data().folders || [];
    folderSelect.innerHTML = "";
    folders.forEach(name => {
      const opt = document.createElement("option");
      opt.textContent = name;
      folderSelect.appendChild(opt);
    });
  }
}

// Reaction group (basic)
addReactionGroupBtn.onclick = () => {
  const groupName = prompt("Reaction group name?");
  if (!groupName) return;
  const container = document.createElement("div");
  container.innerHTML = `
    <h4>${groupName}</h4>
    <button>Needs Work</button>
    <button>Good</button>
    <button>Excellent</button>
  `;
  reactionContainer.appendChild(container);
};