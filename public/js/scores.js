const socket = io();

const gridEl = document.querySelector("[data-scores-grid]");
const resetBtn = document.querySelector("[data-scores-reset]");
const displayToggleBtn = document.querySelector("[data-scores-display-toggle]");
const statusEl = document.querySelector("[data-scores-status]");

const ALLOWED_DELTAS = [-5, 5, 10, 20];

const QUICK_DELTAS = ALLOWED_DELTAS;

function adjustScore(teamId, delta) {
  socket.emit("scores:adjust", { teamId: teamId, delta: delta });
  fetch("/api/team-scores/adjust", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId: teamId, delta: delta }),
  }).catch(function () {
    /* socket is primary */
  });
}

function setDisplayVisible(visible) {
  socket.emit("scores:setDisplayVisible", { visible: visible });
  fetch("/api/team-scores/display-visible", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visible: visible }),
  }).catch(function () {
    /* socket is primary */
  });
}

function updateDisplayToggle(payload) {
  if (!displayToggleBtn || !payload) return;

  var visible = payload.displayVisible !== false;
  var inScoreRound = payload.round >= 1 && payload.round <= 4;
  var showing = visible && inScoreRound;

  displayToggleBtn.textContent = visible ? "Hide on display" : "Show on display";
  displayToggleBtn.classList.toggle("host-toggle-active", !visible);

  if (statusEl) {
    if (!visible) {
      statusEl.textContent = "Scores are hidden on the display.";
    } else if (!inScoreRound) {
      statusEl.textContent =
        "Scores are set to show on the display during rounds 1–4. Current round: " +
        payload.round +
        ".";
    } else if (showing) {
      statusEl.textContent = "Scores are visible on the display.";
    } else {
      statusEl.textContent = "Scores will appear on the display in rounds 1–4.";
    }
  }
}

function renderScores(payload) {
  if (!gridEl || !payload || !payload.teams) return;

  updateDisplayToggle(payload);

  gridEl.innerHTML = "";
  payload.teams.forEach(function (team) {
    var card = document.createElement("article");
    card.className = "scores-card";
    card.style.setProperty("--team-color", team.color);

    var head = document.createElement("div");
    head.className = "scores-card__head";

    var name = document.createElement("h2");
    name.className = "scores-card__name";
    name.textContent = team.name;

    var value = document.createElement("p");
    value.className = "scores-card__value";
    value.textContent = String(team.score);

    head.appendChild(name);
    head.appendChild(value);
    card.appendChild(head);

    var actions = document.createElement("div");
    actions.className = "scores-card__actions";
    QUICK_DELTAS.forEach(function (delta) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "scores-card__btn";
      btn.textContent = delta > 0 ? "+" + delta : String(delta);
      btn.addEventListener("click", function () {
        adjustScore(team.id, delta);
      });
      actions.appendChild(btn);
    });
    card.appendChild(actions);

    gridEl.appendChild(card);
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", function () {
    socket.emit("scores:reset");
    fetch("/api/team-scores/reset", { method: "POST", credentials: "same-origin" }).catch(function () {});
  });
}

if (displayToggleBtn) {
  displayToggleBtn.addEventListener("click", function () {
    var nextVisible = displayToggleBtn.classList.contains("host-toggle-active");
    setDisplayVisible(nextVisible);
  });
}

fetch("/api/team-scores", { credentials: "same-origin" })
  .then(function (res) {
    return res.json();
  })
  .then(renderScores)
  .catch(function () {});

socket.on("teamScores", renderScores);
