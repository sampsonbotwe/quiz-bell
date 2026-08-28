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

function createQuizState() {
  return {
    round: 1,
    set: "A",
    categoryId: null,
    blockIndex: 0,
    part: "main",
    questionIndex: 0,
    riddleIndex: 0,
    cluesRevealed: 0,
    earnedAmount: 0,
    round5Complete: false,
    round5LastResult: null,
    visible: true,
  };
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

function getRound3QuestionList() {
  return ROUNDS[3].question;
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
    var questionList = getRound3QuestionList();
    if (!questionList.length) return null;
    var qIdx = Math.max(0, Math.min(state.questionIndex, questionList.length - 1));
    var q = questionList[qIdx];
    return {
      type: "rapid",
      round: 3,
      label: "Rapid Fire",
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
    var clues = riddle.clues.slice(0, state.cluesRevealed);
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
      label: "Money Round — " + mq.amount + " " + ROUNDS[5].currency,
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
  }

  if (item.type === "riddle") {
    payload.clues = item.clues;
    payload.clueCount = item.clues.length;
    payload.cluesTotal = item.cluesTotal;
  }

  if (item.type === "money" && !item.gameOver) {
    payload.question = item.question;
    payload.options = item.options;
    payload.amount = item.amount;
    payload.step = item.step;
    payload.earnedAmount = item.earnedAmount;
    payload.ladder = getRound5Ladder();
    payload.currency = ROUNDS[5].currency;
  }

  if (item.type === "money" && item.gameOver) {
    payload.gameOver = true;
    payload.earnedAmount = item.earnedAmount;
    payload.ladder = getRound5Ladder();
    payload.currency = ROUNDS[5].currency;
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
    payload.setLabel = roundMeta.sets[state.set].label;
    payload.categories = getRound1Categories(state).map(function (cat) {
      return { id: cat.id, name: cat.name };
    });
    payload.categoryId = state.categoryId;
  }

  if (state.round === 2) {
    payload.categories = getRound2Categories().map(function (cat) {
      return { id: cat.id, name: cat.name };
    });
    payload.categoryId = state.categoryId;
  }

  if (state.round === 3) {
    payload.timeLimitSeconds = roundMeta.timeLimitSeconds;
    payload.questionIndex = state.questionIndex;
  }

  if (state.round === 4) {
    payload.riddleIndex = state.riddleIndex;
    payload.cluesRevealed = state.cluesRevealed;
  }

  if (state.round === 5) {
    payload.earnedAmount = state.earnedAmount;
    payload.round5Complete = state.round5Complete;
    payload.round5LastResult = state.round5LastResult;
    payload.ladder = getRound5Ladder();
    payload.currency = roundMeta.currency;
    payload.questionIndex = state.questionIndex;
  }

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
  state.visible = true;
  if (round === 1) state.set = "A";
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
  if (state.round === 5 && !state.round5Complete) {
    state.questionIndex = Math.max(0, state.questionIndex - 1);
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
    var questionList = getRound3QuestionList();
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
  if (state.round === 5 && !state.round5Complete) {
    var moneyList = getRound5QuestionList();
    state.questionIndex = Math.min(moneyList.length - 1, state.questionIndex + 1);
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

function revealClue(state) {
  if (state.round !== 4) return;
  var riddles = getRound4Riddles();
  var riddle = riddles[state.riddleIndex];
  if (!riddle) return;
  state.cluesRevealed = Math.min(riddle.clues.length, state.cluesRevealed + 1);
}

function hideAllClues(state) {
  state.cluesRevealed = 0;
}

function markRound5Answer(state, correct) {
  if (state.round !== 5 || state.round5Complete) return;

  var questionList = getRound5QuestionList();
  var current = questionList[state.questionIndex];
  if (!current) return;

  state.round5LastResult = correct ? "correct" : "wrong";

  if (correct) {
    state.earnedAmount = current.amount;
    if (state.questionIndex >= questionList.length - 1) {
      state.round5Complete = true;
    } else {
      state.questionIndex += 1;
    }
    return;
  }

  state.round5Complete = true;
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
  publicDisplayPayload: publicDisplayPayload,
  publicHostPayload: publicHostPayload,
  resetRoundFields: resetRoundFields,
  selectCategory: selectCategory,
  navigatePrev: navigatePrev,
  navigateNext: navigateNext,
  selectBlockPart: selectBlockPart,
  nextSet: nextSet,
  revealClue: revealClue,
  hideAllClues: hideAllClues,
  markRound5Answer: markRound5Answer,
  getRoundSummaries: getRoundSummaries,
};
