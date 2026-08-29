const fs = require("fs");
const path = require("path");

const SCORES_FILE = path.join(__dirname, ".team-scores.json");
const TEAM_IDS = ["dunamis", "pneuma", "zoe"];
const ALLOWED_DELTAS = [-5, 5, 10, 15, 20];

function defaultScores() {
  return {
    dunamis: 0,
    pneuma: 0,
    zoe: 0,
  };
}

function defaultScoresState() {
  return {
    scores: defaultScores(),
    displayVisible: true,
  };
}

function loadScoresState() {
  try {
    const raw = fs.readFileSync(SCORES_FILE, "utf8");
    const data = JSON.parse(raw);
    const scores = defaultScores();
    TEAM_IDS.forEach(function (id) {
      var value = Number(data[id]);
      scores[id] = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
    });
    return {
      scores: scores,
      displayVisible: data.displayVisible !== false,
    };
  } catch (_err) {
    return defaultScoresState();
  }
}

function saveScoresState(scores, displayVisible) {
  const payload = {
    dunamis: scores.dunamis,
    pneuma: scores.pneuma,
    zoe: scores.zoe,
    displayVisible: displayVisible !== false,
  };
  fs.writeFileSync(SCORES_FILE, JSON.stringify(payload, null, 2) + "\n");
}

function loadTeamScores() {
  return loadScoresState().scores;
}

function saveTeamScores(scores) {
  var state = loadScoresState();
  saveScoresState(scores, state.displayVisible);
}

function isValidTeamId(teamId) {
  return TEAM_IDS.indexOf(teamId) >= 0;
}

function normalizeDelta(value) {
  var delta = Math.round(Number(value));
  if (!Number.isFinite(delta)) return null;
  if (ALLOWED_DELTAS.indexOf(delta) < 0) return null;
  return delta;
}

function adjustTeamScore(scores, teamId, delta) {
  if (!isValidTeamId(teamId)) return false;
  var next = normalizeDelta(delta);
  if (next == null) return false;
  scores[teamId] = Math.max(0, scores[teamId] + next);
  return true;
}

function setTeamScore(scores, teamId, value) {
  if (!isValidTeamId(teamId)) return false;
  var next = Math.round(Number(value));
  if (!Number.isFinite(next)) return false;
  scores[teamId] = Math.max(0, next);
  return true;
}

function resetTeamScores(scores) {
  TEAM_IDS.forEach(function (id) {
    scores[id] = 0;
  });
}

module.exports = {
  TEAM_IDS,
  SCORES_FILE,
  defaultScores,
  defaultScoresState,
  loadScoresState,
  saveScoresState,
  loadTeamScores,
  saveTeamScores,
  isValidTeamId,
  adjustTeamScore,
  setTeamScore,
  resetTeamScores,
};
