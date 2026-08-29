const fs = require("fs");
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "content");
const ROUND_IDS = [1, 2, 3, 4, 5];
const SET_IDS = ["A", "B", "C"];
const PARTS = ["main", "sub1", "sub2"];

function loadRounds() {
  var rounds = {};
  for (var i = 0; i < ROUND_IDS.length; i++) {
    var id = ROUND_IDS[i];
    var filePath = path.join(CONTENT_DIR, "round" + id + ".json");
    rounds[id] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  return rounds;
}

const ROUNDS = loadRounds();

const QUIZ_STATE_FILE = path.join(__dirname, ".quiz-state.json");
const PERSISTED_QUIZ_FIELDS = [
  "round",
  "set",
  "categoryId",
  "blockIndex",
  "part",
  "questionIndex",
  "riddleIndex",
  "cluesRevealed",
  "earnedAmount",
  "round5Complete",
  "round5LastResult",
  "round5LifelineUsed",
  "round5HiddenOptions",
  "visible",
];

function createQuizState() {
  return {
    round: 1,
    set: null,
    categoryId: null,
    blockIndex: 0,
    part: "main",
    questionIndex: 0,
    riddleIndex: 0,
    cluesRevealed: 0,
    earnedAmount: 0,
    round5Complete: false,
    round5LastResult: null,
    round5LifelineUsed: false,
    round5HiddenOptions: [],
    visible: true,
  };
}

function loadPersistedQuizState() {
  try {
    if (!fs.existsSync(QUIZ_STATE_FILE)) return null;
    var raw = JSON.parse(fs.readFileSync(QUIZ_STATE_FILE, "utf8"));
    var state = createQuizState();
    for (var i = 0; i < PERSISTED_QUIZ_FIELDS.length; i++) {
      var key = PERSISTED_QUIZ_FIELDS[i];
      if (raw[key] !== undefined) state[key] = raw[key];
    }
    return state;
  } catch (err) {
    console.warn("Could not load quiz state:", err.message);
    return null;
  }
}

function saveQuizState(state) {
  try {
    var payload = {};
    for (var i = 0; i < PERSISTED_QUIZ_FIELDS.length; i++) {
      var key = PERSISTED_QUIZ_FIELDS[i];
      payload[key] = state[key];
    }
    fs.writeFileSync(QUIZ_STATE_FILE, JSON.stringify(payload, null, 2));
  } catch (err) {
    console.warn("Could not save quiz state:", err.message);
  }
}

function getRound1Categories(state) {
  var round = ROUNDS[1];
  var setData = round.sets[state.set];
  return setData ? setData.categories : [];
}

function getRound2Categories() {
  return ROUNDS[2].categories;
}

function getCategoryById(state) {
  if (state.round === 1) {
    var categories = getRound1Categories(state);
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].id === state.categoryId) return categories[i];
    }
  }
  if (state.round === 2) {
    var cats = getRound2Categories();
    for (var j = 0; j < cats.length; j++) {
      if (cats[j].id === state.categoryId) return cats[j];
    }
  }
  return null;
}

function getCurrentBlock(state) {
  var category = getCategoryById(state);
  if (!category || !category.blocks || !category.blocks.length) return null;
  var blockIndex = Math.max(
    0,
    Math.min(state.blockIndex, category.blocks.length - 1)
  );
  return category.blocks[blockIndex];
}

function getBlockPartContent(block, part) {
  if (!block) return null;
  if (part === "main") {
    return {
      label: "Main question",
      question: block.main,
      answer: block.answers.main,
    };
  }
  if (part === "sub1" && block.subs && block.subs.length > 0) {
    return {
      label: "Sub 1",
      question: block.subs[0],
      answer: block.answers.subs[0],
    };
  }
  if (part === "sub2" && block.subs && block.subs.length > 1) {
    return {
      label: "Sub 2",
      question: block.subs[1],
      answer: block.answers.subs[1],
    };
  }
  return null;
}

function getRound3SetData(state) {
  if (!state.set) return null;
  var round = ROUNDS[3];
  return round.sets ? round.sets[state.set] : null;
}

function getRound3QuestionList(state) {
  var setData = getRound3SetData(state);
  return setData ? setData.questions : [];
}

function getRound5QuestionList() {
  return ROUNDS[5].question;
}

function getRound4Riddles() {
  return ROUNDS[4].riddles;
}

function getRound5Ladder() {
  return ROUNDS[5].ladder;
}

function formatCurrency(amount, currency) {
  var value = Number(amount) || 0;
  if (currency === "GHS") {
    return "GHS " + value.toFixed(2);
  }
  return value + " " + (currency || "");
}

function resolveCurrentItem(state) {
  if (state.round === 1 || state.round === 2) {
    if (!state.categoryId) return null;
    var category = getCategoryById(state);
    if (!category || !category.blocks.length) return null;

    var blockIndex = Math.max(
      0,
      Math.min(state.blockIndex, category.blocks.length - 1)
    );
    state.blockIndex = blockIndex;
    var block = category.blocks[blockIndex];
    var content = getBlockPartContent(block, state.part);
    if (!content) {
      state.part = "main";
      content = getBlockPartContent(block, "main");
    }
    if (!content) return null;

    var subCount = block.subs ? block.subs.length : 0;
    return {
      type: "block",
      round: state.round,
      categoryName: category.name,
      label: content.label,
      question: content.question,
      answer: content.answer,
      part: state.part,
      mainIndex: blockIndex,
      mainTotal: category.blocks.length,
      subCount: subCount,
      index: blockIndex,
      total: category.blocks.length,
    };
  }

  if (state.round === 3) {
    var setData = getRound3SetData(state);
    if (!setData) return null;
    var questionList = setData.questions;
    if (!questionList.length) return null;
    var qIdx = Math.max(0, Math.min(state.questionIndex, questionList.length - 1));
    var q = questionList[qIdx];
    return {
      type: "rapid",
      round: 3,
      label: setData.label,
      setLabel: setData.label,
      question: q.question,
      answer: q.answer,
      index: qIdx,
      total: questionList.length,
    };
  }

  if (state.round === 4) {
    var riddles = getRound4Riddles();
    if (!riddles.length) return null;
    var rIdx = Math.max(0, Math.min(state.riddleIndex, riddles.length - 1));
    var riddle = riddles[rIdx];
    var clues = riddle.clues;
    return {
      type: "riddle",
      round: 4,
      label: "Riddle " + (rIdx + 1),
      answer: riddle.answer,
      clues: clues,
      allClues: riddle.clues,
      cluesTotal: riddle.clues.length,
      index: rIdx,
      total: riddles.length,
    };
  }

  if (state.round === 5) {
    if (state.round5Complete) {
      return {
        type: "money",
        round: 5,
        label: "Money Round",
        gameOver: true,
        earnedAmount: state.earnedAmount,
        index: state.questionIndex,
        total: getRound5QuestionList().length,
      };
    }
    var moneyQs = getRound5QuestionList();
    if (!moneyQs.length) return null;
    var mIdx = Math.max(0, Math.min(state.questionIndex, moneyQs.length - 1));
    var mq = moneyQs[mIdx];
    return {
      type: "money",
      round: 5,
      label: "Money Round — " + formatCurrency(mq.amount, ROUNDS[5].currency),
      question: mq.question,
      options: mq.options,
      correctIndex: mq.correctIndex,
      correctAnswer: mq.correctAnswer,
      amount: mq.amount,
      step: mq.step,
      earnedAmount: state.earnedAmount,
      index: mIdx,
      total: moneyQs.length,
      gameOver: false,
    };
  }

  return null;
}

function publicDisplayPayload(state) {
  if (!state.visible) {
    return { visible: false };
  }

  if (state.round === 1 && !state.set) {
    return { visible: false };
  }

  if (state.round === 1 || state.round === 2) {
    if (!state.categoryId) {
      var categories =
        state.round === 1
          ? getRound1Categories(state).map(function (cat) {
              return { id: cat.id, name: cat.name };
            })
          : getRound2Categories().map(function (cat) {
              return { id: cat.id, name: cat.name };
            });

      return {
        visible: true,
        type: "category-picker",
        round: state.round,
        roundTitle: ROUNDS[state.round].title,
        setLabel:
          state.round === 1 ? ROUNDS[1].sets[state.set].label : null,
        categories: categories,
      };
    }
  }

  if (state.round === 3 && !state.set) {
    return { visible: false };
  }

  if (state.round === 4) {
    return { visible: false };
  }

  var item = resolveCurrentItem(state);
  if (!item) {
    return { visible: false };
  }

  var payload = {
    visible: true,
    round: state.round,
    roundTitle: ROUNDS[state.round].title,
    type: item.type,
    label: item.label,
    index: item.index,
    total: item.total,
  };

  if (item.type === "block") {
    payload.question = item.question;
    payload.categoryId = state.categoryId;
    payload.categoryName = item.categoryName;
    payload.part = item.part;
    var blockCategories =
      state.round === 1
        ? getRound1Categories(state)
        : getRound2Categories();
    for (var c = 0; c < blockCategories.length; c++) {
      if (blockCategories[c].id === state.categoryId) {
        payload.categoryColorIndex = c % 4;
        break;
      }
    }
  }

  if (item.type === "rapid") {
    payload.question = item.question;
    payload.setLabel = item.setLabel;
  }

  if (item.type === "riddle") {
    payload.clues = item.clues;
    payload.clueCount = item.clues.length;
    payload.cluesTotal = item.cluesTotal;
  }

  if (item.type === "money" && !item.gameOver) {
    payload.question = item.question;
    payload.amount = item.amount;
    payload.step = item.step;
    payload.earnedAmount = item.earnedAmount;
    payload.ladder = getRound5Ladder();
    payload.currency = ROUNDS[5].currency;
    payload.totalPool = ROUNDS[5].totalPool || 1000;
    payload.displayShowsOptions = ROUNDS[5].displayShowsOptions !== false;
    payload.lifelineUsed = state.round5LifelineUsed;
    payload.lifelineAvailable = !state.round5LifelineUsed;
    if (payload.displayShowsOptions) {
      payload.options = item.options;
      payload.hiddenOptions = state.round5HiddenOptions || [];
    }
  }

  if (item.type === "money" && item.gameOver) {
    payload.gameOver = true;
    payload.earnedAmount = state.earnedAmount;
    payload.round5LastResult = state.round5LastResult;
    payload.ladder = getRound5Ladder();
    payload.currency = ROUNDS[5].currency;
    payload.totalPool = ROUNDS[5].totalPool || 1000;
  }

  return payload;
}

function publicHostPayload(state) {
  var item = resolveCurrentItem(state);
  var roundMeta = ROUNDS[state.round];

  var payload = {
    round: state.round,
    roundTitle: roundMeta.title,
    visible: state.visible,
    item: item,
  };

  if (state.round === 1) {
    payload.set = state.set;
    payload.setLabel = state.set ? roundMeta.sets[state.set].label : null;
    payload.sets = Object.keys(roundMeta.sets).map(function (setId) {
      return { id: setId, label: roundMeta.sets[setId].label };
    });
    payload.categories = state.set
      ? getRound1Categories(state).map(function (cat) {
          return { id: cat.id, name: cat.name };
        })
      : [];
    payload.categoryId = state.categoryId;
  }

  if (state.round === 2) {
    payload.categories = getRound2Categories().map(function (cat) {
      return { id: cat.id, name: cat.name };
    });
    payload.categoryId = state.categoryId;
  }

  if (state.round === 3) {
    payload.set = state.set;
    payload.setLabel = getRound3SetData(state)
      ? getRound3SetData(state).label
      : null;
    payload.sets = Object.keys(roundMeta.sets).map(function (setId) {
      return { id: setId, label: roundMeta.sets[setId].label };
    });
    payload.timeLimitSeconds = roundMeta.timeLimitSeconds;
    payload.questionIndex = state.questionIndex;
  }

  if (state.round === 4) {
    payload.riddleIndex = state.riddleIndex;
  }

  if (state.round === 5) {
    payload.earnedAmount = state.earnedAmount;
    payload.round5Complete = state.round5Complete;
    payload.round5LastResult = state.round5LastResult;
    payload.round5LifelineUsed = state.round5LifelineUsed;
    payload.round5HiddenOptions = state.round5HiddenOptions || [];
    payload.ladder = getRound5Ladder();
    payload.currency = roundMeta.currency;
    payload.questionIndex = state.questionIndex;
  }

  payload.atRoundEnd = isAtRoundEnd(state);

  return payload;
}

function resetRoundFields(state, round) {
  state.round = round;
  state.categoryId = null;
  state.blockIndex = 0;
  state.part = "main";
  state.questionIndex = 0;
  state.riddleIndex = 0;
  state.cluesRevealed = 0;
  state.earnedAmount = 0;
  state.round5Complete = false;
  state.round5LastResult = null;
  state.round5LifelineUsed = false;
  state.round5HiddenOptions = [];
  state.visible = round !== 5;
  if (round === 1) state.set = null;
  if (round === 3) state.set = null;
}

function selectCategory(state, categoryId) {
  state.categoryId = categoryId;
  state.blockIndex = 0;
  state.part = "main";
  state.visible = true;
}

function navigatePrev(state) {
  if (state.round === 1 || state.round === 2) {
    if (!state.categoryId) return;
    var category = getCategoryById(state);
    if (!category || !category.blocks.length) return;
    state.blockIndex = Math.max(0, state.blockIndex - 1);
    state.part = "main";
    return;
  }
  if (state.round === 3) {
    if (!state.set) return;
    state.questionIndex = Math.max(0, state.questionIndex - 1);
    return;
  }
  if (state.round === 4) {
    if (state.riddleIndex > 0) {
      state.riddleIndex -= 1;
      state.cluesRevealed = 0;
    }
    return;
  }
}

function navigateNext(state) {
  if (state.round === 1 || state.round === 2) {
    if (!state.categoryId) return;
    var category = getCategoryById(state);
    if (!category || !category.blocks.length) return;
    state.blockIndex = Math.min(
      category.blocks.length - 1,
      state.blockIndex + 1
    );
    state.part = "main";
    return;
  }
  if (state.round === 3) {
    if (!state.set) return;
    var questionList = getRound3QuestionList(state);
    state.questionIndex = Math.min(questionList.length - 1, state.questionIndex + 1);
    return;
  }
  if (state.round === 4) {
    var riddles = getRound4Riddles();
    if (state.riddleIndex < riddles.length - 1) {
      state.riddleIndex += 1;
      state.cluesRevealed = 0;
    }
    return;
  }
}

function selectBlockPart(state, part) {
  if (state.round !== 1 && state.round !== 2) return;
  if (!state.categoryId) return;
  if (PARTS.indexOf(part) < 0) return;
  var block = getCurrentBlock(state);
  if (!block) return;
  if (part === "main") {
    state.part = "main";
    return;
  }
  if (part === "sub1" && block.subs && block.subs.length > 0) {
    state.part = "sub1";
    return;
  }
  if (part === "sub2" && block.subs && block.subs.length > 1) {
    state.part = "sub2";
  }
}

function nextSet(state) {
  if (state.round !== 1) return;
  var setIndex = SET_IDS.indexOf(state.set);
  if (setIndex < 0 || setIndex >= SET_IDS.length - 1) return;
  state.set = SET_IDS[setIndex + 1];
  state.categoryId = null;
  state.blockIndex = 0;
  state.part = "main";
}

function markRound5Answer(state, correct) {
  if (state.round !== 5 || state.round5Complete) return;

  var questionList = getRound5QuestionList();
  var current = questionList[state.questionIndex];
  if (!current) return;

  state.round5LastResult = correct ? "correct" : "wrong";

  if (correct) {
    state.earnedAmount += current.amount;
    state.round5HiddenOptions = [];
    if (state.questionIndex >= questionList.length - 1) {
      state.round5Complete = true;
    } else {
      state.questionIndex += 1;
    }
    return;
  }

  state.round5Complete = true;
}

function applyRound5Lifeline(state) {
  if (state.round !== 5 || state.round5Complete || state.round5LifelineUsed) {
    return false;
  }

  var questionList = getRound5QuestionList();
  var current = questionList[state.questionIndex];
  if (!current || !current.options || current.options.length < 4) return false;

  var correctIndex = current.correctIndex;
  var wrongIndices = [];
  for (var i = 0; i < current.options.length; i++) {
    if (i !== correctIndex) wrongIndices.push(i);
  }

  for (var j = wrongIndices.length - 1; j > 0; j--) {
    var k = Math.floor(Math.random() * (j + 1));
    var temp = wrongIndices[j];
    wrongIndices[j] = wrongIndices[k];
    wrongIndices[k] = temp;
  }

  state.round5HiddenOptions = wrongIndices.slice(0, 2);
  state.round5LifelineUsed = true;
  return true;
}

function hasActiveQuestion(state) {
  if (state.round === 5) return true;
  return resolveCurrentItem(state) !== null;
}

function isAtRoundEnd(state) {
  if (state.round < 1 || state.round > 4) return false;
  var item = resolveCurrentItem(state);
  if (!item || !item.total) return false;
  if (item.type === "block") {
    return item.mainIndex >= item.mainTotal - 1;
  }
  return item.index >= item.total - 1;
}

function getRoundSummaries() {
  return ROUND_IDS.map(function (id) {
    return { id: id, title: ROUNDS[id].title };
  });
}

module.exports = {
  ROUNDS: ROUNDS,
  SET_IDS: SET_IDS,
  createQuizState: createQuizState,
  loadPersistedQuizState: loadPersistedQuizState,
  saveQuizState: saveQuizState,
  publicDisplayPayload: publicDisplayPayload,
  publicHostPayload: publicHostPayload,
  resetRoundFields: resetRoundFields,
  selectCategory: selectCategory,
  navigatePrev: navigatePrev,
  navigateNext: navigateNext,
  selectBlockPart: selectBlockPart,
  nextSet: nextSet,
  markRound5Answer: markRound5Answer,
  applyRound5Lifeline: applyRound5Lifeline,
  getRoundSummaries: getRoundSummaries,
  hasActiveQuestion: hasActiveQuestion,
  isAtRoundEnd: isAtRoundEnd,
};
