const fs = require("fs");
const path = require("path");

const round4 = {
  round: 4,
  title: "Round 4 — Riddles",
  displayShowsQuestion: false,
  riddles: [
    {
      id: 1,
      answer: "Manna",
      clues: [
        "I fell like frost yet fed like bread, appearing where no field had ever been ploughed.",
        "Gather too much of me and I would rot with worms by morning's light.",
        "On the sixth day, I doubled myself so no one need break the day of rest.",
        "For forty years I sustained a wandering nation, tasting of honey wafers from heaven.",
      ],
    },
    {
      id: 2,
      answer: "Jericho",
      clues: [
        "I was a fortress older than memory, my walls a boast no army could out-shout.",
        "Seven days of silent marching wound around me like a slow-tightening rope.",
        "Trumpets, not battering rams, became the weapon that finally cracked my pride.",
        "On the seventh day, a shout brought my walls tumbling into rubble.",
      ],
    },
    {
      id: 3,
      answer: "Eden",
      clues: [
        "Four rivers once branched from my heart like veins from a single pulse.",
        "I housed two trees whose fruit carried opposite destinies — one life, one knowledge.",
        "A serpent's whisper turned my innocence into exile's first chapter.",
        "Cherubim with flaming swords now guard the gate to my lost paradise.",
      ],
    },
    {
      id: 4,
      answer: "Cross",
      clues: [
        "I was built for shame, yet I became the throne of the greatest King.",
        "Two beams met at a single point, carrying the weight of the world's sin.",
        "A crown of thorns rested above me, while nails silenced the hands that once healed.",
        "Empty tombs cannot erase what happened on this wooden hill called Calvary.",
      ],
    },
    {
      id: 5,
      answer: "Ark",
      clues: [
        "Gold-plated wood, I carried whispers of a covenant no eye was meant to see.",
        "Two golden guardians spread their wings above my lid, facing each other in eternal watch.",
        "Whoever touched me without permission met a swift and silent judgment.",
        "I held tablets of stone, a jar of bread, and a budded staff inside my chest.",
      ],
    },
    {
      id: 6,
      answer: "Babel",
      clues: [
        "I began as one voice reaching for the clouds, ambition stacked in brick and tar.",
        "My builders sought a name for themselves, fearing to be scattered like seed in the wind.",
        "One divine breath turned my single language into a thousand strangers' tongues.",
        "My unfinished tower left my name meaning \"confusion\" across a plain called Shinar.",
      ],
    },
  ],
};

const outPath = path.join(__dirname, "..", "content", "round4.json");
fs.writeFileSync(outPath, JSON.stringify(round4, null, 2) + "\n");
console.log("Wrote", outPath, "—", round4.riddles.length, "riddles");
