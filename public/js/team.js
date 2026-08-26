const teamId = location.pathname.replace("/", "");
const page = document.querySelector(".team-page");
const nameEl = document.querySelector("[data-team-name]");
const statusEl = document.querySelector("[data-status]");
const button = document.querySelector("[data-bell]");
const socket = io();

const NAMES = {
  dunamis: "Dunamis",
  zoe: "Zoe",
  pneuma: "Pneuma",
};

page.classList.add(teamId);
nameEl.textContent = NAMES[teamId] || "Team";
document.title = `${NAMES[teamId] || "Team"} Bell`;

function applyState(state) {
  const pressed = Boolean(state.pressed[teamId]);
  const ring = state.rings.find((item) => item.team === teamId);
  button.disabled = pressed;
  button.textContent = pressed ? "RANG" : "RING";
  if (!pressed) {
    statusEl.textContent = "Ready. Press once to ring.";
    return;
  }
  statusEl.textContent = ring
    ? `Locked in at #${ring.order}`
    : "Locked until reset";
}

button.addEventListener("click", async () => {
  if (button.disabled) return;
  button.disabled = true;
  button.textContent = "RANG";
  statusEl.textContent = "Ring sent";
  await window.unlockBells();
  window.playTeamBell(teamId);
  socket.emit("ring", { team: teamId });
});

socket.on("state", applyState);
socket.on("reset", () => {
  button.disabled = false;
  button.textContent = "RING";
  statusEl.textContent = "Ready. Press once to ring.";
});
