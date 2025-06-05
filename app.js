
// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCaiqQnXJHjxE16WvEGjxbFQJZQnPVASVk",
  authDomain: "vidaro-e9b55.firebaseapp.com",
  projectId: "vidaro-e9b55",
  storageBucket: "vidaro-e9b55.appspot.com",
  messagingSenderId: "1048856992681",
  appId: "1:1048856992681:web:5c05859353365caca002b8"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Auth Logic
function toggleForm(formId) {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("signupForm").classList.add("hidden");
  document.getElementById(formId).classList.remove("hidden");
}

function showMessage(msg) {
  const box = document.getElementById("messageBox");
  box.textContent = msg;
  box.classList.remove("hidden");
  setTimeout(() => box.classList.add("hidden"), 4000);
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("loginForm").classList.add("hidden");
      showMessage("Logged in successfully!");
    })
    .catch(error => {
      showMessage("Login failed. Please check your credentials.");
      console.error(error);
    });
}

function signup() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("signupForm").classList.add("hidden");
      showMessage("Account created!");
    })
    .catch(error => {
      showMessage("Sign-up failed. Try again.");
      console.error(error);
    });
}

function logout() {
  auth.signOut().then(() => {
    showMessage("Logged out!");
  });
}

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("logoutBtn").classList.remove("hidden");
    loadFolders();
  } else {
    document.getElementById("logoutBtn").classList.add("hidden");
  }
});

// Video Logic
function loadVideo() {
  const url = document.getElementById("videoUrl").value.trim();
  const container = document.getElementById("videoContainer");
  container.innerHTML = '';

  let embedUrl = '';
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.split("v=")[1] || url.split("/").pop();
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (url.includes("vimeo.com")) {
    const vimeoId = url.split("/").pop();
    embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
  } else {
    embedUrl = url;
  }

  const iframe = document.createElement("iframe");
  iframe.src = embedUrl;
  iframe.frameBorder = "0";
  iframe.allow = "autoplay; fullscreen";
  iframe.allowFullscreen = true;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  container.appendChild(iframe);
}

// Folder logic
function createFolder() {
  const name = document.getElementById("newFolderName").value.trim();
  if (!auth.currentUser || !name) return;
  const uid = auth.currentUser.uid;
  db.collection("users").doc(uid).collection("folders").doc(name).set({
    created: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    showMessage("Folder created.");
    loadFolders();
  });
}

function deleteCurrentFolder() {
  const select = document.getElementById("folderDropdown");
  const folder = select.value;
  if (!auth.currentUser || !folder) return;
  const uid = auth.currentUser.uid;
  db.collection("users").doc(uid).collection("folders").doc(folder).delete().then(() => {
    showMessage("Folder deleted.");
    loadFolders();
  });
}

function loadFolders() {
  const uid = auth.currentUser.uid;
  const dropdown = document.getElementById("folderDropdown");
  dropdown.innerHTML = '';
  db.collection("users").doc(uid).collection("folders").get().then(snapshot => {
    snapshot.forEach(doc => {
      const opt = document.createElement("option");
      opt.value = doc.id;
      opt.textContent = doc.id;
      dropdown.appendChild(opt);
    });
  });
}

// Reaction Logic (basic setup placeholder for now)
function addReactionGroup() {
  const container = document.getElementById("reactionGroups");
  const group = document.createElement("div");
  group.className = "reaction-group";
  group.textContent = "Reaction Group (customizable)";
  container.appendChild(group);
}
