// Firebase SDK imports
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { app } from "./firebase-init.js";
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
      await signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log("Login success:", userCredential.user);
        })
        .catch((error) => {
          console.error("Login failed:", error.code, error.message);
          throw error; // rethrow for outer catch
        });
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    // Ensure modal is hidden and inputs cleared on success
    authModal.classList.add("hidden");
    emailInput.value = "";
    passInput.value = "";
    authError.textContent = "";
    // Directly update login/logout button display logic after successful login/signup
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } catch (error) {
    console.error("Authentication error:", error);
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

// Ensure DOM is fully loaded before listening to auth changes
window.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User logged in:", user.email);
      loginBtn.style.display = "none";
      signupBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
      authModal.classList.add("hidden");
      emailInput.value = "";
      passInput.value = "";
      authError.textContent = "";
    } else {
      console.log("User logged out");
      loginBtn.style.display = "inline-block";
      signupBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
    }
  });

  logoutBtn.onclick = async () => {
    await signOut(auth);
    console.log("User signed out");
  };
});

// Load Video
loadVideoBtn.onclick = () => {
  const url = videoInput.value;
  if (!url) return;
  videoFrame.style.display = "block";
  videoFrame.src = url.includes("youtube.com") || url.includes("youtu.be")
    ? convertYouTubeToEmbed(url)
    : url;
};

// YouTube URL -> Embed
function convertYouTubeToEmbed(url) {
  const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : "";
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
    // Color palette grid structure (two groups of four colors)
    const colorGroups = [
      ["#f28b82", "#fbbc04", "#fff475", "#ccff90"],
      ["#a7ffeb", "#cbf0f8", "#aecbfa", "#d7aefb"],
    ];
    // Default selected color for first swatch
    const defaultColor = "#f28b82";
    for (let i = 0; i < count; i++) {
      const wrapper = document.createElement("div");
      wrapper.className = "reaction-field";
      wrapper.innerHTML = `
        <label>Label ${i + 1}: <input type="text" class="reaction-label" value="Reaction ${i + 1}" /></label>
        <label>Color ${i + 1}:</label>
        <div class="color-palette-grid color-palette" data-index="${i}">
          <div class="color-group">
            <div class="color-swatch${colorGroups[0][0] === defaultColor ? " selected" : ""}" style="background-color:${colorGroups[0][0]}" data-color="${colorGroups[0][0]}"></div>
            <div class="color-swatch" style="background-color:${colorGroups[0][1]}" data-color="${colorGroups[0][1]}"></div>
            <div class="color-swatch" style="background-color:${colorGroups[0][2]}" data-color="${colorGroups[0][2]}"></div>
            <div class="color-swatch" style="background-color:${colorGroups[0][3]}" data-color="${colorGroups[0][3]}"></div>
          </div>
          <div class="color-group">
            <div class="color-swatch" style="background-color:${colorGroups[1][0]}" data-color="${colorGroups[1][0]}"></div>
            <div class="color-swatch" style="background-color:${colorGroups[1][1]}" data-color="${colorGroups[1][1]}"></div>
            <div class="color-swatch" style="background-color:${colorGroups[1][2]}" data-color="${colorGroups[1][2]}"></div>
            <div class="color-swatch" style="background-color:${colorGroups[1][3]}" data-color="${colorGroups[1][3]}"></div>
          </div>
        </div>
      `;
      fieldsContainer.appendChild(wrapper);
    }

    // Add click event listeners for color swatches
    const palettes = fieldsContainer.querySelectorAll(".color-palette");
    palettes.forEach(palette => {
      const swatches = palette.querySelectorAll(".color-swatch");
      // Select first swatch as default if none selected
      if (![...swatches].some(s => s.classList.contains("selected"))) {
        swatches[0].classList.add("selected");
      }
      swatches.forEach(swatch => {
        swatch.onclick = () => {
          swatches.forEach(s => s.classList.remove("selected"));
          swatch.classList.add("selected");
        };
      });
    });
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
    groupDiv.style.backgroundColor = "#ffffff";
    groupDiv.style.border = "1px solid #ddd";
    groupDiv.style.borderRadius = "10px";
    groupDiv.style.padding = "10px";
    groupDiv.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";

    const title = document.createElement("h3");
    title.textContent = groupName;
    groupDiv.appendChild(title);

    labels.forEach((labelEl, i) => {
      const reactionLabel = labelEl.value;
      const palette = modal.querySelector(`.color-palette[data-index="${i}"]`);
      const selectedSwatch = palette.querySelector(".color-swatch.selected");
      const reactionColor = selectedSwatch ? selectedSwatch.getAttribute("data-color") : "#4285f4";

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
      btn.style.borderRadius = "9999px"; // pill shape
      btn.style.fontWeight = "600";
      btn.style.fontSize = "0.85em";
      btn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
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
        // Modal-style overlay for editing label and color
        const modalBackdrop = document.createElement("div");
        modalBackdrop.className = "modal-backdrop";
        modalBackdrop.style.zIndex = "10000";
        const modal = document.createElement("div");
        modal.className = "reaction-modal";
        modal.style.zIndex = "10001";
        modal.style.minWidth = "300px";
        // Color palette grid structure for edit modal
        const colorGroups = [
          ["#f28b82", "#fbbc04", "#fff475", "#ccff90"],
          ["#a7ffeb", "#cbf0f8", "#aecbfa", "#d7aefb"],
        ];
        // Modal HTML
        modal.innerHTML = `
          <h3>Edit Reaction</h3>
          <label>Label: <input type="text" id="edit-reaction-label" value="${btn.textContent}" /></label>
          <label>Color:</label>
          <div class="color-palette-grid color-palette" id="edit-color-palette">
            <div class="color-group">
              <div class="color-swatch" style="background-color:${colorGroups[0][0]}" data-color="${colorGroups[0][0]}"></div>
              <div class="color-swatch" style="background-color:${colorGroups[0][1]}" data-color="${colorGroups[0][1]}"></div>
              <div class="color-swatch" style="background-color:${colorGroups[0][2]}" data-color="${colorGroups[0][2]}"></div>
              <div class="color-swatch" style="background-color:${colorGroups[0][3]}" data-color="${colorGroups[0][3]}"></div>
            </div>
            <div class="color-group">
              <div class="color-swatch" style="background-color:${colorGroups[1][0]}" data-color="${colorGroups[1][0]}"></div>
              <div class="color-swatch" style="background-color:${colorGroups[1][1]}" data-color="${colorGroups[1][1]}"></div>
              <div class="color-swatch" style="background-color:${colorGroups[1][2]}" data-color="${colorGroups[1][2]}"></div>
              <div class="color-swatch" style="background-color:${colorGroups[1][3]}" data-color="${colorGroups[1][3]}"></div>
            </div>
          </div>
          <div class="modal-buttons" style="margin-top:12px;">
            <button id="edit-save-btn">Save</button>
            <button id="edit-cancel-btn">Cancel</button>
          </div>
        `;
        document.body.appendChild(modalBackdrop);
        document.body.appendChild(modal);

        // Preselect color swatch
        const palette = modal.querySelector("#edit-color-palette");
        const swatches = palette.querySelectorAll(".color-swatch");
        let currentColor = btn.style.backgroundColor;
        // Convert rgb(x,x,x) to hex if needed
        function rgbToHex(rgb) {
          // e.g. rgb(66, 133, 244)
          if (!rgb.startsWith("rgb")) return rgb;
          const nums = rgb.match(/\d+/g);
          if (!nums) return rgb;
          return (
            "#" +
            nums
              .map((n) => {
                let hex = parseInt(n).toString(16);
                if (hex.length < 2) hex = "0" + hex;
                return hex;
              })
              .join("")
          );
        }
        const currentHex = rgbToHex(currentColor);
        let found = false;
        swatches.forEach((swatch) => {
          if (swatch.getAttribute("data-color").toLowerCase() === currentHex.toLowerCase()) {
            swatch.classList.add("selected");
            found = true;
          }
        });
        // If no match, select first swatch
        if (!found && swatches.length > 0) swatches[0].classList.add("selected");

        swatches.forEach((swatch) => {
          swatch.onclick = () => {
            swatches.forEach((s) => s.classList.remove("selected"));
            swatch.classList.add("selected");
          };
        });

        // Cancel handler
        modal.querySelector("#edit-cancel-btn").onclick = () => {
          modal.remove();
          modalBackdrop.remove();
        };
        // Save handler
        modal.querySelector("#edit-save-btn").onclick = () => {
          const newLabel = modal.querySelector("#edit-reaction-label").value.trim();
          if (newLabel) btn.textContent = newLabel;
          const selectedSwatch = palette.querySelector(".color-swatch.selected");
          if (selectedSwatch) {
            btn.style.backgroundColor = selectedSwatch.getAttribute("data-color");
          }
          modal.remove();
          modalBackdrop.remove();
        };
      };

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.padding = "3px 6px";
      deleteBtn.style.fontSize = "0.8em";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.style.marginLeft = "4px";
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