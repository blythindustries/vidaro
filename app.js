
// ✅ Full working app.js with Firebase Auth, Firestore, Folder and Reaction logic
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs, doc, setDoc,
  updateDoc, deleteDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Your Firebase config
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
const auth = getAuth(app);
const db = getFirestore(app);

// --- UI Elements ---
const authSection = document.getElementById("authSection");
const folderSelect = document.getElementById("folderSelect");
const reactionGroupsContainer = document.getElementById("reactionGroups");

let currentUser = null;
let currentFolderId = null;

// --- Authentication ---
function updateAuthUI(user) {
  authSection.innerHTML = "";
  if (user) {
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.className = "bg-red-500 text-white px-3 py-1 rounded";
    logoutBtn.onclick = () => signOut(auth);
    authSection.append(`Logged in as ${user.email} `, logoutBtn);
  } else {
    const email = prompt("Enter email:");
    const password = prompt("Enter password:");
    if (email && password) {
      signInWithEmailAndPassword(auth, email, password)
        .catch(() => {
          createUserWithEmailAndPassword(auth, email, password).catch(alert);
        });
    }
  }
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    updateAuthUI(user);
    loadFolders();
  } else {
    updateAuthUI(null);
  }
});

// --- Folder Logic ---
async function loadFolders() {
  folderSelect.innerHTML = "";
  const q = query(collection(db, "folders"), where("uid", "==", currentUser.uid));
  const snap = await getDocs(q);
  snap.forEach((docItem) => {
    const opt = document.createElement("option");
    opt.value = docItem.id;
    opt.textContent = docItem.data().name;
    folderSelect.appendChild(opt);
  });
  if (folderSelect.options.length > 0) {
    folderSelect.selectedIndex = 0;
    currentFolderId = folderSelect.value;
    loadReactions();
  }
}

async function createFolder() {
  const name = prompt("Folder name:");
  if (!name) return;
  const ref = await addDoc(collection(db, "folders"), {
    name,
    uid: currentUser.uid
  });
  loadFolders();
}

async function renameFolder() {
  const newName = prompt("New folder name:");
  if (!newName) return;
  const docRef = doc(db, "folders", currentFolderId);
  await updateDoc(docRef, { name: newName });
  loadFolders();
}

async function deleteFolder() {
  if (!confirm("Delete this folder?")) return;
  await deleteDoc(doc(db, "folders", currentFolderId));
  loadFolders();
}

// --- Reaction Group Logic ---
async function loadReactions() {
  reactionGroupsContainer.innerHTML = "";
  const q = query(collection(db, "reactions"), where("uid", "==", currentUser.uid), where("folderId", "==", currentFolderId));
  const snap = await getDocs(q);
  snap.forEach((docItem) => {
    const data = docItem.data();
    addReactionGroupUI(data, docItem.id);
  });
}

function addReactionGroupUI(data = null, docId = null) {
  const groupDiv = document.createElement("div");
  groupDiv.className = "bg-white p-4 rounded shadow";

  const title = document.createElement("input");
  title.value = data?.name || "New Group";
  title.className = "font-bold text-lg mb-2 block w-full";

  const levelsDiv = document.createElement("div");
  (data?.levels || []).forEach((lvl) => {
    const btn = document.createElement("button");
    btn.textContent = lvl.label;
    btn.style.backgroundColor = lvl.color;
    btn.className = "text-white px-2 py-1 m-1 rounded";
    levelsDiv.appendChild(btn);
  });

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.className = "bg-blue-600 text-white px-3 py-1 mt-2 rounded";
  saveBtn.onclick = async () => {
    const levels = [...levelsDiv.querySelectorAll("button")].map((btn) => ({
      label: btn.textContent,
      color: btn.style.backgroundColor,
    }));
    const payload = {
      name: title.value,
      levels,
      uid: currentUser.uid,
      folderId: currentFolderId,
    };
    if (docId) {
      await setDoc(doc(db, "reactions", docId), payload);
    } else {
      await addDoc(collection(db, "reactions"), payload);
    }
    loadReactions();
  };

  groupDiv.append(title, levelsDiv, saveBtn);
  reactionGroupsContainer.appendChild(groupDiv);
}

function addReactionGroup() {
  addReactionGroupUI();
}

window.createFolder = createFolder;
window.renameFolder = renameFolder;
window.deleteFolder = deleteFolder;
window.addReactionGroup = addReactionGroup;
window.loadVideo = function () {
  const url = document.getElementById("videoUrl").value;
  const container = document.getElementById("videoContainer");
  container.innerHTML = "";
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.split("v=")[1] || url.split("/").pop();
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.className = "w-full h-full";
    container.appendChild(iframe);
  } else {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.className = "w-full h-full";
    container.appendChild(video);
  }
};
