const socket = io();
const list = document.querySelector("[data-results]");
const empty = document.querySelector("[data-empty]");
const moneyPanel = document.querySelector("[data-admin-money]");
const moneyTotalEl = document.querySelector("[data-admin-money-total]");
const moneyCapEl = document.querySelector("[data-admin-money-cap]");

function formatTime(deltaMs) {
  if (deltaMs === 0) return "0.00s";
  return "+" + (deltaMs / 1000).toFixed(2) + "s";
}

function syncMoneyDisplay(payload) {
  if (!moneyPanel || !moneyTotalEl) return;

  if (!payload || payload.round !== 5 || payload.type !== "money") {
    moneyPanel.classList.add("hidden");
    return;
  }

  moneyPanel.classList.remove("hidden");
  var cap = payload.totalPool || 1000;
  if (moneyCapEl) {
    moneyCapEl.textContent = window.MoneyAnimate
      ? "of " + MoneyAnimate.formatMoney(cap, payload.currency)
      : "of " + cap + " " + payload.currency;
  }
  if (window.MoneyAnimate) {
    MoneyAnimate.setTotal(moneyTotalEl, payload.earnedAmount, payload.currency);
  } else {
    moneyTotalEl.textContent = payload.earnedAmount + " " + payload.currency;
  }
}

function render(state) {
  list.innerHTML = "";
  empty.classList.toggle("hidden", state.rings.length > 0);
  state.rings.forEach(function (ring) {
    var row = document.createElement("div");
    row.className = "result";
    row.innerHTML =
      '<div class="place" style="color:' + ring.color + '">#' + ring.order + "</div>" +
      "<div><strong>" + ring.name + "</strong>" +
      '<div style="color:var(--muted)">' + new Date(ring.at).toLocaleTimeString() + "</div></div>" +
      "<div>" + formatTime(ring.deltaMs) + "</div>";
    list.appendChild(row);
  });
}

async function enableSound() {
  await window.unlockBells();
}

enableSound();
document.addEventListener("pointerdown", enableSound, { once: true });

document.querySelector("[data-reset]").addEventListener("click", function () {
  socket.emit("reset");
});

socket.on("state", render);
socket.on("ring", function (ring) {
  window.playTeamBell(ring.team);
});

socket.on("quiz:display", syncMoneyDisplay);

socket.on("quiz:moneyGain", function (data) {
  if (!moneyPanel || !moneyTotalEl || !data) return;
  moneyPanel.classList.remove("hidden");
  if (window.MoneyAnimate) {
    MoneyAnimate.runMoneyGain(moneyTotalEl, data);
  }
});
