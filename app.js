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
  // Ensure reactionBubble is inside wrapper
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

// Add Reaction Group with visual color palette and structured UI for reactions
addReactionGroupBtn.onclick = () => {
  // Create modal backdrop
  const modalBackdrop = document.createElement("div");
  modalBackdrop.className = "modal-backdrop";

  const modal = document.createElement("div");
  modal.className = "reaction-modal";

  modal.innerHTML = `
    <h2>Create Reaction Group</h2>
    <label>Group Name: <input type="text" id="group-name" /></label>
    <label>Number of Reactions (3 to 5): <input type="number" id="reaction-count" min="3" max="5" value="3" /></label>
    <div id="reaction-fields"></div>
    <div class="modal-buttons">
      <button id="confirm-group">Add Group</button>
      <button id="cancel-group">Cancel</button>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  document.body.appendChild(modal);

  const groupNameInput = modal.querySelector("#group-name");
  const countInput = modal.querySelector("#reaction-count");
  const fieldsContainer = modal.querySelector("#reaction-fields");

  function renderReactionFields(count) {
    fieldsContainer.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const wrapper = document.createElement("div");
      wrapper.className = "reaction-field";
      wrapper.innerHTML = `
        <label>Label ${i + 1}: <input type="text" class="reaction-label" value="Reaction ${i + 1}" /></label>
        <label>Color ${i + 1}: <select class="reaction-color">
          <option value="#4285f4">Blue</option>
          <option value="#ea4335">Red</option>
          <option value="#fbbc05">Yellow</option>
          <option value="#34a853">Green</option>
          <option value="#ff6f00">Orange</option>
          <option value="#9c27b0">Purple</option>
        </select></label>
      `;
      fieldsContainer.appendChild(wrapper);
    }
  }

  renderReactionFields(parseInt(countInput.value, 10));

  countInput.onchange = () => {
    let count = parseInt(countInput.value, 10);
    if (isNaN(count) || count < 3) count = 3;
    if (count > 5) count = 5;
    renderReactionFields(count);
  };

  modal.querySelector("#cancel-group").onclick = () => {
    modal.remove();
    modalBackdrop.remove();
  };

  modal.querySelector("#confirm-group").onclick = () => {
    const groupName = groupNameInput.value.trim();
    if (!groupName) return;

    const labels = modal.querySelectorAll(".reaction-label");
    for (const labelEl of labels) {
      if (!labelEl.value.trim()) {
        alert("Reaction labels cannot be empty.");
        return;
      }
    }

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

    const colors = modal.querySelectorAll(".reaction-color");

    labels.forEach((labelEl, i) => {
      const reactionLabel = labelEl.value;
      const reactionColor = colors[i].value;

      const btnWrapper = document.createElement("div");
      btnWrapper.style.display = "flex";
      btnWrapper.style.alignItems = "center";
      btnWrapper.style.marginBottom = "5px";

      const btn = document.createElement("button");
      btn.textContent = reactionLabel;
      btn.style.backgroundColor = reactionColor;
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
        if (newLabel) btn.textContent = newLabel;

        const colorOptions = ["#4285f4", "#ea4335", "#fbbc05", "#34a853", "#ff6f00", "#9c27b0"];
        const currentColor = btn.style.backgroundColor;
        const colorSelect = document.createElement("select");
        colorOptions.forEach(color => {
          const opt = document.createElement("option");
          opt.value = color;
          opt.textContent = color;
          opt.selected = currentColor === color;
          colorSelect.appendChild(opt);
        });
        const confirmColor = confirm("Use dropdown to select new color:");
        if (confirmColor) {
          document.body.appendChild(colorSelect);
          colorSelect.style.position = "fixed";
          colorSelect.style.top = "50%";
          colorSelect.style.left = "50%";
          colorSelect.style.zIndex = "9999";
          colorSelect.onchange = () => {
            btn.style.backgroundColor = colorSelect.value;
            document.body.removeChild(colorSelect);
          };
        }
      };

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.padding = "3px 6px";
      deleteBtn.style.fontSize = "0.8em";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.onclick = () => btnWrapper.remove();

      btnWrapper.appendChild(btn);
      btnWrapper.appendChild(editBtn);
      btnWrapper.appendChild(deleteBtn);
      groupDiv.appendChild(btnWrapper);
    });

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
    deleteGroupBtn.onclick = () => groupDiv.remove();

    groupDiv.appendChild(deleteGroupBtn);

    if (reactionGroupContainer.contains(addReactionGroupBtn)) {
      reactionGroupContainer.insertBefore(groupDiv, addReactionGroupBtn);
    }

    modal.remove();
    modalBackdrop.remove();
  };
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