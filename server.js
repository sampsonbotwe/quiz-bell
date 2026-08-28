const os = require("os");
const path = require("path");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const PORT = Number(process.env.PORT) || 3000;
const TEAMS = {
  dunamis: { id: "dunamis", name: "Dunamis", color: "#1A7CFF" },
  zoe: { id: "zoe", name: "Zoe", color: "#72C044" },
  pneuma: { id: "pneuma", name: "Pneuma", color: "#E3A21C" },
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

app.use(express.static(path.join(__dirname, "public")));

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
app.get("/dunamis", sendPage("team.html"));
app.get("/zoe", sendPage("team.html"));
app.get("/pneuma", sendPage("team.html"));

app.get("/api/state", (_req, res) => {
  res.json(publicState());
});

app.get("/api/timer", (_req, res) => {
  res.json(publicTimerState());
});

io.on("connection", (socket) => {
  socket.emit("state", publicState());
  socket.emit("timerState", publicTimerState());

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
}

server.listen(PORT, "0.0.0.0", function () {
  var urls = ["localhost"].concat(lanAddresses());
  console.log("Quiz Bell is running\n");
  for (var h = 0; h < urls.length; h++) {
    printUrls(urls[h]);
    console.log("");
  }
});
