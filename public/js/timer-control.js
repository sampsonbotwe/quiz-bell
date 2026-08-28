const socket = io();
const presetButtons = Array.from(document.querySelectorAll("[data-presets] [data-seconds]"));
const customInput = document.querySelector("[data-custom-input]");
const customApply = document.querySelector("[data-custom-apply]");
const selectedEl = document.querySelector("[data-selected-time]");
const startBtn = document.querySelector("[data-start]");
const stopBtn = document.querySelector("[data-stop]");
const resetBtn = document.querySelector("[data-reset]");

function formatSelected(seconds) {
  if (!seconds) return "No time selected";
  return `Selected: ${seconds}s`;
}

function setDuration(seconds) {
  socket.emit("timer:setDuration", { seconds });
}

function render(state) {
  selectedEl.textContent = formatSelected(state.durationSec);
  startBtn.disabled = !state.canStart;
  stopBtn.disabled = !state.canStop;
  resetBtn.disabled = !state.canReset;

  const durationLocked = !state.canChangeDuration;
  presetButtons.forEach((button) => {
    button.disabled = durationLocked;
    button.classList.toggle("active", Number(button.dataset.seconds) === state.durationSec);
  });
  customInput.disabled = durationLocked;
  customApply.disabled = durationLocked;
}

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDuration(Number(button.dataset.seconds));
  });
});

customApply.addEventListener("click", () => {
  if (!customInput.value) return;
  setDuration(Number(customInput.value));
});

startBtn.addEventListener("click", () => {
  socket.emit("timer:start");
});

stopBtn.addEventListener("click", () => {
  socket.emit("timer:stop");
});

resetBtn.addEventListener("click", () => {
  socket.emit("timer:reset");
});

socket.on("timerState", render);
