const socket = io();
const valueEl = document.querySelector("[data-timer-value]");
let playedForExpiry = false;

function formatTime(ms, status) {
  if (status === "idle" && ms <= 0) return "00";
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return String(seconds);
}

async function playDenied() {
  await window.unlockBells();
  window.playDeniedSound();
}

function render(state) {
  valueEl.textContent = formatTime(state.remainingMs, state.status);
  document.body.classList.toggle("timer-running", state.status === "running");
  document.body.classList.toggle("timer-expired", state.status === "expired");

  if (state.status === "expired") {
    if (!playedForExpiry) {
      playedForExpiry = true;
      playDenied();
    }
    return;
  }

  playedForExpiry = false;
}

async function enableSound() {
  await window.unlockBells();
}

enableSound();
document.addEventListener("pointerdown", enableSound, { once: true });
document.addEventListener("keydown", enableSound, { once: true });

socket.on("timerState", render);
