const socket = io();
const valueEl = document.querySelector("[data-timer-value]");
const pillEl = document.querySelector(".timer-pill");
var fadeTimer = null;
var expireTimer = null;
var buzzDurationMs = 1800;

var buzzMeta = new Audio("/assets/buzz.mp3");
buzzMeta.preload = "auto";
buzzMeta.addEventListener("loadedmetadata", function () {
  if (buzzMeta.duration && isFinite(buzzMeta.duration)) {
    buzzDurationMs = Math.ceil(buzzMeta.duration * 1000) + 200;
  }
});

function formatTime(ms, status) {
  if (status === "expired") return "TIME UP";
  if (status === "idle" && ms <= 0) return "00";
  var seconds = Math.max(0, Math.ceil(ms / 1000));
  return String(seconds);
}

function clearTimers() {
  if (fadeTimer) clearTimeout(fadeTimer);
  if (expireTimer) clearTimeout(expireTimer);
  fadeTimer = null;
  expireTimer = null;
}

function hidePill() {
  pillEl.classList.remove("timer-pill-visible", "timer-pill-fade-out");
  pillEl.classList.add("timer-pill-hidden");
}

function showPill() {
  pillEl.classList.remove("timer-pill-hidden", "timer-pill-fade-out");
  pillEl.classList.add("timer-pill-visible");
}

function fadeOutPill() {
  pillEl.classList.add("timer-pill-fade-out");
  fadeTimer = setTimeout(hidePill, 700);
}

function scheduleExpireFade() {
  expireTimer = setTimeout(fadeOutPill, buzzDurationMs);
}

function render(state) {
  valueEl.textContent = formatTime(state.remainingMs, state.status);
  document.body.classList.toggle("timer-expired", state.status === "expired");

  if (state.status === "running") {
    clearTimers();
    showPill();
    return;
  }

  if (state.status === "expired") {
    if (!pillEl.classList.contains("timer-pill-visible")) {
      showPill();
    }
    if (!expireTimer && !pillEl.classList.contains("timer-pill-fade-out")) {
      scheduleExpireFade();
    }
    return;
  }

  clearTimers();
  hidePill();
}

hidePill();
socket.on("timerState", render);
