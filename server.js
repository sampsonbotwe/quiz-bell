const os = require("os");
const path = require("path");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const quiz = require("./quiz-state");
const teamScoresStore = require("./team-scores");

const PORT = Number(process.env.PORT) || 3000;
const IS_DEV = process.env.NODE_ENV === "development";
const DEV_SESSION = Date.now();
const TEAMS = {
  dunamis: { id: "dunamis", name: "Dunamis", color: "#2563EB" },
  zoe: { id: "zoe", name: "Zoe", color: "#E63946" },
  pneuma: { id: "pneuma", name: "Pneuma", color: "#CA8A04" },
};

function createRound() {
  return {
    startedAt: Date.now(),
    rings: [],
  };
}

function createTimer() {
  return {
    durationSec: null,
    status: "idle",
    endsAt: null,
    remainingMs: 0,
  };
}

let round = createRound();
let timer = createTimer();
let quizState = quiz.loadPersistedQuizState() || quiz.createQuizState();
let round5AnswerPending = false;
const ROUND5_CORRECT_REVEAL_MS = 1300;
let scoresState = teamScoresStore.loadScoresState();
let teamScores = scoresState.scores;
let scoresDisplayVisible = scoresState.displayVisible;

function publicTeamScoresPayload() {
  var inScoreRound = quizState.round >= 1 && quizState.round <= 4;
  return {
    round: quizState.round,
    displayVisible: scoresDisplayVisible,
    showOnDisplay: scoresDisplayVisible && inScoreRound,
    teams: teamScoresStore.TEAM_IDS.map(function (teamId) {
      var team = TEAMS[teamId];
      return {
        id: teamId,
        name: team.name,
        color: team.color,
        score: teamScores[teamId],
      };
    }),
  };
}

function emitTeamScores() {
  teamScoresStore.saveScoresState(teamScores, scoresDisplayVisible);
  io.emit("teamScores", publicTeamScoresPayload());
}

function setScoresDisplayVisible(visible) {
  scoresDisplayVisible = Boolean(visible);
  emitTeamScores();
}

function emitQuizState() {
  quiz.saveQuizState(quizState);
  io.emit("quiz:display", quiz.publicDisplayPayload(quizState));
  io.emit("quiz:host", quiz.publicHostPayload(quizState));
  emitTeamScores();
}

function timerRemainingMs() {
  if (timer.status === "running" && timer.endsAt) {
    return Math.max(0, timer.endsAt - Date.now());
  }
  return timer.remainingMs;
}

function publicTimerState() {
  const remainingMs = timerRemainingMs();
  const canChangeDuration = timer.status === "idle" || timer.status === "stopped";

  return {
    durationSec: timer.durationSec,
    status: timer.status,
    remainingMs,
    canChangeDuration,
    canStart:
      (timer.status === "idle" || timer.status === "stopped") &&
      timer.durationSec > 0 &&
      remainingMs > 0,
    canStop: timer.status === "running",
    canReset: timer.status === "stopped" || timer.status === "expired",
  };
}

function emitTimerState() {
  io.emit("timerState", publicTimerState());
}

function setTimerDuration(seconds) {
  const value = Math.round(Number(seconds));
  if (!Number.isFinite(value) || value < 1 || value > 3600) return false;
  if (timer.status !== "idle" && timer.status !== "stopped") return false;

  timer.durationSec = value;
  timer.remainingMs = value * 1000;
  emitTimerState();
  return true;
}

function startTimer() {
  const state = publicTimerState();
  if (!state.canStart) return;

  timer.status = "running";
  timer.endsAt = Date.now() + timerRemainingMs();
  emitTimerState();
}

function stopTimer() {
  if (timer.status !== "running") return;

  timer.remainingMs = Math.max(0, timer.endsAt - Date.now());
  timer.endsAt = null;
  timer.status = "stopped";
  emitTimerState();
}

function resetTimer() {
  if (timer.status !== "stopped" && timer.status !== "expired") return;
  if (!timer.durationSec) return;

  timer.endsAt = null;
  timer.remainingMs = timer.durationSec * 1000;
  timer.status = "idle";
  emitTimerState();
}

function expireTimer() {
  if (timer.status !== "running") return;

  timer.remainingMs = 0;
  timer.endsAt = null;
  timer.status = "expired";
  emitTimerState();
  io.emit("timer:expired");
}

function buildPressed() {
  var pressed = {};
  var ids = Object.keys(TEAMS);
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    pressed[id] = round.rings.some(function (ring) {
      return ring.team === id;
    });
  }
  return pressed;
}

function publicState() {
  return {
    teams: Object.values(TEAMS),
    rings: round.rings,
    pressed: buildPressed(),
  };
}

function lanAddresses() {
  var nets = os.networkInterfaces();
  var addresses = [];
  var netNames = Object.keys(nets);

  for (var n = 0; n < netNames.length; n++) {
    var entries = nets[netNames[n]] || [];
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var family = entry.family;
      if ((family === "IPv4" || family === 4) && !entry.internal) {
        addresses.push(entry.address);
      }
    }
  }
  return addresses;
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

if (IS_DEV) {
  app.use(function (req, res, next) {
    if (/\.(css|js|html)$/.test(req.path)) {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    }
    next();
  });
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

function sendPage(file) {
  return (_req, res) => {
    res.sendFile(path.join(__dirname, "public", file));
  };
}

app.get("/", sendPage("index.html"));
app.get("/admin", sendPage("admin.html"));
app.get("/display", sendPage("display.html"));
app.get("/timer", sendPage("timer.html"));
app.get("/timer-control", sendPage("timer-control.html"));
app.get("/host", sendPage("host.html"));
app.get("/scores", sendPage("scores.html"));
app.get("/dunamis", sendPage("team.html"));
app.get("/zoe", sendPage("team.html"));
app.get("/pneuma", sendPage("team.html"));

app.get("/api/state", (_req, res) => {
  res.json(publicState());
});

app.get("/api/timer", (_req, res) => {
  res.json(publicTimerState());
});

app.get("/api/quiz/rounds", (_req, res) => {
  res.json(quiz.getRoundSummaries());
});

app.get("/api/team-scores", (_req, res) => {
  res.json(publicTeamScoresPayload());
});

app.post("/api/team-scores/adjust", (req, res) => {
  const teamId = req.body && req.body.teamId;
  const delta = req.body && req.body.delta;
  if (!teamScoresStore.adjustTeamScore(teamScores, teamId, delta)) {
    res.status(400).json({ error: "Invalid score update" });
    return;
  }
  emitTeamScores();
  res.json(publicTeamScoresPayload());
});

app.post("/api/team-scores/set", (req, res) => {
  const teamId = req.body && req.body.teamId;
  const score = req.body && req.body.score;
  if (!teamScoresStore.setTeamScore(teamScores, teamId, score)) {
    res.status(400).json({ error: "Invalid score update" });
    return;
  }
  emitTeamScores();
  res.json(publicTeamScoresPayload());
});

app.post("/api/team-scores/reset", (_req, res) => {
  teamScoresStore.resetTeamScores(teamScores);
  emitTeamScores();
  res.json(publicTeamScoresPayload());
});

app.post("/api/team-scores/display-visible", (req, res) => {
  if (!req.body || typeof req.body.visible !== "boolean") {
    res.status(400).json({ error: "Invalid visibility value" });
    return;
  }
  setScoresDisplayVisible(req.body.visible);
  res.json(publicTeamScoresPayload());
});

io.on("connection", (socket) => {
  if (IS_DEV) {
    socket.emit("dev:session", DEV_SESSION);
  }

  socket.emit("state", publicState());
  socket.emit("timerState", publicTimerState());
  socket.emit("quiz:display", quiz.publicDisplayPayload(quizState));
  socket.emit("quiz:host", quiz.publicHostPayload(quizState));
  socket.emit("teamScores", publicTeamScoresPayload());

  socket.on("scores:adjust", (payload) => {
    if (
      !payload ||
      !teamScoresStore.adjustTeamScore(teamScores, payload.teamId, payload.delta)
    ) {
      return;
    }
    emitTeamScores();
  });

  socket.on("scores:set", (payload) => {
    if (
      !payload ||
      !teamScoresStore.setTeamScore(teamScores, payload.teamId, payload.score)
    ) {
      return;
    }
    emitTeamScores();
  });

  socket.on("scores:reset", () => {
    teamScoresStore.resetTeamScores(teamScores);
    emitTeamScores();
  });

  socket.on("scores:setDisplayVisible", (payload) => {
    if (!payload || typeof payload.visible !== "boolean") return;
    setScoresDisplayVisible(payload.visible);
  });

  socket.on("ring", (payload) => {
    const teamId = payload && payload.team;
    const team = TEAMS[teamId];
    if (!team) return;
    if (round.rings.some((ring) => ring.team === teamId)) return;

    const now = Date.now();
    const firstAt = round.rings[0] ? round.rings[0].at : now;
    const ring = {
      team: teamId,
      name: team.name,
      color: team.color,
      at: now,
      order: round.rings.length + 1,
      deltaMs: now - firstAt,
    };

    round.rings.push(ring);
    io.emit("state", publicState());
    io.emit("ring", ring);
  });

  socket.on("reset", () => {
    round = createRound();
    io.emit("state", publicState());
    io.emit("reset");
  });

  socket.on("timer:setDuration", (payload) => {
    if (!payload || payload.seconds == null) return;
    setTimerDuration(payload.seconds);
  });

  socket.on("timer:start", () => {
    startTimer();
  });

  socket.on("timer:stop", () => {
    stopTimer();
  });

  socket.on("timer:reset", () => {
    resetTimer();
  });

  socket.on("quiz:hostReady", () => {
    if (quiz.hasActiveQuestion(quizState)) return;
    quiz.resetRoundFields(quizState, 1);
    emitQuizState();
  });

  socket.on("quiz:setRound", (payload) => {
    var roundNum = payload && Number(payload.round);
    if (!roundNum || roundNum < 1 || roundNum > 5) return;
    quiz.resetRoundFields(quizState, roundNum);
    emitQuizState();
  });

  socket.on("quiz:setSet", (payload) => {
    if (!payload || !payload.set) return;
    if (quiz.SET_IDS.indexOf(payload.set) < 0) return;
    if (quizState.round === 1) {
      quizState.set = payload.set;
      quizState.categoryId = null;
      quizState.blockIndex = 0;
      quizState.part = "main";
      quizState.visible = true;
      emitQuizState();
      return;
    }
    if (quizState.round === 3) {
      quizState.set = payload.set;
      quizState.questionIndex = 0;
      quizState.visible = true;
      emitQuizState();
    }
  });

  socket.on("quiz:selectCategory", (payload) => {
    if (!payload || !payload.categoryId) return;
    if (quizState.round !== 1 && quizState.round !== 2) return;
    quiz.selectCategory(quizState, payload.categoryId);
    emitQuizState();
  });

  socket.on("quiz:prev", () => {
    quiz.navigatePrev(quizState);
    emitQuizState();
  });

  socket.on("quiz:next", () => {
    quiz.navigateNext(quizState);
    emitQuizState();
  });

  socket.on("quiz:setPart", (payload) => {
    if (!payload || !payload.part) return;
    quiz.selectBlockPart(quizState, payload.part);
    emitQuizState();
  });

  socket.on("quiz:nextSet", () => {
    quiz.nextSet(quizState);
    emitQuizState();
  });

  socket.on("quiz:setVisible", (payload) => {
    if (!payload || typeof payload.visible !== "boolean") return;
    quizState.visible = payload.visible;
    emitQuizState();
  });

  socket.on("quiz:round5Answer", (payload) => {
    if (!payload || typeof payload.correct !== "boolean") return;
    if (quizState.round !== 5) return;
    if (round5AnswerPending) return;

    var questionList = quiz.ROUNDS[5].question;
    var currentQuestion = questionList[quizState.questionIndex];
    if (!currentQuestion) return;

    if (payload.correct) {
      round5AnswerPending = true;
      var answeredStep = currentQuestion.step;
      var previousTotal = quizState.earnedAmount;

      io.emit("quiz:round5CorrectReveal", {
        correctIndex: currentQuestion.correctIndex,
        step: answeredStep,
      });

      setTimeout(function () {
        quiz.markRound5Answer(quizState, true);
        emitQuizState();
        var gained = quizState.earnedAmount - previousTotal;
        if (gained > 0) {
          io.emit("quiz:moneyGain", {
            gained: gained,
            total: quizState.earnedAmount,
            currency: quiz.ROUNDS[5].currency,
            step: answeredStep,
          });
        }
        round5AnswerPending = false;
      }, ROUND5_CORRECT_REVEAL_MS);
      return;
    }

    quiz.markRound5Answer(quizState, false);
    emitQuizState();
    io.emit("quiz:moneyRoundEnd", {
      total: quizState.earnedAmount,
      currency: quiz.ROUNDS[5].currency,
      result: "wrong",
    });
  });

  socket.on("quiz:round5Reset", () => {
    if (quizState.round !== 5) return;
    round5AnswerPending = false;
    quizState.questionIndex = 0;
    quizState.earnedAmount = 0;
    quizState.round5Complete = false;
    quizState.round5LastResult = null;
    quizState.round5LifelineUsed = false;
    quizState.round5HiddenOptions = [];
    quizState.visible = true;
    emitQuizState();
  });

  socket.on("quiz:round5Lifeline", () => {
    if (quizState.round !== 5) return;
    if (!quiz.applyRound5Lifeline(quizState)) return;
    emitQuizState();
  });
});

setInterval(() => {
  if (timer.status === "running" && timer.endsAt && Date.now() >= timer.endsAt) {
    expireTimer();
  } else if (timer.status === "running") {
    emitTimerState();
  }
}, 100);

function printUrls(host) {
  console.log(`  Home           http://${host}:${PORT}/`);
  console.log(`  Dunamis        http://${host}:${PORT}/dunamis`);
  console.log(`  Zoe            http://${host}:${PORT}/zoe`);
  console.log(`  Pneuma         http://${host}:${PORT}/pneuma`);
  console.log(`  Admin          http://${host}:${PORT}/admin`);
  console.log(`  Display        http://${host}:${PORT}/display`);
  console.log(`  Timer          http://${host}:${PORT}/timer`);
  console.log(`  Timer Control  http://${host}:${PORT}/timer-control`);
  console.log(`  Quiz Host      http://${host}:${PORT}/host`);
  console.log(`  Scores         http://${host}:${PORT}/scores`);
}

server.listen(PORT, "0.0.0.0", function () {
  var urls = ["localhost"].concat(lanAddresses());
  console.log("Quiz Bell is running\n");
  for (var h = 0; h < urls.length; h++) {
    printUrls(urls[h]);
    console.log("");
  }
});
