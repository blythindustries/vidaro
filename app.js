
// Firebase config and initialization
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

let currentUser = null;
let currentFolder = null;

// UI helpers
function showMessage(msg) {
  const box = document.getElementById('messageBox');
  box.textContent = msg;
  box.classList.remove('hidden');
  setTimeout(() => box.classList.add('hidden'), 5000);
}

function toggleForm(id) {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById(id).classList.toggle('hidden');
}

// Auth
function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(err => showMessage("Login failed: " + err.message));
}

function signup() {
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  auth.createUserWithEmailAndPassword(email, password)
    .catch(err => showMessage("Signup failed: " + err.message));
}

function logout() {
  auth.signOut();
}

auth.onAuthStateChanged(user => {
  currentUser = user;
  document.getElementById('loginBtn').classList.toggle('hidden', !!user);
  document.getElementById('signupBtn').classList.toggle('hidden', !!user);
  document.getElementById('logoutBtn').classList.toggle('hidden', !user);
  if (user) {
    loadFolders();
  }
});

// Folders
function loadFolders() {
  db.collection("users").doc(currentUser.uid).collection("folders").get().then(snapshot => {
    const dropdown = document.getElementById("folderDropdown");
    dropdown.innerHTML = "";
    snapshot.forEach(doc => {
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = doc.id;
      dropdown.appendChild(option);
    });
    if (snapshot.size > 0) {
      currentFolder = snapshot.docs[0].id;
    }
  });
}

function createFolder() {
  const name = document.getElementById("newFolderName").value;
  if (!name) return showMessage("Please enter a folder name");
  db.collection("users").doc(currentUser.uid).collection("folders").doc(name).set({ created: Date.now() });
  setTimeout(loadFolders, 500);
}

function deleteCurrentFolder() {
  const folder = document.getElementById("folderDropdown").value;
  db.collection("users").doc(currentUser.uid).collection("folders").doc(folder).delete();
  setTimeout(loadFolders, 500);
}

// Video
function loadVideo() {
  const url = document.getElementById("videoUrl").value;
  const container = document.getElementById("videoContainer");
  let embed = "";

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    embed = \`<iframe width="640" height="360" src="https://www.youtube.com/embed/\${videoId}" frameborder="0" allowfullscreen></iframe>\`;
  } else if (url.includes("vimeo.com")) {
    const id = url.split("/").pop();
    embed = \`<iframe width="640" height="360" src="https://player.vimeo.com/video/\${id}" frameborder="0" allowfullscreen></iframe>\`;
  } else {
    embed = \`<video width="640" height="360" controls src="\${url}"></video>\`;
  }

  container.innerHTML = embed;
}

// Reactions
function addReactionGroup() {
  const groupId = "group" + Date.now();
  const div = document.createElement("div");
  div.id = groupId;
  div.innerHTML = \`
    <input placeholder="Group Name" id="\${groupId}-name">
    <button onclick="addReactionButton('\${groupId}')">Add Reaction</button>
    <div id="\${groupId}-buttons"></div>
  \`;
  document.getElementById("reactionGroups").appendChild(div);
}

function addReactionButton(groupId) {
  const group = document.getElementById(\`\${groupId}-buttons\`);
  if (group.childElementCount >= 5) {
    showMessage("Max 5 reactions per group");
    return;
  }

  const label = prompt("Reaction label?");
  if (!label) return;
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.onclick = () => showReactionBubble(document.getElementById(\`\${groupId}-name\`).value + " – " + label);
  group.appendChild(btn);
}

function showReactionBubble(text) {
  const bubble = document.getElementById("reactionBubble");
  bubble.textContent = text;
  bubble.classList.remove("hidden");
  setTimeout(() => bubble.classList.add("hidden"), 5000);
}
