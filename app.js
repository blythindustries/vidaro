// REAL WORKING app.js for Vidaro MVP

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCaiqQnXJHjxE16WvEGjxbFQJZQnPVASVk",
  authDomain: "vidaro-e9b55.firebaseapp.com",
  projectId: "vidaro-e9b55",
  storageBucket: "vidaro-e9b55.appspot.com",
  messagingSenderId: "1048856992681",
  appId: "1:1048856992681:web:5c05859353365caca002b8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

let currentUser = null;
let currentFolder = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById("userEmail").textContent = user.email;
    await setupDefaultFolder();
    await loadFolders();
    renderReactions();
  } else {
    document.getElementById("userEmail").textContent = "Not logged in";
  }
});

async function setupDefaultFolder() {
  const folderSelect = document.getElementById("folderSelect");
  const folderCol = collection(db, "users", currentUser.uid, "folders");
  const snap = await getDocs(folderCol);
  if (snap.empty) {
    await setDoc(doc(folderCol, "Default"), { name: "Default" });
  }
  currentFolder = "Default";
}

async function loadFolders() {
  const folderSelect = document.getElementById("folderSelect");
  folderSelect.innerHTML = "";
  const folderCol = collection(db, "users", currentUser.uid, "folders");
  const snap = await getDocs(folderCol);
  snap.forEach(doc => {
    const opt = document.createElement("option");
    opt.value = doc.id;
    opt.textContent = doc.data().name;
    folderSelect.appendChild(opt);
  });
  folderSelect.value = currentFolder;
  folderSelect.onchange = (e) => {
    currentFolder = e.target.value;
  };
}

window.createNewFolder = async function () {
  const name = prompt("Enter new folder name:");
  if (!name) return;
  const id = name.replace(/\s+/g, "-").toLowerCase();
  await setDoc(doc(db, "users", currentUser.uid, "folders", id), { name });
  currentFolder = id;
  await loadFolders();
};

// Reactions
const defaultReactions = [
  { category: "Clarity", text: "Needs Improvement", color: "#f87171" },
  { category: "Clarity", text: "Good", color: "#facc15" },
  { category: "Clarity", text: "Excellent", color: "#4ade80" }
];

function renderReactions() {
  const container = document.getElementById("reactionGroups");
  container.innerHTML = "";
  const grouped = {};
  defaultReactions.forEach(r => {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  });

  Object.keys(grouped).forEach(category => {
    const col = document.createElement("div");
    col.innerHTML = `<h3 class="font-semibold mb-2">${category}</h3>`;
    grouped[category].forEach(r => {
      const btn = document.createElement("button");
      btn.textContent = r.text;
      btn.className = "block w-full mb-1 rounded px-2 py-1 text-white";
      btn.style.backgroundColor = r.color;
      btn.onclick = () => handleReaction(r);
      col.appendChild(btn);
    });
    container.appendChild(col);
  });
}

function handleReaction(reaction) {
  const time = new Date().toLocaleTimeString();
  showBubble(reaction.text, reaction.color);
  saveReactionToFirestore(reaction, time);
}

function showBubble(text, color) {
  const videoContainer = document.getElementById("videoContainer");
  const bubble = document.createElement("div");
  bubble.textContent = text;
  bubble.className = "absolute px-4 py-2 rounded-full text-white font-semibold shadow-lg transition-opacity duration-500";
  bubble.style.backgroundColor = color;
  bubble.style.top = "50%";
  bubble.style.left = "50%";
  bubble.style.transform = "translate(-50%, -50%)";
  videoContainer.appendChild(bubble);
  setTimeout(() => bubble.remove(), 5000);
}

async function saveReactionToFirestore(reaction, time) {
  const folderPath = collection(db, "users", currentUser.uid, "folders", currentFolder, "reactions");
  await addDoc(folderPath, {
    video: document.getElementById("videoUrl").value,
    timestamp: time,
    text: reaction.text,
    color: reaction.color,
    category: reaction.category,
    username: currentUser.email
  });
}

window.loadVideo = function () {
  const url = document.getElementById("videoUrl").value.trim();
  const container = document.getElementById("videoContainer");
  container.innerHTML = "";
  let embed;
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.includes("v=")
      ? new URL(url).searchParams.get("v")
      : url.split("/").pop();
    embed = document.createElement("iframe");
    embed.src = `https://www.youtube.com/embed/${videoId}`;
    embed.className = "w-full h-full";
    embed.allowFullscreen = true;
  } else if (url.endsWith(".mp4")) {
    embed = document.createElement("video");
    embed.src = url;
    embed.controls = true;
    embed.className = "w-full h-full";
  } else {
    container.textContent = "Unsupported video type.";
    return;
  }
  container.appendChild(embed);
};

window.copyShareLink = function () {
  navigator.clipboard.writeText(window.location.href);
  alert("Link copied to clipboard!");
};

window.generatePDF = function () {
  alert("PDF export logic would run here.");
};
