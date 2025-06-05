
// Firebase setup
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

// UI elements
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const messageBox = document.getElementById("messageBox");

function toggleForm(id) {
  loginForm.classList.add("hidden");
  signupForm.classList.add("hidden");
  document.getElementById(id).classList.remove("hidden");
}

function showMessage(message) {
  messageBox.innerText = message;
  messageBox.classList.remove("hidden");
  setTimeout(() => messageBox.classList.add("hidden"), 4000);
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      loginForm.classList.add("hidden");
      document.getElementById("logoutBtn").classList.remove("hidden");
      document.getElementById("loginBtn").classList.add("hidden");
      document.getElementById("signupBtn").classList.add("hidden");
      loadFolders();
    })
    .catch(error => {
      showMessage("Login failed: " + error.message);
    });
}

function signup() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      signupForm.classList.add("hidden");
      document.getElementById("logoutBtn").classList.remove("hidden");
      document.getElementById("loginBtn").classList.add("hidden");
      document.getElementById("signupBtn").classList.add("hidden");
      loadFolders();
    })
    .catch(error => {
      showMessage("Signup failed: " + error.message);
    });
}

function logout() {
  auth.signOut().then(() => {
    document.getElementById("logoutBtn").classList.add("hidden");
    document.getElementById("loginBtn").classList.remove("hidden");
    document.getElementById("signupBtn").classList.remove("hidden");
    document.getElementById("folderList").innerHTML = "";
    document.getElementById("reactionGroups").innerHTML = "";
  });
}

function createFolder() {
  const folderName = document.getElementById("newFolderName").value.trim();
  if (!folderName) return;
  const user = auth.currentUser;
  if (!user) return;

  db.collection("users").doc(user.uid).collection("folders").add({ name: folderName })
    .then(() => {
      loadFolders();
      document.getElementById("newFolderName").value = "";
    });
}

function loadFolders() {
  const user = auth.currentUser;
  if (!user) return;
  const list = document.getElementById("folderList");
  list.innerHTML = "";
  db.collection("users").doc(user.uid).collection("folders").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const div = document.createElement("div");
        div.innerText = doc.data().name;
        list.appendChild(div);
      });
    });
}

function loadVideo() {
  const url = document.getElementById("videoUrl").value;
  const container = document.getElementById("videoContainer");
  container.innerHTML = "";

  let embedUrl = "";

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.includes("youtu.be")
      ? url.split("youtu.be/")[1].split("?")[0]
      : new URLSearchParams(new URL(url).search).get("v");
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (url.includes("vimeo.com")) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) embedUrl = `https://player.vimeo.com/video/${match[1]}`;
  }

  if (embedUrl) {
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.allowFullscreen = true;
    container.appendChild(iframe);
  } else {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    container.appendChild(video);
  }
}

function addReactionGroup() {
  const container = document.getElementById("reactionGroups");
  const group = document.createElement("div");
  group.classList.add("reaction-set");

  const label = prompt("Enter reaction group name:");
  if (!label) return;

  const title = document.createElement("h4");
  title.innerText = label;
  group.appendChild(title);

  ["Needs Improvement", "Good", "Excellent"].forEach(text => {
    const btn = document.createElement("button");
    btn.innerText = text;
    btn.className = "primary";
    btn.onclick = () => alert(`Reaction clicked: ${text}`);
    group.appendChild(btn);
  });

  container.appendChild(group);
}

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("loginBtn").classList.add("hidden");
    document.getElementById("signupBtn").classList.add("hidden");
    document.getElementById("logoutBtn").classList.remove("hidden");
    loadFolders();
  } else {
    document.getElementById("logoutBtn").classList.add("hidden");
    document.getElementById("loginBtn").classList.remove("hidden");
    document.getElementById("signupBtn").classList.remove("hidden");
  }
});
