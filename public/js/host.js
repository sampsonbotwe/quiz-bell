const socket = io();

const roundTabs = document.querySelector("[data-round-tabs]");
const setPanel = document.querySelector("[data-set-panel]");
const setTabs = document.querySelector("[data-set-tabs]");
const categoryPanel = document.querySelector("[data-category-panel]");
const categoryGrid = document.querySelector("[data-category-grid]");
const riddlePanel = document.querySelector("[data-riddle-panel]");
const clueList = document.querySelector("[data-clue-list]");
const moneyPanel = document.querySelector("[data-money-panel]");
const moneyLadder = document.querySelector("[data-money-ladder]");
const moneyEarned = document.querySelector("[data-money-earned]");
const round5Actions = document.querySelector("[data-round5-actions]");
const round5Reset = document.querySelector("[data-round5-reset]");
const questionPanel = document.querySelector("[data-question-panel]");
const questionText = document.querySelector("[data-question-text]");
const optionList = document.querySelector("[data-option-list]");
const answerText = document.querySelector("[data-answer-text]");
const round3Note = document.querySelector("[data-round3-note]");
const progressEl = document.querySelector("[data-progress]");
const navProgressEl = document.querySelector("[data-nav-progress]");
const prevBtn = document.querySelector("[data-prev]");
const nextBtn = document.querySelector("[data-next]");
const subNav = document.querySelector("[data-sub-nav]");
const subTabs = document.querySelector("[data-sub-tabs]");
const toggleDisplayBtn = document.querySelector("[data-toggle-display]");

var roundsMeta = [];
var currentState = null;

function fetchRounds() {
  fetch("/api/quiz/rounds")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      roundsMeta = data;
      renderRoundTabs();
    });
}

function renderRoundTabs() {
  roundTabs.innerHTML = "";
  roundsMeta.forEach(function (round) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "round-tab";
    btn.textContent = "Round " + round.id;
    btn.title = round.title;
    btn.dataset.round = round.id;
    btn.addEventListener("click", function () {
      socket.emit("quiz:setRound", { round: round.id });
    });
    roundTabs.appendChild(btn);
  });
}

function setActiveRoundTab(round) {
  roundTabs.querySelectorAll(".round-tab").forEach(function (btn) {
    btn.classList.toggle("active", Number(btn.dataset.round) === round);
  });
}

function renderSetTabs(state) {
  setTabs.innerHTML = "";
  ["A", "B", "C"].forEach(function (setId) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pill-btn";
    btn.textContent = "Set " + setId;
    btn.classList.toggle("active", state.set === setId);
    btn.addEventListener("click", function () {
      socket.emit("quiz:setSet", { set: setId });
    });
    setTabs.appendChild(btn);
  });
}

function renderCategories(state) {
  categoryGrid.innerHTML = "";
  if (!state.categories) return;

  state.categories.forEach(function (cat) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-btn";
    btn.textContent = cat.name;
    btn.classList.toggle("active", state.categoryId === cat.id);
    btn.addEventListener("click", function () {
      socket.emit("quiz:selectCategory", { categoryId: cat.id });
    });
    categoryGrid.appendChild(btn);
  });
}

function renderClueList(item) {
  clueList.innerHTML = "";
  if (!item || !item.allClues) return;

  item.allClues.forEach(function (clue, index) {
    var li = document.createElement("li");
    var revealed = index < item.clues.length;
    li.innerHTML =
      "<strong>Clue " +
      (index + 1) +
      (revealed ? " (on display)" : " (hidden)") +
      ":</strong> " +
      clue;
    li.classList.toggle("clue-revealed", revealed);
    li.classList.toggle("clue-hidden-host", !revealed);
    clueList.appendChild(li);
  });
}

function renderMoneyLadder(state) {
  moneyLadder.innerHTML = "";
  if (!state.ladder) return;

  state.ladder.forEach(function (step, index) {
    var li = document.createElement("li");
    var isCurrent =
      !state.round5Complete && state.questionIndex === index;
    var isPassed =
      state.round5Complete ||
      (state.earnedAmount >= step.amount && index < state.questionIndex);
    li.textContent = step.amount + " " + state.currency;
    li.classList.toggle("current", isCurrent);
    li.classList.toggle("passed", isPassed && !isCurrent);
    moneyLadder.appendChild(li);
  });

  moneyEarned.textContent =
    "Total earned: " + state.earnedAmount + " " + state.currency;
}

function updateSubControls(item) {
  if (!item || item.type !== "block" || !item.subCount) {
    subNav.classList.add("hidden");
    return;
  }

  subNav.classList.remove("hidden");
  subTabs.querySelectorAll("[data-part]").forEach(function (btn) {
    var part = btn.dataset.part;
    var available =
      part === "main" ||
      (part === "sub1" && item.subCount >= 1) ||
      (part === "sub2" && item.subCount >= 2);
    btn.classList.toggle("hidden", !available);
    btn.classList.toggle("active", item.part === part);
    btn.disabled = !available;
  });
}

function updateNavControls(state) {
  var item = state.item;
  var canNavigate = Boolean(item && item.total && !item.gameOver);

  if (item && item.type === "block") {
    prevBtn.disabled = item.mainIndex === 0;
    nextBtn.disabled = item.mainIndex >= item.mainTotal - 1;
    navProgressEl.textContent =
      "Question " + (item.mainIndex + 1) + " of " + item.mainTotal;
    updateSubControls(item);
    return;
  }

  subNav.classList.add("hidden");
  prevBtn.disabled = !canNavigate || item.index === 0;
  nextBtn.disabled = !canNavigate || item.index >= item.total - 1;

  if (!item || !item.total) {
    if (state.round === 1 || state.round === 2) {
      navProgressEl.textContent = "Select a category";
    } else {
      navProgressEl.textContent = state.roundTitle;
    }
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  if (item.gameOver) {
    navProgressEl.textContent = "Complete";
    prevBtn.disabled = item.index === 0;
    nextBtn.disabled = true;
    return;
  }

  if (item.type === "riddle") {
    navProgressEl.textContent =
      "Riddle " + (item.index + 1) + " of " + item.total;
    return;
  }

  navProgressEl.textContent =
    "Question " + (item.index + 1) + " of " + item.total;
}

function formatRoundHeader(state) {
  if (
    (state.round === 1 || state.round === 2) &&
    state.categoryId &&
    state.categories
  ) {
    for (var i = 0; i < state.categories.length; i++) {
      if (state.categories[i].id === state.categoryId) {
        return state.roundTitle + " - " + state.categories[i].name;
      }
    }
  }
  return state.roundTitle;
}

function renderQuestion(state) {
  var item = state.item;
  var round = state.round;

  progressEl.textContent = formatRoundHeader(state);

  setPanel.classList.toggle("hidden", round !== 1);
  categoryPanel.classList.toggle("hidden", round !== 1 && round !== 2);
  riddlePanel.classList.toggle("hidden", round !== 4);
  moneyPanel.classList.toggle("hidden", round !== 5);
  round3Note.classList.toggle("hidden", round !== 3);

  if (round === 1) renderSetTabs(state);
  if (round === 1 || round === 2) renderCategories(state);
  if (round === 5) renderMoneyLadder(state);

  toggleDisplayBtn.textContent = state.visible ? "Hide display" : "Show display";
  toggleDisplayBtn.classList.toggle("host-toggle-active", !state.visible);

  if (!item) {
    questionPanel.classList.add("hidden");
    subNav.classList.add("hidden");
    updateNavControls(state);
    return;
  }

  questionPanel.classList.remove("hidden");

  if (item.type === "riddle") {
    questionText.textContent = "";
    questionText.classList.add("hidden");
    optionList.classList.add("hidden");
    answerText.textContent = item.answer;
    renderClueList(item);
    updateNavControls(state);
    return;
  }

  questionText.classList.remove("hidden");

  if (item.type === "money" && item.gameOver) {
    questionText.textContent =
      state.round5LastResult === "correct"
        ? "All questions answered correctly!"
        : "Round ended.";
    optionList.classList.add("hidden");
    answerText.textContent = "Final total: " + item.earnedAmount + " " + state.currency;
    round5Actions.classList.add("hidden");
    round5Reset.classList.remove("hidden");
    updateNavControls(state);
    return;
  }

  round5Reset.classList.add("hidden");

  if (item.type === "money") {
    questionText.textContent = item.question;
    optionList.innerHTML = "";
    optionList.classList.remove("hidden");
    item.options.forEach(function (opt, index) {
      var li = document.createElement("li");
      var letter = String.fromCharCode(65 + index);
      li.textContent = letter + ". " + opt;
      if (index === item.correctIndex) li.classList.add("correct-option");
      optionList.appendChild(li);
    });
    answerText.textContent = item.correctAnswer;
    round5Actions.classList.remove("hidden");
    updateNavControls(state);
    return;
  }

  optionList.classList.add("hidden");
  round5Actions.classList.add("hidden");
  questionText.textContent = item.question;
  answerText.textContent = item.answer;
  updateNavControls(state);
}

function render(state) {
  currentState = state;
  setActiveRoundTab(state.round);
  renderQuestion(state);
}

fetchRounds();

function bindHostTapFeedback() {
  var root = document.querySelector(".host-page");
  if (!root) return;

  root.addEventListener(
    "pointerdown",
    function (e) {
      var btn = e.target.closest("button");
      if (!btn || btn.disabled) return;
      btn.classList.add("host-pressed");
    },
    { passive: true }
  );

  function releaseButton(btn) {
    if (!btn || btn.disabled) return;
    btn.focus();
    window.setTimeout(function () {
      btn.classList.remove("host-pressed");
    }, 200);
  }

  root.addEventListener(
    "pointerup",
    function (e) {
      releaseButton(e.target.closest("button"));
    },
    { passive: true }
  );

  root.addEventListener(
    "pointercancel",
    function (e) {
      var btn = e.target.closest("button");
      if (btn) btn.classList.remove("host-pressed");
    },
    { passive: true }
  );
}

bindHostTapFeedback();

document.querySelector("[data-prev]").addEventListener("click", function () {
  socket.emit("quiz:prev");
});

document.querySelector("[data-next]").addEventListener("click", function () {
  socket.emit("quiz:next");
});

subTabs.querySelectorAll("[data-part]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    socket.emit("quiz:setPart", { part: btn.dataset.part });
  });
});

document.querySelector("[data-reveal-clue]").addEventListener("click", function () {
  socket.emit("quiz:revealClue");
});

document.querySelector("[data-hide-clues]").addEventListener("click", function () {
  socket.emit("quiz:hideClues");
});

document.querySelector("[data-mark-correct]").addEventListener("click", function () {
  socket.emit("quiz:round5Answer", { correct: true });
});

document.querySelector("[data-mark-wrong]").addEventListener("click", function () {
  socket.emit("quiz:round5Answer", { correct: false });
});

document.querySelector("[data-round5-reset]").addEventListener("click", function () {
  socket.emit("quiz:round5Reset");
});

toggleDisplayBtn.addEventListener("click", function () {
  if (!currentState) return;
  socket.emit("quiz:setVisible", { visible: !currentState.visible });
});

socket.on("quiz:host", render);
