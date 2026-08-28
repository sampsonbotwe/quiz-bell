const socket = io();
const list = document.querySelector("[data-results]");
const empty = document.querySelector("[data-empty]");

function formatTime(deltaMs) {
  if (deltaMs === 0) return "0.00s";
  return "+" + (deltaMs / 1000).toFixed(2) + "s";
}

function render(state) {
  list.innerHTML = "";
  empty.classList.toggle("hidden", state.rings.length > 0);
  state.rings.forEach(function (ring) {
    var row = document.createElement("div");
    row.className = "result";
    row.innerHTML =
      '<div class="place" style="color:' + ring.color + '">#' + ring.order + "</div>" +
      "<div><strong>" + ring.name + "</strong>" +
      '<div style="color:var(--muted)">' + new Date(ring.at).toLocaleTimeString() + "</div></div>" +
      "<div>" + formatTime(ring.deltaMs) + "</div>";
    list.appendChild(row);
  });
}

async function enableSound() {
  await window.unlockBells();
}

enableSound();
document.addEventListener("pointerdown", enableSound, { once: true });

document.querySelector("[data-reset]").addEventListener("click", function () {
  socket.emit("reset");
});

socket.on("state", render);
socket.on("ring", function (ring) {
  window.playTeamBell(ring.team);
});
