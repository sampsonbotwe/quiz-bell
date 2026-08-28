let audioCtx = null;
let master = null;

function context() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -12;
    compressor.knee.value = 6;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.12;

    master = audioCtx.createGain();
    master.gain.value = 1.4;
    master.connect(compressor);
    compressor.connect(audioCtx.destination);
  }
  return audioCtx;
}

function dest() {
  context();
  return master;
}

function tone(opts) {
  const ctx = context();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opts.type || "sine";
  osc.frequency.setValueAtTime(opts.freq, opts.start);
  if (opts.glide) {
    osc.frequency.exponentialRampToValueAtTime(opts.glide, opts.start + (opts.glideTime || 0.08));
  }
  gain.gain.setValueAtTime(0.0001, opts.start);
  gain.gain.exponentialRampToValueAtTime(opts.peak, opts.start + (opts.attack || 0.012));
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.start + opts.decay);
  osc.connect(gain);
  gain.connect(opts.out || dest());
  osc.start(opts.start);
  osc.stop(opts.start + opts.decay + 0.05);
  return osc;
}

function fmBell(opts) {
  const ctx = context();
  const carrier = ctx.createOscillator();
  const modulator = ctx.createOscillator();
  const modGain = ctx.createGain();
  const outGain = ctx.createGain();

  carrier.type = opts.carrierType || "sine";
  modulator.type = "sine";
  carrier.frequency.setValueAtTime(opts.freq, opts.start);
  modulator.frequency.setValueAtTime(opts.freq * (opts.ratio || 2.0), opts.start);
  modGain.gain.setValueAtTime(opts.freq * (opts.index || 3), opts.start);
  modGain.gain.exponentialRampToValueAtTime(0.001, opts.start + opts.decay);

  outGain.gain.setValueAtTime(0.0001, opts.start);
  outGain.gain.exponentialRampToValueAtTime(opts.peak, opts.start + (opts.attack || 0.01));
  outGain.gain.exponentialRampToValueAtTime(0.0001, opts.start + opts.decay);

  modulator.connect(modGain);
  modGain.connect(carrier.frequency);
  carrier.connect(outGain);
  outGain.connect(opts.out || dest());
  modulator.start(opts.start);
  carrier.start(opts.start);
  modulator.stop(opts.start + opts.decay + 0.05);
  carrier.stop(opts.start + opts.decay + 0.05);
}

function strike(opts) {
  const ctx = context();
  const length = Math.floor(ctx.sampleRate * (opts.duration || 0.08));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = opts.filter || "bandpass";
  filter.frequency.setValueAtTime(opts.freq || 800, opts.start);
  filter.Q.value = opts.q || 4;
  gain.gain.setValueAtTime(opts.peak, opts.start);
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.start + (opts.duration || 0.08));
  source.connect(filter);
  filter.connect(gain);
  gain.connect(opts.out || dest());
  source.start(opts.start);
}

function sparkleChime(freq, start, out) {
  strike({ start, freq: freq * 1.4, peak: 0.7, duration: 0.04, filter: "highpass", q: 0.8, out });
  fmBell({
    start,
    freq,
    ratio: 3.01,
    index: 2.2,
    peak: 0.95,
    attack: 0.004,
    decay: 1.1,
    out,
  });
  tone({ start, type: "sine", freq: freq * 2, peak: 0.35, attack: 0.006, decay: 0.7, out });
}

function playDunamis(now) {
  const out = dest();
  [987.77, 783.99, 587.33].forEach((freq, index) => {
    sparkleChime(freq, now + index * 0.11, out);
  });
}

function playZoe(now) {
  const out = dest();
  sparkleChime(1174.66, now, out);
  sparkleChime(1174.66, now + 0.13, out);
}

function playPneuma(now) {
  const out = dest();
  [1318.51, 1760, 2349.32].forEach((freq, index) => {
    sparkleChime(freq, now + index * 0.09, out);
  });
}

window.unlockBells = async function unlockBells() {
  const ctx = context();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
};

window.playTeamBell = function playTeamBell(teamId) {
  const now = context().currentTime + 0.02;
  if (teamId === "zoe") {
    playZoe(now);
    return;
  }
  if (teamId === "pneuma") {
    playPneuma(now);
    return;
  }
  playDunamis(now);
};

window.playDeniedSound = function playDeniedSound() {
  const out = dest();
  const now = context().currentTime + 0.02;

  strike({ start: now, freq: 140, peak: 0.8, duration: 0.14, filter: "bandpass", q: 1.5, out });
  tone({ start: now, type: "square", freq: 127, peak: 0.6, attack: 0.003, decay: 1.1, out });
  tone({ start: now, type: "sawtooth", freq: 133, peak: 0.45, attack: 0.003, decay: 1.1, out });

  for (let i = 0; i < 10; i += 1) {
    const t = now + i * 0.1;
    tone({ start: t, type: "square", freq: 220, peak: 0.5, attack: 0.002, decay: 0.08, out });
    tone({ start: t, type: "square", freq: 233, peak: 0.42, attack: 0.002, decay: 0.08, out });
    tone({ start: t + 0.04, type: "sawtooth", freq: 311, peak: 0.3, attack: 0.002, decay: 0.06, out });
  }
};

window.playWrongAnswer = window.playDeniedSound;
