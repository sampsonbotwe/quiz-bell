const socket = io();
const valueEl = document.querySelector("[data-timer-value]");

function formatTime(ms, status) {
  if (status === "expired") return "TIME UP";
  if (status === "idle" && ms <= 0) return "00";
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return String(seconds);
}

function render(state) {
  valueEl.textContent = formatTime(state.remainingMs, state.status);
  document.body.classList.toggle("timer-expired", state.status === "expired");
}

socket.on("timerState", render);
