const socket = io();
const presetButtons = Array.from(document.querySelectorAll("[data-presets] [data-seconds]"));
const customInput = document.querySelector("[data-custom-input]");
const customApply = document.querySelector("[data-custom-apply]");
const selectedEl = document.querySelector("[data-selected-time]");
const countdownEl = document.querySelector("[data-timer-value]");
const startBtn = document.querySelector("[data-start]");
const stopBtn = document.querySelector("[data-stop]");
const resetBtn = document.querySelector("[data-reset]");
let playedForExpiry = false;

function formatSelected(seconds) {
  if (!seconds) return "No time selected";
  return "Selected: " + seconds + "s";
}

function formatTime(ms, status) {
  if (status === "idle" && ms <= 0) return "00";
  var seconds = Math.max(0, Math.ceil(ms / 1000));
  return String(seconds);
}

function setDuration(seconds) {
  socket.emit("timer:setDuration", { seconds: seconds });
}

async function playDenied() {
  await window.unlockBells();
  window.playDeniedSound();
}

async function enableSound() {
  await window.unlockBells();
}

function render(state) {
  countdownEl.textContent = formatTime(state.remainingMs, state.status);
  document.body.classList.toggle("timer-expired", state.status === "expired");

  selectedEl.textContent = formatSelected(state.durationSec);
  startBtn.disabled = !state.canStart;
  stopBtn.disabled = !state.canStop;
  resetBtn.disabled = !state.canReset;

  var durationLocked = !state.canChangeDuration;
  presetButtons.forEach(function (button) {
    button.disabled = durationLocked;
    button.classList.toggle("active", Number(button.dataset.seconds) === state.durationSec);
  });
  customInput.disabled = durationLocked;
  customApply.disabled = durationLocked;

  if (state.status === "expired") {
    if (!playedForExpiry) {
      playedForExpiry = true;
      playDenied();
    }
    return;
  }

  playedForExpiry = false;
}

enableSound();
document.addEventListener("pointerdown", enableSound, { once: true });

presetButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    setDuration(Number(button.dataset.seconds));
  });
});

customApply.addEventListener("click", function () {
  if (!customInput.value) return;
  setDuration(Number(customInput.value));
});

startBtn.addEventListener("click", function () {
  socket.emit("timer:start");
});

stopBtn.addEventListener("click", function () {
  socket.emit("timer:stop");
});

resetBtn.addEventListener("click", function () {
  socket.emit("timer:reset");
});

socket.on("timerState", render);
