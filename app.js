
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const signupBtn = document.getElementById("signupBtn");
  const videoURL = document.getElementById("videoURL");
  const loadVideo = document.getElementById("loadVideo");
  const videoPlayer = document.getElementById("videoPlayer");
  const reactionContainer = document.getElementById("reactionGroupArea");
  const bubble = document.getElementById("reactionBubbleContainer");
  const addReactionGroup = document.getElementById("addReactionGroup");

  loadVideo.addEventListener("click", () => {
    const url = videoURL.value;
    let embedURL = url;

    if (url.includes("youtube.com/watch?v=")) {
      const videoID = url.split("v=")[1];
      embedURL = "https://www.youtube.com/embed/" + videoID;
    } else if (url.includes("youtu.be/")) {
      const videoID = url.split("youtu.be/")[1];
      embedURL = "https://www.youtube.com/embed/" + videoID;
    } else if (url.includes("vimeo.com/")) {
      const videoID = url.split("vimeo.com/")[1];
      embedURL = "https://player.vimeo.com/video/" + videoID;
    }

    videoPlayer.src = embedURL;
  });

  addReactionGroup.addEventListener("click", () => {
    const groupName = prompt("Enter name for reaction group:");
    if (!groupName) return;

    const groupDiv = document.createElement("div");
    groupDiv.innerHTML = `<h4>${groupName}</h4>`;
    const levels = ["Needs Improvement", "Good", "Excellent"];

    levels.forEach(level => {
      const btn = document.createElement("button");
      btn.className = "reaction-button";
      btn.style.backgroundColor = level === "Needs Improvement" ? "#f44336" :
                                  level === "Good" ? "#ff9800" : "#4caf50";
      btn.textContent = `${groupName} - ${level}`;
      btn.addEventListener("click", () => {
        showReactionBubble(`${groupName} - ${level}`);
      });
      groupDiv.appendChild(btn);
    });

    reactionContainer.appendChild(groupDiv);
  });

  function showReactionBubble(text) {
    bubble.textContent = text;
    bubble.style.display = "block";
    setTimeout(() => {
      bubble.style.display = "none";
    }, 5000);
  }

  // Placeholder for auth handling
  loginBtn.addEventListener("click", () => alert("Login not functional yet"));
  signupBtn.addEventListener("click", () => alert("Signup not functional yet"));
  logoutBtn.addEventListener("click", () => alert("Logout not functional yet"));
});
