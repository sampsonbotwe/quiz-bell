const socket = io();
const ranks = Array.from(document.querySelectorAll("[data-rank]"));
const gate = document.querySelector("[data-audio-gate]");

function formatTime(deltaMs) {
  if (deltaMs === 0) return "FIRST";
  return `+${(deltaMs / 1000).toFixed(2)}s`;
}

function render(state) {
  ranks.forEach((node, index) => {
    const ring = state.rings[index];
    const name = node.querySelector("[data-name]");
    const time = node.querySelector("[data-time]");
    const bar = node.querySelector(".slot-bar");

    node.classList.toggle("live", Boolean(ring));
    name.textContent = ring ? ring.name : "Waiting";
    time.textContent = ring ? formatTime(ring.deltaMs) : "—";

    if (ring) {
      bar.style.background = ring.color;
      node.dataset.team = ring.team;
    } else {
      bar.style.background = "";
      delete node.dataset.team;
    }
  });
}

const enableBtn = gate.querySelector("[data-enable-sound]");
const readyBtn = gate.querySelector("[data-ready-display]");
const testButtons = Array.from(gate.querySelectorAll("[data-test]"));

enableBtn.addEventListener("click", async () => {
  await window.unlockBells();
  testButtons.forEach((button) => {
    button.disabled = false;
  });
  readyBtn.disabled = false;
  enableBtn.textContent = "Sound on";
});

testButtons.forEach((button) => {
  button.addEventListener("click", () => {
    window.playTeamBell(button.dataset.test);
  });
});

readyBtn.addEventListener("click", () => {
  gate.classList.add("hidden");
});

socket.on("state", render);
socket.on("ring", (ring) => {
  window.playTeamBell(ring.team);
  const node = ranks[ring.order - 1];
  if (node) {
    node.classList.remove("flash");
    void node.offsetWidth;
    node.classList.add("flash");
  }
});
