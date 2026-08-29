const fs = require("fs");
const path = require("path");

function solo(main, ans) {
  return {
    main,
    subs: [],
    answers: { main: ans, subs: [] },
  };
}

function category(id, name, blocks) {
  return { id, name, blocks };
}

const round3 = {
  round: 3,
  title: "Round 3 — The 60-Second, 10-Question Blitz",
  timeLimitSeconds: 60,
  categories: [
    category("daniel", "Daniel", [
      solo("Which king of Judah was besieged by Nebuchadnezzar at the very start of the book?", "Jehoiakim"),
      solo("What was Meshach's original Hebrew name?", "Mishael"),
      solo("What was Abednego's original Hebrew name?", "Azariah"),
      solo("What was Shadrach's original Hebrew name?", "Hananiah"),
      solo("What title did the Babylonian official hold who oversaw Daniel's diet and training?", "Melzar"),
      solo("What sacred items did Nebuchadnezzar carry off from the temple in Jerusalem?", "Vessels (gold and silver bowls or pans)"),
      solo("What did Nebuchadnezzar threaten to turn his wise men's houses into if they failed him?", "Dunghill (heaps of rubble/stones)"),
      solo("Who was the captain of the king's guard ordered to execute the wise men?", "Arioch"),
      solo("What material, mixed with iron, formed the feet of the statue in Nebuchadnezzar's dream?", "Clay"),
      solo("What metal formed the chest and arms of the statue?", "Silver"),
      solo("What object crushed the entire statue and grew into a great mountain?", "Stone"),
      solo("What did Daniel and his three friends do together before God revealed the dream's meaning?", "Prayed"),
      solo("How tall, in cubits, was the golden image Nebuchadnezzar built in chapter 3?", "Sixty"),
      solo("What happened to the soldiers who threw Shadrach, Meshach, and Abednego into the furnace?", "Died"),
      solo("Whom did the fourth figure in the fiery furnace resemble, according to Nebuchadnezzar?", "Son of God"),
      solo("What did Daniel interpret, that saved his life and the lives of all the officials?", "Dream"),
      solo("What returned to Nebuchadnezzar at the end of his madness?", "Sanity"),
      solo("What did Nebuchadnezzar do immediately after his reason was restored, directed toward heaven?", "Blessed/Praised the Lord"),
      solo("What was the mysterious object that wrote on Belshazzar's wall made of?", "Fingers (hand)"),
      solo("Who succeeded Belshazzar as ruler of Babylon that very night?", "Darius"),
    ]),
    category("esther", "Esther", [
      solo("What was the name of the Persian king in Esther's story, husband to Vashti and later Esther?", "Ahasuerus"),
      solo("Over how many provinces did this king reign, from India to Ethiopia?", "127"),
      solo("How many days did the king's first feast, for his nobles and princes, last?", "180"),
      solo("Name one of the colors of the hangings in the palace garden during the king's feast.", "White/blue/green/purple"),
      solo("Which of the king's wise men advised deposing Queen Vashti?", "Memucan"),
      solo("What was the name of Esther's father, mentioned briefly in chapter 2?", "Abihail"),
      solo("How many months of beauty treatments did candidates undergo before appearing before the king?", "Twelve"),
      solo("In which month of the Persian calendar was Esther finally brought before the king?", "Tebeth"),
      solo("Name one of the two chamberlains whose assassination plot Mordecai uncovered.", "Bigthan (or Teresh)"),
      solo("In which month was the destruction of the Jews originally scheduled to take place?", "Adar"),
      solo("What was the name of Esther's servant who relayed messages between her and Mordecai?", "Hathach"),
      solo("Where did Mordecai sit, unable to enter because he wore sackcloth?", "Gate"),
      solo("In which court of the palace did Esther stand when she approached the king uninvited?", "Inner"),
      solo("What did the king offer Esther, up to half of, during their first banquet conversation?", "Kingdom"),
      solo("What drink is specifically mentioned as being served at Esther's banquets?", "Wine"),
      solo("What emotion filled Haman when he saw Mordecai refuse to bow at the gate?", "Indignation/rage"),
      solo("Besides his wife Zeresh, whom else did Haman call together to boast about his status?", "Friends"),
      solo("What, besides his riches, did Haman boast about regarding his family?", "Sons"),
      solo("What single-word rule did the king's decree, after deposing Vashti, establish for every household?", "Rule (master)"),
      solo("What did Esther request the people of Israel to do for her in her quest to see the king?", "Fast"),
    ]),
    category("exodus", "Exodus", [
      solo("What was the name of the second Hebrew midwife, alongside Shiphrah?", "Puah"),
      solo("How many persons total, descended from Jacob, originally came down to Egypt?", "Seventy"),
      solo("What did Pharaoh command be done with Hebrew daughters, in contrast to sons?", "Live (not to be killed)"),
      solo("What sealant, along with slime, did Moses' mother use to waterproof his basket?", "Pitch"),
      solo("What did the name \"Moses\" mean, according to Pharaoh's daughter's explanation?", "Drawn"),
      solo("What act had Moses committed the day before, which the quarreling Hebrew referenced when confronting him?", "Killed/Murder"),
      solo("How many daughters did the priest of Midian have, who came to draw water at the well?", "Seven"),
      solo("What was the name of Moses' father-in-law, priest of Midian, also called Reuel?", "Jethro"),
      solo("What was the name of Moses' firstborn son, born in Midian?", "Gershom"),
      solo("What did the name of Moses' son mean, reflecting his father's status as a foreigner?", "Stranger"),
      solo("What part of the wilderness did Moses lead his flock to before reaching Horeb?", "Backside"),
      solo("Name one of the nations God said inhabited the promised land, as listed at the burning bush.", "Canaanites"),
      solo("What food, paired with milk, described the abundance of the promised land?", "Honey"),
      solo("What sacred name did God give Himself to Moses, to be used forever as His memorial?", "Jehovah"),
      solo("What did God promise the Israelites would take, or \"spoil,\" from the Egyptians as they left?", "Jewelry/clothing"),
      solo("What animal did Moses set his wife and sons on as he journeyed back toward Egypt?", "Ass (donkey)"),
      solo("What instruction did God give to Moses to give to Pharaoh?", "Let my people go"),
      solo("What object did Zipporah use to circumcise her son at the inn?", "Stone (sharp flint)"),
      solo("What was going to happen to Moses had Zipporah not circumcised her son?", "Death"),
      solo("What did the Israelites do upon seeing Aaron's signs and hearing Moses' words in chapter 4?", "Worshipped"),
    ]),
    category("first-samuel", "1 Samuel", [
      solo("In which hill-country town did Elkanah, Samuel's father, reside?", "Ramathaim"),
      solo("What special portion did Elkanah give Hannah at the yearly sacrifice, despite her being childless?", "Double"),
      solo("What object did Hannah vow would never touch her future son's head?", "Razor"),
      solo("Where was Eli sitting when he first observed Hannah praying silently?", "Post"),
      solo("What insulting term did Hannah ask Eli not to associate her with while defending herself?", "Belial"),
      solo("Besides a bullock and wine, what other food did Hannah bring when presenting young Samuel at Shiloh?", "Flour"),
      solo("In Hannah's song of praise, what part of her body did she say was \"exalted in the LORD\"?", "Horn"),
      solo("What special garment did Hannah make each year and bring to Samuel at Shiloh?", "Coat"),
      solo("How many additional children did God bless Hannah with after she dedicated Samuel to His service?", "Five"),
      solo("What condition affected Eli's eyesight as he aged, mentioned at the start of chapter 3?", "Dim (half blind)"),
      solo("Where exactly was Samuel sleeping when the LORD first called out to him at night?", "Temple"),
      solo("Whom did Eli finally realize was calling out to young Samuel?", "The LORD"),
      solo("What did Eli demand Samuel not hide from him the next morning?", "Vision"),
      solo("What title did all Israel, from Dan to Beersheba, eventually recognize Samuel by?", "Prophet"),
      solo("About how many Israelite soldiers died in the first battle against the Philistines, before the ark was brought out?", "4,000"),
      solo("Who did the Philistines fear had appeared when they heard Israel's mighty shout as the ark entered the camp?", "A god"),
      solo("How many footmen died in Israel's second, far more disastrous battle against the Philistines?", "30,000"),
      solo("How old was Eli when he died, according to the text?", "98"),
      solo("How many years had Eli judged Israel before his death?", "Forty"),
      solo("What word describes Dagon's demise after his second fall before the ark?", "Broken (damaged/destroyed)"),
    ]),
  ],
};

const outPath = path.join(__dirname, "..", "content", "round3.json");
fs.writeFileSync(outPath, JSON.stringify(round3, null, 2) + "\n");
round3.categories.forEach((c) => console.log(c.name + ":", c.blocks.length, "questions"));
