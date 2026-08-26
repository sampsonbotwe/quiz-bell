const os = require("os");
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

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

let round = createRound();

function publicState() {
  return {
    teams: Object.values(TEAMS),
    rings: round.rings,
    pressed: Object.fromEntries(
      Object.keys(TEAMS).map((id) => [
        id,
        round.rings.some((ring) => ring.team === id),
      ])
    ),
  };
}

function lanAddresses() {
  const nets = os.networkInterfaces();
  const addresses = [];
  for (const entries of Object.values(nets)) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) {
        addresses.push(entry.address);
      }
    }
  }
  return addresses;
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

function sendPage(file) {
  return (_req, res) => {
    res.sendFile(path.join(__dirname, "public", file));
  };
}

app.get("/", sendPage("index.html"));
app.get("/admin", sendPage("admin.html"));
app.get("/display", sendPage("display.html"));
app.get("/dunamis", sendPage("team.html"));
app.get("/zoe", sendPage("team.html"));
app.get("/pneuma", sendPage("team.html"));

app.get("/api/state", (_req, res) => {
  res.json(publicState());
});

io.on("connection", (socket) => {
  socket.emit("state", publicState());

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
});

server.listen(PORT, "0.0.0.0", () => {
  const urls = ["localhost", ...lanAddresses()];
  console.log("Quiz Bell is running\n");
  for (const host of urls) {
    console.log(`  Home     http://${host}:${PORT}/`);
    console.log(`  Dunamis  http://${host}:${PORT}/dunamis`);
    console.log(`  Zoe      http://${host}:${PORT}/zoe`);
    console.log(`  Pneuma   http://${host}:${PORT}/pneuma`);
    console.log(`  Admin    http://${host}:${PORT}/admin`);
    console.log(`  Display  http://${host}:${PORT}/display`);
    console.log("");
  }
});
