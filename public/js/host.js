const socket = io();

const roundTabs = document.querySelector("[data-round-tabs]");
const setPanel = document.querySelector("[data-set-panel]");
const setPanelLabel = document.querySelector("[data-set-panel-label]");
const setTabs = document.querySelector("[data-set-tabs]");
const categoryPanel = document.querySelector("[data-category-panel]");
const categoryGrid = document.querySelector("[data-category-grid]");
const riddlePanel = document.querySelector("[data-riddle-panel]");
const clueList = document.querySelector("[data-clue-list]");
const round5Actions = document.querySelector("[data-round5-actions]");
const round5Lifeline = document.querySelector("[data-round5-lifeline]");
const round5Reset = document.querySelector("[data-round5-reset]");
const questionPanel = document.querySelector("[data-question-panel]");
const questionText = document.querySelector("[data-question-text]");
const optionList = document.querySelector("[data-option-list]");
const answerText = document.querySelector("[data-answer-text]");
const answerBox = document.querySelector(".answer-box");
const navProgressEl = document.querySelector("[data-nav-progress]");
const prevBtn = document.querySelector("[data-prev]");
const nextBtn = document.querySelector("[data-next]");
const markBlockDoneBtn = document.querySelector("[data-mark-block-done]");
const blockStatusEl = document.querySelector("[data-block-status]");
const questionCardEl = document.querySelector("[data-question-card]");
const resetRoundBtn = document.querySelector("[data-reset-round]");
const subNav = document.querySelector("[data-sub-nav]");
const subTabs = document.querySelector("[data-sub-tabs]");
const toggleDisplayBtn = document.querySelector("[data-toggle-display]");
const hostNav = document.querySelector(".host-nav");
const showRoundResultsBtn = document.querySelector("[data-show-round-results]");
const continueRoundBtn = document.querySelector("[data-continue-round]");
const wrongConfirmDialog = document.querySelector("[data-round5-wrong-dialog]");
const wrongConfirmBtn = document.querySelector("[data-round5-wrong-confirm]");

var roundsMeta = [];
var currentState = null;
var currentScoresState = null;

function updateRoundResultsControls(state) {
  if (!showRoundResultsBtn || !continueRoundBtn) return;

  var round = state.round;
  var overlay = Boolean(currentScoresState && currentScoresState.resultsOverlay);
  var showResultsBtn = round >= 1 && round <= 4 && !overlay;
  var showContinueBtn = overlay && round >= 1 && round <= 4;

  showRoundResultsBtn.classList.toggle("hidden", !showResultsBtn);
  continueRoundBtn.classList.toggle("hidden", !showContinueBtn);

  if (showContinueBtn) {
    continueRoundBtn.textContent = "Continue to Round " + (round + 1);
  }
}

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
  var setOptions = state.sets || [
    { id: "A", label: "Set A" },
    { id: "B", label: "Set B" },
    { id: "C", label: "Set C" },
  ];

  setOptions.forEach(function (set) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pill-btn";
    btn.textContent = set.label;
    btn.classList.toggle("active", state.set === set.id);
    btn.addEventListener("click", function () {
      socket.emit("quiz:setSet", { set: set.id });
    });
    setTabs.appendChild(btn);
  });
}

function renderCategories(state) {
  categoryGrid.innerHTML = "";
  if (!state.categories || !state.categories.length) {
    var empty = document.createElement("p");
    empty.className = "host-empty-categories";
    empty.textContent = "All categories in this round are complete.";
    categoryGrid.appendChild(empty);
    return;
  }

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
    var points = Math.max(0, 20 - index * 5);
    li.innerHTML =
      '<span class="clue-text">' +
      clue +
      '</span><span class="clue-points">' +
      points +
      " pts</span>";
    clueList.appendChild(li);
  });
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

function openWrongConfirm() {
  if (!wrongConfirmDialog) return;
  wrongConfirmDialog.classList.remove("hidden");
  wrongConfirmDialog.setAttribute("aria-hidden", "false");
}

function closeWrongConfirm() {
  if (!wrongConfirmDialog) return;
  wrongConfirmDialog.classList.add("hidden");
  wrongConfirmDialog.setAttribute("aria-hidden", "true");
}

function isActiveMoneyQuestion(state) {
  var item = state && state.item;
  return (
    state.round === 5 && item && item.type === "money" && !item.gameOver
  );
}

function updateLifelineControl(state) {
  if (!round5Lifeline) return;

  var item = state.item;
  var show =
    state.round === 5 && item && item.type === "money" && !item.gameOver;

  round5Lifeline.classList.toggle("hidden", !show);
  if (!show) return;

  if (state.round5LifelineUsed) {
    round5Lifeline.disabled = true;
    round5Lifeline.textContent = "50/50 used";
    return;
  }

  round5Lifeline.disabled = false;
  round5Lifeline.textContent = "50/50 — Drop two answers";
}

function renderBlockStatus(item) {
  if (!blockStatusEl) return;
  if (!item || item.type !== "block") {
    blockStatusEl.classList.add("hidden");
    blockStatusEl.innerHTML = "";
    return;
  }

  blockStatusEl.classList.remove("hidden");
  blockStatusEl.innerHTML = "";
  var answered = item.answeredBlockIndices || [];
  var compact = item.mainTotal > 6;
  if (compact) {
    blockStatusEl.classList.add("host-block-status--compact");
  } else {
    blockStatusEl.classList.remove("host-block-status--compact");
  }

  for (var i = 0; i < item.mainTotal; i++) {
    var pill = document.createElement("span");
    pill.className = "host-block-status__pill";
    pill.textContent = "Q" + (i + 1);
    if (answered.indexOf(i) >= 0) {
      pill.classList.add("host-block-status__pill--done");
    }
    if (i === item.mainIndex) {
      pill.classList.add("host-block-status__pill--current");
    }
    blockStatusEl.appendChild(pill);
  }
}

function updateQuestionCardState(item) {
  if (!questionCardEl) return;
  var isDone = Boolean(item && item.type === "block" && item.isAnswered);
  questionCardEl.classList.toggle("question-card--answered", isDone);
}

function updateNavControls(state) {
  var item = state.item;
  var isMoneyRound = state.round === 5 && item && item.type === "money";
  var isBlockRound =
    item && item.type === "block" && (state.round === 1 || state.round === 2 || state.round === 3);
  var emergencyNav = document.querySelector(".host-nav-emergency");

  if (hostNav) hostNav.classList.remove("hidden");
  if (emergencyNav) {
    emergencyNav.classList.toggle("hidden", !isBlockRound);
  }

  if (isMoneyRound) {
    subNav.classList.add("hidden");
    if (markBlockDoneBtn) markBlockDoneBtn.classList.add("hidden");
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    if (item.gameOver) {
      navProgressEl.textContent = "Complete";
    } else {
      navProgressEl.textContent =
        "Question " + (item.index + 1) + " of " + item.total;
    }
    return;
  }

  if (prevBtn) prevBtn.classList.remove("hidden");
  if (nextBtn) nextBtn.classList.remove("hidden");

  var canNavigate = Boolean(item && item.total && !item.gameOver);

  if (item && item.type === "block") {
    if (prevBtn) prevBtn.disabled = item.mainIndex === 0;
    if (nextBtn) nextBtn.disabled = item.mainIndex >= item.mainTotal - 1;
    if (markBlockDoneBtn) {
      markBlockDoneBtn.classList.toggle("hidden", item.isAnswered);
    }
    navProgressEl.textContent = item.isAnswered
      ? "Question " +
        (item.mainIndex + 1) +
        " of " +
        item.mainTotal +
        " · Done"
      : "Question " +
        (item.mainIndex + 1) +
        " of " +
        item.mainTotal +
        " · " +
        item.blocksRemaining +
        " left in category";
    updateSubControls(item);
    return;
  }

  if (markBlockDoneBtn) {
    markBlockDoneBtn.classList.add("hidden");
  }

  subNav.classList.add("hidden");
  if (prevBtn) prevBtn.disabled = !canNavigate || !item || item.index === 0;
  if (nextBtn) {
    nextBtn.disabled = !canNavigate || !item || item.index >= item.total - 1;
  }

  if (!item || !item.total) {
    if (state.round === 1 && !state.set) {
      navProgressEl.textContent = "Select a set";
    } else if (state.round === 1 || state.round === 2 || state.round === 3) {
      navProgressEl.textContent = "Select a category";
    } else if (state.round === 5) {
      navProgressEl.textContent = "Money Round";
    } else {
      navProgressEl.textContent = state.roundTitle;
    }
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  if (item.gameOver) {
    navProgressEl.textContent = "Complete";
    if (prevBtn) prevBtn.disabled = item.index === 0;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  if (item.type === "riddle") {
    navProgressEl.textContent =
      "Riddle " + (item.index + 1) + " of " + item.total;
    return;
  }

  if (item.type === "money") {
    navProgressEl.textContent =
      "Question " + (item.index + 1) + " of " + item.total;
    return;
  }

  navProgressEl.textContent =
    "Question " + (item.index + 1) + " of " + item.total;
}

function renderQuestion(state) {
  var item = state.item;
  var round = state.round;

  setPanel.classList.toggle("hidden", round !== 1);
  var showCategoryPanel =
    (round === 2) ||
    (round === 3 && !state.categoryId) ||
    (round === 1 && state.set);
  categoryPanel.classList.toggle("hidden", !showCategoryPanel);
  riddlePanel.classList.toggle("hidden", round !== 4);

  if (round === 1) renderSetTabs(state);
  if ((round === 1 && state.set) || round === 2 || (round === 3 && !state.categoryId)) {
    renderCategories(state);
  }

  toggleDisplayBtn.textContent = state.visible ? "Hide display" : "Show display";
  toggleDisplayBtn.classList.toggle("host-toggle-active", !state.visible);

  if (!item) {
    questionPanel.classList.add("hidden");
    subNav.classList.add("hidden");
    renderBlockStatus(null);
    updateQuestionCardState(null);
    if (answerBox) answerBox.classList.remove("answer-box--riddle");
    updateNavControls(state);
    return;
  }

  questionPanel.classList.remove("hidden");
  renderBlockStatus(item.type === "block" ? item : null);
  updateQuestionCardState(item.type === "block" ? item : null);
  if (answerBox) {
    answerBox.classList.toggle("answer-box--riddle", item.type === "riddle");
  }

  if (item.type === "riddle") {
    questionText.textContent = "";
    questionText.classList.add("hidden");
    optionList.classList.add("hidden");
    optionList.classList.remove("option-list--grid", "option-list--money");
    round5Actions.classList.add("hidden");
    round5Reset.classList.add("hidden");
    if (round5Lifeline) round5Lifeline.classList.add("hidden");
    answerText.textContent = item.answer;
    renderClueList(item);
    updateNavControls(state);
    return;
  }

  questionText.classList.remove("hidden");

  if (item.type === "money" && item.gameOver && round === 5) {
    questionText.textContent =
      state.round5LastResult === "correct"
        ? "All questions answered correctly!"
        : "Round ended.";
    optionList.classList.add("hidden");
    optionList.classList.remove("option-list--grid", "option-list--money");
    answerText.textContent =
      "Final total: " +
      (window.MoneyAnimate
        ? MoneyAnimate.formatMoney(item.earnedAmount, state.currency)
        : item.earnedAmount + " " + state.currency);
    round5Actions.classList.add("hidden");
    round5Reset.classList.remove("hidden");
    if (round5Lifeline) round5Lifeline.classList.add("hidden");
    updateNavControls(state);
    return;
  }

  round5Reset.classList.add("hidden");

  if (item.type === "money" && round === 5) {
    questionText.textContent = item.question;
    optionList.innerHTML = "";
    if (item.options && item.options.length) {
      optionList.classList.add("option-list--grid", "option-list--money");
      optionList.classList.remove("hidden");
      item.options.forEach(function (opt, index) {
        var li = document.createElement("li");
        var letter = String.fromCharCode(65 + index);
        var hiddenOptions = state.round5HiddenOptions || [];
        var isDropped = hiddenOptions.indexOf(index) >= 0;
        if (isDropped) {
          li.classList.add("option-dropped");
          li.textContent = letter + ". " + opt + " (dropped)";
        } else {
          li.textContent = letter + ". " + opt;
        }
        if (index === item.correctIndex) li.classList.add("correct-option");
        optionList.appendChild(li);
      });
    } else {
      optionList.classList.add("hidden");
      optionList.classList.remove("option-list--grid", "option-list--money");
    }
    answerText.textContent = item.correctAnswer;
    round5Actions.classList.remove("hidden");
    updateLifelineControl(state);
    updateNavControls(state);
    return;
  }

  optionList.classList.add("hidden");
  optionList.classList.remove("option-list--grid", "option-list--money");
  round5Actions.classList.add("hidden");
  round5Reset.classList.add("hidden");
  if (round5Lifeline) round5Lifeline.classList.add("hidden");
  questionText.textContent = item.question;
  answerText.textContent = item.answer;
  updateNavControls(state);
}

function render(state) {
  currentState = state;
  if (!isActiveMoneyQuestion(state)) {
    closeWrongConfirm();
  }
  setActiveRoundTab(state.round);
  renderQuestion(state);
  updateRoundResultsControls(state);
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

if (markBlockDoneBtn) {
  markBlockDoneBtn.addEventListener("click", function () {
    socket.emit("quiz:markBlockAnswered");
  });
}

subTabs.querySelectorAll("[data-part]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    socket.emit("quiz:setPart", { part: btn.dataset.part });
  });
});

document.querySelector("[data-mark-correct]").addEventListener("click", function () {
  if (!isActiveMoneyQuestion(currentState)) return;
  socket.emit("quiz:round5Answer", { correct: true });
});

document.querySelector("[data-mark-wrong]").addEventListener("click", function () {
  if (!isActiveMoneyQuestion(currentState)) return;
  openWrongConfirm();
});

if (wrongConfirmBtn) {
  wrongConfirmBtn.addEventListener("click", function () {
    closeWrongConfirm();
    socket.emit("quiz:round5Answer", { correct: false });
  });
}

document.querySelectorAll("[data-round5-wrong-cancel]").forEach(function (btn) {
  btn.addEventListener("click", closeWrongConfirm);
});

document.querySelector("[data-round5-reset]").addEventListener("click", function () {
  socket.emit("quiz:round5Reset");
});

if (round5Lifeline) {
  round5Lifeline.addEventListener("click", function () {
    socket.emit("quiz:round5Lifeline");
  });
}

toggleDisplayBtn.addEventListener("click", function () {
  if (!currentState) return;
  socket.emit("quiz:setVisible", { visible: !currentState.visible });
});

if (resetRoundBtn) {
  resetRoundBtn.addEventListener("click", function () {
    if (
      !window.confirm(
        "Reset this round? Categories, questions, and progress for this round will start over."
      )
    ) {
      return;
    }
    socket.emit("quiz:resetRound");
  });
}

if (showRoundResultsBtn) {
  showRoundResultsBtn.addEventListener("click", function () {
    socket.emit("scores:showResults");
  });
}

if (continueRoundBtn) {
  continueRoundBtn.addEventListener("click", function () {
    socket.emit("quiz:continueRound");
  });
}

socket.on("quiz:host", render);

socket.on("teamScores", function (payload) {
  currentScoresState = payload;
  if (currentState) updateRoundResultsControls(currentState);
});

socket.on("connect", function () {
  socket.emit("quiz:hostReady");
});
