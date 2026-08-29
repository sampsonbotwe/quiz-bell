const fs = require("fs");
const path = require("path");

function block(main, sub1, sub2, ansMain, ansSub1, ansSub2) {
  return {
    main,
    subs: [sub1, sub2],
    answers: { main: ansMain, subs: [ansSub1, ansSub2] },
  };
}

function category(id, name, blocks) {
  return { id, name, blocks };
}

const round2 = {
  round: 2,
  title: "Round 2 — Pick a Book",
  categories: [
    category("daniel", "Daniel", [
      block(
        "What Babylonian name was given to Daniel by the chief of the eunuchs?",
        "What simple food, along with water, did Daniel request instead of the king's rich food and wine?",
        "Who was the chief of the eunuchs in charge of Daniel and his friends?",
        "Belteshazzar",
        "Pulse/vegetables/plants",
        "Ashpenaz"
      ),
      block(
        "What metal formed the head of the great image in Nebuchadnezzar's dream?",
        "What metal, mixed with clay, formed the feet of the image?",
        "What did Nebuchadnezzar do before Daniel after hearing the dream's interpretation, showing reverence?",
        "Gold",
        "Iron",
        "Worshipped"
      ),
      block(
        "How many times hotter did Nebuchadnezzar order the furnace heated for Shadrach, Meshach, and Abednego?",
        "On what plain did Nebuchadnezzar set up his golden image?",
        "How many men did the king see walking unbound inside the fiery furnace?",
        "Seven",
        "Plain of Dura",
        "Four"
      ),
      block(
        "What kind of creature did Nebuchadnezzar's mind become like for seven years, per Daniel's interpretation?",
        "What metal, besides iron, bound the stump of the tree in Nebuchadnezzar's dream?",
        "What grew on Nebuchadnezzar's body like a bird's claws during his period of madness?",
        "Beast",
        "Brass",
        "Nails"
      ),
      block(
        "What mysteriously appeared on the wall during Belshazzar's feast?",
        "What rank, meaning roughly \"third in command,\" did Belshazzar offer Daniel for the interpretation?",
        "Which people took over Belshazzar's kingdom that very night?",
        "Writing (MENE, MENE, TEKEL, UPHARSIN)",
        "Third",
        "Medes"
      ),
    ]),
    category("esther", "Esther", [
      block(
        "In which capital city did King Ahasuerus hold his great feast for all his officials?",
        "How many days did the king's feast for all the people of Shushan last?",
        "What did Queen Vashti refuse to do when the king summoned her before his guests?",
        "Shushan",
        "Seven",
        "Refused to appear"
      ),
      block(
        "What was Esther's other, original Hebrew name?",
        "Who was the keeper of the women whose favor Esther won during her preparation?",
        "What did Mordecai uncover involving two of the king's chamberlains, which he reported through Esther?",
        "Hadassah",
        "Hegai",
        "Assassination plot"
      ),
      block(
        "What method did Haman use to choose the date for destroying the Jews?",
        "What was Haman's ethnic title, as given in the text?",
        "How many talents of silver did Haman offer the king to carry out his plan?",
        "Pur",
        "Agagite",
        "10,000"
      ),
      block(
        "What did Mordecai wear as a sign of mourning after learning of the decree against the Jews?",
        "What object did the king extend to allow someone to approach his throne unsummoned?",
        "What did Esther ask the Jews of Shushan to do for three days before she approached the king?",
        "Sackcloth",
        "Scepter",
        "Fast"
      ),
      block(
        "What did Esther prepare and invite the king and Haman to, twice, before revealing her true request?",
        "How many cubits tall was the gallows Haman had built for Mordecai?",
        "What was the name of Haman's wife, who advised him to build the gallows?",
        "Banquet",
        "Fifty",
        "Zeresh"
      ),
    ]),
    category("exodus", "Exodus", [
      block(
        "Name one of the two Hebrew midwives who refused to kill the newborn baby boys.",
        "Name one of the two store cities the Israelites were forced to build for Pharaoh.",
        "What building material, along with mortar, did the Egyptians force the Israelites to work with?",
        "Shiphrah (or Puah)",
        "Pithom (or Raamses)",
        "Brick"
      ),
      block(
        "What material was the basket made of that Moses' mother placed him in on the river?",
        "What relation to Pharaoh was the woman who found and adopted baby Moses?",
        "In which land did Moses settle and marry Zipporah after fleeing Egypt?",
        "Bulrushes",
        "Daughter",
        "Midian"
      ),
      block(
        "What was burning but not being consumed when God first appeared to Moses?",
        "What did God tell Moses to remove from his feet, since he stood on holy ground?",
        "On which mountain did Moses encounter the burning bush?",
        "Bush",
        "Shoes",
        "Horeb"
      ),
      block(
        "What did Moses' rod turn into as the first sign God gave him?",
        "What skin condition briefly affected Moses' hand as the second sign?",
        "Whom did God appoint to speak for Moses, since Moses said he was slow of speech?",
        "Serpent",
        "Leprosy",
        "Aaron"
      ),
      block(
        "What building material did Pharaoh stop supplying the Israelites, forcing them to gather it themselves?",
        "What were the Israelite officers beaten for failing to meet, once straw was withheld?",
        "What did Pharaoh call the Israelites when Moses and Aaron asked for time to worship?",
        "Straw",
        "Bricks",
        "Idle"
      ),
    ]),
    category("first-samuel", "1 Samuel", [
      block(
        "What was the name of Elkanah's barren wife who prayed fervently for a son?",
        "What was the name of Elkanah's other wife, who provoked Hannah over her childlessness?",
        "What did Eli initially mistake Hannah's silently moving lips for?",
        "Hannah",
        "Peninnah",
        "Drunk"
      ),
      block(
        "What did Hannah offer after dedicating Samuel to the Lord, exalting God's power and might?",
        "What tool did Eli's sons use to forcibly seize the best portions of sacrificial meat?",
        "What garment did the boy Samuel wear while ministering before the Lord?",
        "Song",
        "Fleshhook",
        "Ephod"
      ),
      block(
        "How many times in total did the Lord call out to young Samuel in the night?",
        "What single word did Eli instruct Samuel to say in reply to the Lord's voice?",
        "What object in the temple was described as \"not yet gone out,\" indicating it was still night?",
        "Four",
        "Speak",
        "Lamp"
      ),
      block(
        "At what location did Israel camp before their fateful battle with the Philistines?",
        "What sacred object did the Israelites bring from Shiloh, hoping it would grant them victory?",
        "What name did Phinehas' wife give her newborn son upon hearing of Israel's defeat?",
        "Ebenezer",
        "Ark",
        "Ichabod"
      ),
      block(
        "In which Philistine city did the statue of the god Dagon topple before the captured ark?",
        "What affliction did the Lord strike the Philistines with after they captured the ark?",
        "To which second Philistine city was the ark sent after Ashdod, also suffering destruction?",
        "Ashdod",
        "Emerods",
        "Gath"
      ),
    ]),
  ],
};

const outPath = path.join(__dirname, "..", "content", "round2.json");
fs.writeFileSync(outPath, JSON.stringify(round2, null, 2) + "\n");
console.log("Wrote", outPath);
round2.categories.forEach((c) => console.log(c.name + ":", c.blocks.length, "blocks"));
