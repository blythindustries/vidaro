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

// Apply styles to reactionGroupContainer to display groups in columns
reactionGroupContainer.style.display = "flex";
reactionGroupContainer.style.flexWrap = "nowrap";
reactionGroupContainer.style.alignItems = "flex-start";
reactionGroupContainer.style.position = "relative";

// Style for addReactionGroupBtn to remain fixed size and aligned right
addReactionGroupBtn.style.flex = "0 0 auto";
addReactionGroupBtn.style.marginLeft = "auto";
addReactionGroupBtn.style.height = "40px";
addReactionGroupBtn.style.width = "150px";

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
    // Ensure modal is hidden and inputs cleared on success
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
    console.log("User logged in:", user.email);
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    setTimeout(() => {
      authModal.classList.add("hidden");
      emailInput.value = "";
      passInput.value = "";
      authError.textContent = "";
    }, 0);
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

// Wrap videoFrame with a container to position reactionBubble inside it top-right
// Check if wrapper exists, if not create it
(function wrapVideoFrame() {
  let wrapper = document.getElementById("video-frame-wrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "video-frame-wrapper";
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    videoFrame.parentNode.insertBefore(wrapper, videoFrame);
    wrapper.appendChild(videoFrame);
  }
  // Move reactionBubble inside wrapper and style it for top-right corner
  if (reactionBubble.parentNode !== wrapper) {
    wrapper.appendChild(reactionBubble);
  }
  reactionBubble.style.position = "absolute";
  reactionBubble.style.top = "10px";
  reactionBubble.style.right = "10px";
  reactionBubble.style.zIndex = "10";
  reactionBubble.style.backgroundColor = "rgba(0,0,0,0.7)";
  reactionBubble.style.color = "white";
  reactionBubble.style.padding = "5px 10px";
  reactionBubble.style.borderRadius = "5px";
  reactionBubble.style.pointerEvents = "none";
  reactionBubble.style.transition = "opacity 0.3s ease";
})();

// Add Reaction Group with user-defined group and reaction customization
addReactionGroupBtn.onclick = () => {
  const groupName = prompt("Enter a name for the reaction group:");
  if (!groupName) return;

  const groupDiv = document.createElement("div");
  groupDiv.className = "reaction-group";
  groupDiv.style.display = "flex";
  groupDiv.style.flexDirection = "column";
  groupDiv.style.alignItems = "flex-start";
  groupDiv.style.marginRight = "20px";
  groupDiv.style.minWidth = "150px";

  const title = document.createElement("h3");
  title.textContent = groupName;
  groupDiv.appendChild(title);

  let numReactions = parseInt(prompt("How many reactions? (3 to 5)"), 10);
  if (isNaN(numReactions) || numReactions < 3 || numReactions > 5) {
    numReactions = 3;
  }

  for (let i = 0; i < numReactions; i++) {
    const reactionLabel = prompt(`Enter label for reaction ${i + 1}:`, `Reaction ${i + 1}`);
    const reactionColor = prompt(`Enter background color for reaction ${i + 1} (e.g. red, #ff0000):`, "#cccccc");

    const btnWrapper = document.createElement("div");
    btnWrapper.style.display = "flex";
    btnWrapper.style.alignItems = "center";
    btnWrapper.style.marginBottom = "5px";

    const btn = document.createElement("button");
    btn.textContent = reactionLabel;
    btn.style.backgroundColor = reactionColor || "#cccccc";
    btn.style.border = "none";
    btn.style.color = "white";
    btn.style.padding = "5px 10px";
    btn.style.marginRight = "5px";
    btn.style.borderRadius = "3px";
    btn.style.cursor = "pointer";
    btn.onclick = () => showBubble(`${groupName} - ${btn.textContent}`);

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.style.marginRight = "5px";
    editBtn.style.padding = "3px 6px";
    editBtn.style.fontSize = "0.8em";
    editBtn.style.cursor = "pointer";
    editBtn.onclick = () => {
      const newLabel = prompt("Enter new label:", btn.textContent);
      if (newLabel !== null && newLabel.trim() !== "") {
        btn.textContent = newLabel;
      }
      const newColor = prompt("Enter new background color (e.g. red, #ff0000):", btn.style.backgroundColor);
      if (newColor !== null && newColor.trim() !== "") {
        btn.style.backgroundColor = newColor;
      }
    };

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.padding = "3px 6px";
    deleteBtn.style.fontSize = "0.8em";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.onclick = () => {
      btnWrapper.remove();
    };

    btnWrapper.appendChild(btn);
    btnWrapper.appendChild(editBtn);
    btnWrapper.appendChild(deleteBtn);
    groupDiv.appendChild(btnWrapper);
  }

  // Delete Group button
  const deleteGroupBtn = document.createElement("button");
  deleteGroupBtn.textContent = "Delete Group";
  deleteGroupBtn.style.marginTop = "10px";
  deleteGroupBtn.style.padding = "5px 10px";
  deleteGroupBtn.style.cursor = "pointer";
  deleteGroupBtn.style.backgroundColor = "#d9534f";
  deleteGroupBtn.style.color = "white";
  deleteGroupBtn.style.border = "none";
  deleteGroupBtn.style.borderRadius = "3px";
  deleteGroupBtn.onclick = () => {
    groupDiv.remove();
  };
  groupDiv.appendChild(deleteGroupBtn);

  // Insert groupDiv before addReactionGroupBtn only if addReactionGroupBtn is still in container
  if (reactionGroupContainer.contains(addReactionGroupBtn)) {
    reactionGroupContainer.insertBefore(groupDiv, addReactionGroupBtn);
  }
};

// Show feedback bubble in top right of video
function showBubble(text) {
  reactionBubble.textContent = text;
  reactionBubble.classList.remove("hidden");
  reactionBubble.style.opacity = "1";
  reactionBubble.style.top = "10px";
  reactionBubble.style.right = "10px";
  setTimeout(() => {
    reactionBubble.style.opacity = "0";
    setTimeout(() => {
      reactionBubble.classList.add("hidden");
    }, 300);
  }, 2000);
}