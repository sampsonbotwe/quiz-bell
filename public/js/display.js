const socket = io();
const ranks = Array.from(document.querySelectorAll("[data-rank]"));

function formatTime(deltaMs) {
  if (deltaMs === 0) return "FIRST";
  return "+" + (deltaMs / 1000).toFixed(2) + "s";
}

function render(state) {
  ranks.forEach(function (node, index) {
    var ring = state.rings[index];
    var name = node.querySelector("[data-name]");
    var time = node.querySelector("[data-time]");
    var bar = node.querySelector(".slot-bar");

    node.classList.toggle("live", Boolean(ring));
    name.textContent = ring ? ring.name : "Waiting";
    time.textContent = ring ? formatTime(ring.deltaMs) : "—";

    if (ring) {
      bar.style.background = ring.color;
      node.dataset.team = ring.team;
    } else {
      bar.style.background = "";
      delete node.dataset.team;
    }
  });
}

socket.on("state", render);
socket.on("ring", function (ring) {
  var node = ranks[ring.order - 1];
  if (node) {
    node.classList.remove("flash");
    void node.offsetWidth;
    node.classList.add("flash");
  }
});
