
function loadVideo() {
  const url = document.getElementById("videoUrl").value;
  const container = document.getElementById("videoContainer");
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "relative mb-6";
  wrapper.style.width = "100%";
  wrapper.style.maxWidth = "960px";
  wrapper.style.margin = "0 auto";
  wrapper.style.aspectRatio = "16 / 9";
  wrapper.style.backgroundColor = "#000";

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

  embed.style.width = "100%";
  embed.style.height = "100%";
  embed.style.border = "none";
  embed.style.objectFit = "contain";

  wrapper.appendChild(embed);
  container.appendChild(wrapper);
}

window.loadVideo = loadVideo;
