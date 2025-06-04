
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaiqQnXJHjxE16WvEGjxbFQJZQnPVASVk",
  authDomain: "vidaro-e9b55.firebaseapp.com",
  projectId: "vidaro-e9b55",
  storageBucket: "vidaro-e9b55.appspot.com",
  messagingSenderId: "1048856992681",
  appId: "1:1048856992681:web:5c05859353365caca002b8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const authSection = document.getElementById("authSection");

function showMessage(msg, isError = false) {
  let msgBox = document.getElementById("messageBox");
  if (!msgBox) {
    msgBox = document.createElement("div");
    msgBox.id = "messageBox";
    msgBox.className = "my-2 p-2 rounded text-sm w-full text-center";
    authSection.appendChild(msgBox);
  }
  msgBox.textContent = msg;
  msgBox.className = `my-2 p-2 rounded text-sm w-full text-center ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
  setTimeout(() => msgBox.remove(), 6000);
}

function renderAuthButtons(user) {
  authSection.innerHTML = "";
  const msgBox = document.getElementById("messageBox");
  if (msgBox) msgBox.remove();
  if (user) {
    const welcome = document.createElement("span");
    welcome.textContent = user.email;
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.className = "bg-red-600 text-white px-3 py-1 rounded ml-2";
    logoutBtn.onclick = () => signOut(auth);
    authSection.append(welcome, logoutBtn);
  } else {
    const loginBtn = document.createElement("button");
    loginBtn.textContent = "Login / Sign Up";
    loginBtn.className = "bg-indigo-600 text-white px-3 py-1 rounded";
    loginBtn.onclick = async () => {
      const email = prompt("Enter email:");
      const password = prompt("Enter password:");
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (e) {
        if (e.code === "auth/user-not-found") {
          try {
            await createUserWithEmailAndPassword(auth, email, password);
            showMessage("Account created and signed in!");
          } catch (err) {
            showMessage("Could not create account. Please try again.", true);
          }
        } else {
          showMessage("Login failed. Please check your email and password.", true);
        }
      }
    };
    authSection.appendChild(loginBtn);
  }
}

onAuthStateChanged(auth, async (user) => {
  renderAuthButtons(user);
  if (user) await loadFolders(user.uid);
});

async function createFolder() {
  const name = prompt("Folder name:");
  if (!name) return;
  const uid = auth.currentUser.uid;
  const folderRef = doc(collection(db, "users", uid, "folders"));
  await setDoc(folderRef, { name });
  await loadFolders(uid, folderRef.id);
}

async function loadFolders(uid, selectId = null) {
  const select = document.getElementById("folderSelect");
  select.innerHTML = "";
  const folderSnap = await getDocs(collection(db, "users", uid, "folders"));
  folderSnap.forEach(doc => {
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = doc.data().name;
    select.appendChild(option);
  });
  if (selectId) {
    select.value = selectId;
  }
}

async function renameFolder() {
  const select = document.getElementById("folderSelect");
  const id = select.value;
  const name = prompt("New folder name:");
  if (!id || !name) return;
  const uid = auth.currentUser.uid;
  const folderRef = doc(db, "users", uid, "folders", id);
  await updateDoc(folderRef, { name });
  await loadFolders(uid, id);
}

async function deleteFolder() {
  const select = document.getElementById("folderSelect");
  const id = select.value;
  if (!id || !confirm("Delete this folder?")) return;
  const uid = auth.currentUser.uid;
  const folderRef = doc(db, "users", uid, "folders", id);
  await deleteDoc(folderRef);
  await loadFolders(uid);
}

window.createFolder = createFolder;
window.renameFolder = renameFolder;
window.deleteFolder = deleteFolder;

function loadVideo() {
  const url = document.getElementById("videoUrl").value;
  const container = document.getElementById("videoContainer");
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.width = "100%";
  wrapper.style.maxWidth = "960px";
  wrapper.style.margin = "0 auto";
  wrapper.style.paddingTop = "56.25%"; // 16:9
  wrapper.className = "relative mb-6";

  let embed;
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.includes("youtu.be") ? url.split("/").pop() : new URL(url).searchParams.get("v");
    embed = document.createElement("iframe");
    embed.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    embed.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  } else if (url.includes("vimeo.com")) {
    const id = url.split("/").pop();
    embed = document.createElement("iframe");
    embed.src = `https://player.vimeo.com/video/${id}`;
  } else {
    embed = document.createElement("video");
    embed.src = url;
    embed.controls = true;
  }

  embed.style.position = "absolute";
  embed.style.top = "0";
  embed.style.left = "0";
  embed.style.width = "100%";
  embed.style.height = "100%";

  wrapper.appendChild(embed);
  container.appendChild(wrapper);
}

window.loadVideo = loadVideo;
