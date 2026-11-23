// Haunted Adventure game engine.
// This file holds the game state and the command logic.

// ---- Typewriter settings ----
// These numbers control how the text is typed on screen. They only change looks.

// Turn the typewriter effect on (true) or off (false).
const TYPEWRITER_ENABLED = true;

// Delay between two typed characters, in milliseconds.
const TYPE_DELAY_MS = 60;

// Extra pause after a full stop, comma or question mark, in milliseconds.
const PUNCTUATION_PAUSE_MS = 300;

// Pause between the end of one line and the start of the next, in milliseconds.
const LINE_PAUSE_MS = 150;

// ---- Typewriter variables ----
// These hold presentation facts only (what is being typed). Never game facts.

// True while text is being typed on screen.
let typing = false;

// The id of the pending typing timer, or null when none is waiting.
let typingTimer = null;

// The lines still waiting to be typed, after the current one.
let typingQueue = [];

// The output div of the line being typed now, or null.
let typingDiv = null;

// The full text of the line being typed now.
let typingText = "";

// ---- Sound settings ----
// These control the sound effects. They only change what the player hears.

// Master switch for all sound. Set to false to turn sound off completely.
const SOUND_ENABLED = true;

// How loud sounds are, from 0 (silent) to 1 (full volume).
const SOUND_VOLUME = 0.35;

// The shortest time allowed between two sounds, in milliseconds.
const SOUND_MIN_GAP_MS = 25;

// The key used to save the player's sound choice in the browser.
const SOUND_STORAGE_KEY = "haunted-sound";

// ---- Start sequence settings ----
// These tune the loading screen and the storm sound before the game starts.
// They only change what the player sees and hears.

// Timing: how long each part of the start sequence lasts.
const LOADING_DOT_MS = 400;           // time between dot changes after LOADING
const LOADING_PROMPT_DELAY_MS = 2000; // wait before the "press any key" prompt shows
const STORM_CUE_MS = 0;            // length of the storm before the intro (sound on)
const LOADING_SILENT_MS = 2000;       // wait before the intro when there is no storm
const LOADING_AUTOSTART_MS = 15000;   // start by itself after this long with no key
const CUE_SKIP_GUARD_MS = 800;        // keys are ignored this long after the storm starts
const CUE_FADE_OUT_MS = 200;          // fade of the effects when the storm is skipped
const CUE_SKIP_RAIN_FADE_MS = 1500;   // fade of the rain when the storm is skipped

// Word size: the LOADING word scales with the window width, within limits.
const LOADING_WORD_VW = 8;       // size as a percent of the window width
const LOADING_WORD_MIN_PX = 32;  // smallest size
const LOADING_WORD_MAX_PX = 72;  // largest size

// Storm timing: when each storm sound happens, in seconds (LOCK_GAP is in ms).
const STORM_RAIN_FADE_IN_S = 1.5;      // rain fades in over this time
const STORM_RAIN_FADE_OUT_S = 8;       // rain fades out after the intro starts
const STORM_RAIN_HOLD_MS = 9000;
const STORM_DISTANT_THUNDER_S = 2.0;   // distant thunder start
const STORM_CLOSE_THUNDER_S = 5.5;     // close thunder start
const STORM_DOOR_SLAM_S = 9.2;         // door slam start
const STORM_LOCK_CLICK_S = 11.2;        // first lock click start
const STORM_LOCK_GAP_MS = 120;         // time between the two lock clicks

// Loudness: storm sounds use SOUND_VOLUME times these numbers.
const STORM_PEAK_MAX = 1.0;            // top loudness for the storm
const CLOSE_THUNDER_FACTOR = 0.8;      // close thunder
const DISTANT_THUNDER_FACTOR = 0.4;    // distant thunder
const STORM_RAIN_FACTOR = 0.5;         // rain
const STORM_SLAM_FACTOR = 1;           // door slam (the loudest)
const STORM_CLICK_FACTOR = 0.8;        // lock clicks
const STORM_THUNDER_BOOST = 6;
const STORM_RAIN_BOOST = 1.5; 
const STORM_BURST_BOOST = 6;   

// Sound shape: pitches (Hz), lengths (seconds) and buffer size of the storm sounds.
const STORM_RAIN_LOW_HZ = 500;         // rain filter, low edge
const STORM_RAIN_HIGH_HZ = 5000;       // rain filter, high edge
const STORM_DISTANT_CUTOFF_HZ = 450;   // distant thunder rumble cutoff
const STORM_CLOSE_CUTOFF_HZ = 800;     // close thunder rumble cutoff
const STORM_DISTANT_TAIL_S = 2.0;      // distant thunder fade-out length
const STORM_CLOSE_TAIL_S = 2.6;        // close thunder fade-out length
const STORM_THUD_START_HZ = 220;       // door slam thud, start pitch
const STORM_THUD_END_HZ = 110;          // door slam thud, end pitch
const STORM_SLAM_BAND_LOW_HZ = 300;    // door slam noise burst, low edge
const STORM_SLAM_BAND_HIGH_HZ = 1500;  // door slam noise burst, high edge
const STORM_THUD_S = 0.4;              // door slam thud length
const STORM_BURST_S = 0.08;            // door slam noise burst length
const STORM_CLICK_S = 0.03;           // lock click length
const STORM_CLICK_HZ = 1800;           // lock click pitch
const STORM_NOISE_BUFFER_S = 3;        // length of the shared noise buffer

// ---- Inventory strip settings ----
// These control how the inventory strip looks. They never change the game.

// Size of one icon in pixels, a whole number from 24 to 40.
// Icons shrink on narrow screens, but never below 24.
const INVENTORY_ICON_PX = 32;

// How long the pickup flash lasts, in milliseconds (200 to 2000).
const INVENTORY_FLASH_MS = 600;

// ---- Sound variables ----
// These hold presentation facts only. Never game facts.

// True while the player has sound switched on.
let soundEnabled = SOUND_ENABLED;

// The browser audio object. It stays null until the first sound is made.
let audioCtx = null;

// The time of the last sound played. -Infinity means none yet.
let lastSoundTime = -Infinity;

// The length of the typed command the last time we checked it.
let lastInputLength = 0;

// ---- Start sequence variables ----
// Presentation only. None of these belong in gameState.

// Which part of the start sequence we are in:
// "loading", "cue", "auto" or "done" (the game is running).
let startPhase = "loading";

// The time (performance.now) of the key press that started the sequence.
let entryTime = 0;

// The ids of the pending start timers, or null when none is waiting.
let dotTimer = null;
let promptTimer = null;
let autostartTimer = null;
let handoffTimer = null;

// How many dots show after LOADING right now (0 to 3).
let dotCount = 0;

// ---- Sound engine ----
// These functions only make noise. They never read or change the game state.

// Creates the browser audio object, but only if sound is on and none exists.
function ensureAudio() {
  if (!soundEnabled || audioCtx) return;
  try {
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) return; // This browser has no Web Audio.
    audioCtx = new AudioClass();
  } catch (error) {
    audioCtx = null; // Sound just stays off.
  }
}

// Reads the saved sound choice. Returns true for "on", false for "off",
// and the SOUND_ENABLED default for anything else (or if storage fails).
function loadSoundChoice() {
  try {
    const saved = localStorage.getItem(SOUND_STORAGE_KEY);
    if (saved === "on") return true;
    if (saved === "off") return false;
  } catch (error) {
    // Storage may be blocked. Use the default.
  }
  return SOUND_ENABLED;
}

// Saves the current sound choice as "on" or "off". Ignores any failure.
function saveSoundChoice() {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? "on" : "off");
  } catch (error) {
    // Storage may be blocked. The choice just won't be remembered.
  }
}

// Shows the current sound choice on the #sound-toggle button.
function updateSoundToggle() {
  const button = document.getElementById("sound-toggle");
  if (button) {
    button.textContent = soundEnabled ? "SOUND: ON" : "SOUND: OFF";
  }
}

// Turns sound on or off, remembers the choice, and updates the button.
function setSound(on) {
  soundEnabled = !!on;
  // Muting stops the storm at once. Turning sound on does not restart it.
  if (!soundEnabled) stopStormCue(0);
  saveSoundChoice();
  updateSoundToggle();
  if (soundEnabled) ensureAudio(); // Create the audio object when turning on.
}

// Plays one short beep. Does nothing quietly if anything is not right.
function playSound(wave, pitch, seconds, baseLoudness) {
  try {
    if (!soundEnabled) return;
    // The volume must be a real number from 0 to 1.
    if (typeof SOUND_VOLUME !== "number" || !isFinite(SOUND_VOLUME) ||
        SOUND_VOLUME < 0 || SOUND_VOLUME > 1) return;
    if (!audioCtx) return;
    // Skip sounds that come too soon after the last one.
    const now = performance.now();
    if (now - lastSoundTime < SOUND_MIN_GAP_MS) return;

    // Wake the audio up if the browser paused it. Ignore any failure.
    if (audioCtx.state === "suspended") {
      try {
        const result = audioCtx.resume();
        if (result && result.catch) result.catch(function () {});
      } catch (error) {
        // Ignore.
      }
    }

    // Wire up: oscillator (the tone) -> gain (the loudness) -> speakers.
    const start = audioCtx.currentTime;
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(pitch, start);
    gain.gain.setValueAtTime(SOUND_VOLUME * baseLoudness, start);
    // Fade to nearly silent so the beep ends smoothly.
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds);
    lastSoundTime = now;
  } catch (error) {
    // Sound must never break the game.
  }
}

// Soft tick for one typed letter. Spaces stay silent.
// Pitch and loudness vary a little so it sounds less robotic.
function playTick(char) {
  if (char === " ") return;
  const pitch = 1500 * (0.9 + Math.random() * 0.2);      // 1500 Hz x 0.9 to 1.1
  const loudness = 0.25 * (0.8 + Math.random() * 0.4);   // 0.25 x 0.8 to 1.2
  playSound("triangle", pitch, 0.03, loudness);
}

// Click for a letter the player types.
function playKeyClick() {
  playSound("square", 1200, 0.05, 0.50);
}

// Softer, lower click for Backspace.
function playBackspaceClick() {
  playSound("square", 800, 0.05, 0.35);
}

// Low, loud clack when a command is sent to the game.
function playClack() {
  playSound("square", 300, 0.09, 0.80);
}

// ---- Storm engine ----
// The storm sounds build their own audio nodes. They do not use playSound.

let stormMaster = null;   // Gain node for thunder, door slam and clicks.
let stormSources = [];    // Effect sources, so they can be stopped later.
let stormNoise = null;    // Shared noise buffer, built once.
let rainSource = null;    // The looping rain source.
let rainGain = null;      // The rain's own gain node.

// Loudest allowed level for a storm sound. factor is from 0 to 1.
function stormPeak(factor) {
  return SOUND_VOLUME * STORM_PEAK_MAX * factor;
}

// Builds the shared noise buffer once. Does nothing if it already exists.
function makeNoise() {
  if (stormNoise) return;
  const length = Math.floor(audioCtx.sampleRate * STORM_NOISE_BUFFER_S);
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1; // Random value from -1 to 1.
  }
  stormNoise = buffer;
}

// Starts the looping rain at audio time t0. It goes straight to the speakers.
function startRain(t0) {
  // Looping noise source.
  rainSource = audioCtx.createBufferSource();
  rainSource.buffer = stormNoise;
  rainSource.loop = true;

  // Keep only the band that sounds like rain.
  const highPass = audioCtx.createBiquadFilter();
  highPass.type = "highpass";
  highPass.frequency.value = STORM_RAIN_LOW_HZ;
  const lowPass = audioCtx.createBiquadFilter();
  lowPass.type = "lowpass";
  lowPass.frequency.value = STORM_RAIN_HIGH_HZ;

  // Fade in from silence to the rain's peak level.
  rainGain = audioCtx.createGain();
  rainGain.gain.setValueAtTime(0, t0);
  rainGain.gain.linearRampToValueAtTime(stormPeak(STORM_RAIN_FACTOR) * STORM_RAIN_BOOST, t0 + STORM_RAIN_FADE_IN_S);

  // Not through stormMaster, so thunder fades do not touch the rain.
  rainSource.connect(highPass);
  highPass.connect(lowPass);
  lowPass.connect(rainGain);
  rainGain.connect(audioCtx.destination);
  rainSource.start(t0);
}

// Remembers an effect source so a stop can end it.
function trackSource(source) {
  stormSources.push(source);
}

// Schedules one thunder rumble at audio time "when".
// factor is 0 to 1, cutoffHz is the low-pass cutoff, tailS is the fade length.
function scheduleThunder(when, factor, cutoffHz, tailS) {
  const riseS = 0.05;    // Quick rise to the peak.
  const marginS = 0.1;   // Small extra time before the source stops.

  // Noise source from the shared buffer.
  const source = audioCtx.createBufferSource();
  source.buffer = stormNoise;

  // Low-pass filter: a lower cutoff gives a deeper rumble.
  const lowPass = audioCtx.createBiquadFilter();
  lowPass.type = "lowpass";
  lowPass.frequency.value = cutoffHz;

  // The gain comes after the filter, so the peak is always stormPeak(factor).
  // The level never goes to 0, because an exponential ramp cannot reach 0.
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.linearRampToValueAtTime(stormPeak(factor) * STORM_THUNDER_BOOST, when + riseS);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + tailS);

  source.connect(lowPass);
  lowPass.connect(gain);
  gain.connect(stormMaster);
  trackSource(source);
  source.start(when);
  source.stop(when + tailS + marginS);
}

// Schedules the door slam at audio time "when": a low thud plus a noise burst.
function scheduleDoorSlam(when) {
  const riseS = 0.01;    // Very quick rise to the peak.
  const marginS = 0.1;   // Small extra time before the sources stop.

  // Thud: a sine wave whose pitch drops.
  const osc = audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(STORM_THUD_START_HZ, when);
  osc.frequency.exponentialRampToValueAtTime(STORM_THUD_END_HZ, when + STORM_THUD_S);

  // Own gain node: quick rise, then fade (never to exactly 0).
  const thudGain = audioCtx.createGain();
  thudGain.gain.setValueAtTime(0.0001, when);
  thudGain.gain.linearRampToValueAtTime(stormPeak(STORM_SLAM_FACTOR), when + riseS);
  thudGain.gain.exponentialRampToValueAtTime(0.0001, when + STORM_THUD_S);

  osc.connect(thudGain);
  thudGain.connect(stormMaster);
  trackSource(osc);
  osc.start(when);
  osc.stop(when + STORM_THUD_S + marginS);

  // Burst: noise through a band-pass filter.
  const burst = audioCtx.createBufferSource();
  burst.buffer = stormNoise;

  // Band-pass wants a center and a Q, so work them out from the two edges.
  const center = Math.sqrt(STORM_SLAM_BAND_LOW_HZ * STORM_SLAM_BAND_HIGH_HZ);
  const bandPass = audioCtx.createBiquadFilter();
  bandPass.type = "bandpass";
  bandPass.frequency.value = center;
  bandPass.Q.value = center / (STORM_SLAM_BAND_HIGH_HZ - STORM_SLAM_BAND_LOW_HZ);

  // Gain comes after the filter, so the peak is stormPeak(STORM_SLAM_FACTOR).
  const burstGain = audioCtx.createGain();
  burstGain.gain.setValueAtTime(0.0001, when);
  burstGain.gain.linearRampToValueAtTime(stormPeak(STORM_SLAM_FACTOR) * STORM_BURST_BOOST, when + riseS);
  burstGain.gain.exponentialRampToValueAtTime(0.0001, when + STORM_BURST_S);

  burst.connect(bandPass);
  bandPass.connect(burstGain);
  burstGain.connect(stormMaster);
  trackSource(burst);
  burst.start(when);
  burst.stop(when + STORM_BURST_S + marginS);
}

// Schedules one very short lock click at audio time "when".
function scheduleLockClick(when) {
  const marginS = 0.01;  // Small extra time before the source stops.

  // Square wave gives a sharp click.
  const osc = audioCtx.createOscillator();
  osc.type = "square";
  osc.frequency.value = STORM_CLICK_HZ;

  const gain = audioCtx.createGain();
  gain.gain.value = stormPeak(STORM_CLICK_FACTOR);

  osc.connect(gain);
  gain.connect(stormMaster);
  trackSource(osc);
  osc.start(when);
  osc.stop(when + STORM_CLICK_S + marginS);
}

// Starts the whole storm: rain, two thunders, door slam and two lock clicks.
// Any failure stops the storm quietly.
function startStormCue() {
  try {
    // Same volume check as playSound.
    if (!audioCtx) return;
    if (typeof SOUND_VOLUME !== "number" || !isFinite(SOUND_VOLUME) ||
        SOUND_VOLUME < 0 || SOUND_VOLUME > 1) return;

    // Wake the audio up if needed. Ignore any failure.
    const result = audioCtx.resume();
    if (result && result.catch) result.catch(function () {});

    // Master gain for thunder, slam and clicks.
    stormMaster = audioCtx.createGain();
    stormMaster.gain.value = 1;
    stormMaster.connect(audioCtx.destination);
    makeNoise();

    // Schedule everything on the audio clock, with a small margin.
    const t0 = audioCtx.currentTime + 0.05;
    startRain(t0);
    scheduleThunder(t0 + STORM_DISTANT_THUNDER_S, DISTANT_THUNDER_FACTOR,
      STORM_DISTANT_CUTOFF_HZ, STORM_DISTANT_TAIL_S);
    scheduleThunder(t0 + STORM_CLOSE_THUNDER_S, CLOSE_THUNDER_FACTOR,
      STORM_CLOSE_CUTOFF_HZ, STORM_CLOSE_TAIL_S);
    scheduleDoorSlam(t0 + STORM_DOOR_SLAM_S);
    scheduleLockClick(t0 + STORM_LOCK_CLICK_S);
    scheduleLockClick(t0 + STORM_LOCK_CLICK_S + STORM_LOCK_GAP_MS / 1000);
  } catch (error) {
    // Something failed: clean up quietly.
    try {
      stopStormCue(0);
    } catch (innerError) {
      // Ignore.
    }
  }
}

// Fades one gain node to 0 over fadeS seconds (0 means at once).
function fadeGainToZero(gainNode, now, fadeS) {
  const param = gainNode.gain;
  const current = param.value;       // Current level, held before the ramp.
  param.cancelScheduledValues(now);
  if (fadeS > 0) {
    param.setValueAtTime(current, now);
    param.linearRampToValueAtTime(0, now + fadeS);
  } else {
    param.setValueAtTime(0, now);
  }
}

// Stops the whole storm cue. Does nothing if no storm is playing.
function stopStormCue(fadeMs) {
  if (!stormMaster && !rainSource) return;

  const now = audioCtx.currentTime;
  const fadeS = (typeof fadeMs === "number" && fadeMs > 0) ? fadeMs / 1000 : 0;

  // Fade the master gain and the rain gain.
  try {
    if (stormMaster) fadeGainToZero(stormMaster, now, fadeS);
  } catch (error) {
    // Ignore.
  }
  try {
    if (rainGain) fadeGainToZero(rainGain, now, fadeS);
  } catch (error) {
    // Ignore.
  }

  // Stop every tracked effect source, each on its own.
  for (let i = 0; i < stormSources.length; i++) {
    try {
      stormSources[i].stop(now + fadeS);
    } catch (error) {
      // Ignore.
    }
  }

  // Stop the rain source.
  try {
    if (rainSource) rainSource.stop(now + fadeS);
  } catch (error) {
    // Ignore.
  }

  // Forget everything. stormNoise stays cached.
  stormMaster = null;
  stormSources = [];
  rainSource = null;
  rainGain = null;
}

// Fades only the rain to silence, then stops it.
function fadeRain(seconds) {
  if (!rainSource || !rainGain) return;
  try {
    const source = rainSource;
    const gainNode = rainGain;
    const now = audioCtx.currentTime;
    const param = gainNode.gain;

    // Hold the current level, then ramp to 0.
    const current = param.value;
    param.cancelScheduledValues(now);
    param.setValueAtTime(current, now);
    param.linearRampToValueAtTime(0, now + seconds);

    // Reset the rain variables once it has ended (only if still the same rain).
    source.onended = function () {
      if (rainSource === source) {
        rainSource = null;
        rainGain = null;
      }
    };
    source.stop(now + seconds);
  } catch (error) {
    // Ignore.
  }
}

// Skips the storm: effects fade out quickly, the rain fades out slowly.
function skipStormCue() {
  try {
    if (audioCtx && stormMaster) {
      const now = audioCtx.currentTime;
      const fadeS = CUE_FADE_OUT_MS / 1000;

      // Fade the effects bus to 0 (the rain has its own bus).
      fadeGainToZero(stormMaster, now, fadeS);

      // Stop every tracked effect at the end of the fade.
      // Events not yet played never start.
      for (let i = 0; i < stormSources.length; i++) {
        try {
          stormSources[i].stop(now + fadeS);
        } catch (error) {
          // Ignore.
        }
      }

      // Forget the effects. The rain variables stay.
      stormMaster = null;
      stormSources = [];
    }
  } catch (error) {
    // Ignore.
  }

  // The rain fades on its own, slower than the effects.
  fadeRain(CUE_SKIP_RAIN_FADE_MS / 1000);
}

// ---- Fear constants ----
// These numbers and texts control the fear meter. Only game code uses them.

// The fear level the player starts with.
const FEAR_START = 0;

// The highest fear can go. Reaching it ends the game.
const FEAR_MAX = 100;

// Fear added by an ordinary command (like moving to a new room).
const FEAR_COST_NORMAL = 1;

// Fear added by a command while the player is in the cellar.
const FEAR_COST_CELLAR = 3;

// Extra fear added once, when the player first enters the cellar.
const FEAR_CELLAR_ENTRY = 10;

// Fear added each time the player asks for a hint.
const HINT_FEAR_COST = 5;

// Fear levels that trigger a warning message, from lowest to highest.
const FEAR_THRESHOLDS = [25, 50, 75];

// The warning shown at each threshold. Same order as FEAR_THRESHOLDS.
const THRESHOLD_LINES = [
  "The air grows colder, and the house seems to lean closer.",
  "Somewhere above you, slow footsteps stop moving.",
  "You are sure now that something is standing right behind you."
];

// The lines shown when fear reaches FEAR_MAX and the game ends.
const GAME_OVER_LINES = [
  "The Caretaker has found you. The lamp light shrinks, and the dark closes over you without a sound.",
  "Type restart to try again."
];

// The short reminder shown if the player types anything after the game is over.
const GAME_OVER_REMINDER = "The Caretaker has you. Type restart to try again.";

// The lines shown once when the player unlocks the front door and escapes.
const ESCAPE_LINES = [
  "The old key turns. The lock gives with a soft satisfying click, and the front door swings open onto cold night air.",
  "You step out without looking back, and the house falls silent behind you.",
  "You have escaped. Type restart to play again."
];

// The short reminder shown if the player types anything after escaping.
const ESCAPE_REMINDER = "You have escaped. Type restart to play again.";

// INITIAL_STATE is the starting game state: the player begins in the Hallway,
// carrying nothing, with a lamp sitting in the room.
const INITIAL_STATE = {
  currentRoomId: "hallway",
  carriedItems: [],
  // How scared the player is, from 0 to FEAR_MAX. Only game code changes it.
  fear: FEAR_START,
  // Thresholds whose warning lines were already shown, so each shows only once.
  shownThresholds: [],
  // True once fear reaches FEAR_MAX and the game has ended.
  gameOver: false,
  // True once the player has unlocked the front door and escaped.
  escaped: false,
  // True once the player has entered the Library (used by hints).
  libraryEntered: false,
  // True once the player has entered the cellar (used by hints).
  cellarEntered: false,
  // True once the player has examined the desk (used by hints).
  deskExamined: false,
  // True once the player has examined the page (used by hints).
  pageExamined: false,
  // True once the player has examined the cellar wall (used by hints).
  wallExamined: false,
  // True once the lamp has been filled with oil.
  fueled: false,
  // True once the fueled lamp has been lit.
  lit: false,
  // True once the kitchen door has been unlocked.
  kitchenDoorUnlocked: false,
  // True once the storeroom door has been unlocked.
  storeroomDoorUnlocked: false,
  // True once the desk drawer has been opened.
  drawerOpen: false,
  // True once the book has been pulled from the shelf.
  bookPulled: false,
  // The escape step the last hint was about (0 means no hint yet).
  hintStep: 0,
  // How many hints in a row were given for that step, up to 3.
  hintCount: 0,
  rooms: {
    hallway: {
      name: "Hallway",
      arrival: "You step back into the hallway. The front door has not moved, and neither has the lock. You came here for something you do not have yet.",
      arrivalWithKey: "You step into the hallway with the key cold in your fist. The front door waits, and you could swear the lock is listening.",
      description: "You stand in an old hallway of a haunted house. Dust coats the floorboards and cobwebs drape the walls. Pale moonlight leaks through the shutters. A narrow door, swollen with damp, stands shut in the side wall. A cold draught seeps from a dark archway deeper in, and behind you the front door waits, silent and shut.",
      items: ["lamp"],
      exits: { north: "library", east: "kitchen" },
      // The east door is locked until the player carries the brass key.
      locks: {
        east: {
          unlockedFact: "kitchenDoorUnlocked",
          keyItem: "brass key",
          lockedLine: "The narrow door is locked. The keyhole is small.",
          unlockLine: "The small brass key turns with a dry click, and the door swings inward."
        }
      },
      blocked: { south: "The front door is locked. It will not budge." },
      // Lies shown when fear is high. "replaces" must match the room text exactly.
      lies: [
        {
          minFear: 30,
          replaces: "behind you the front door waits, silent and shut.",
          text: "behind you the front door stands open to the night."
        }
      ],
      details: {
        door: "Solid oak, banded with iron. The lock is old and the keyhole is black. It does not move when you push.",
        archway: "A dark opening deeper in. The draught that comes through it smells of paper and old ink.",
        shutters: "Nailed shut from the inside. Whoever did it wanted something kept out, or something kept in.",
        dust: "Only your footprints, and a long smear that runs through the dust toward the archway, as if something heavy was dragged that way, many times.",
        "narrow door": "A narrow door in the side wall, its wood swollen with damp. The keyhole is small, and the door does not move when you push."
      }
    },
    library: {
      name: "Library",
      arrival: {
        hallway: "You duck under the archway. The air is colder here and smells of old paper and wet stone.",
        cellar: "You climb the steps back up. The trapdoor's cold breath follows you into the room."
      },
      description: "Shelves lean against the walls, their books swollen and rotten. A reading desk stands in the middle of the room, a moth-eaten rug beneath it. The only light comes from the way you came in.",
      items: [],
      exits: { south: "hallway" },
      // Lies shown when fear is high. "replaces" must match the room text exactly.
      lies: [
        {
          minFear: 30,
          replaces: "The only light comes from the way you came in.",
          text: "The way back is bricked up. Only bare wall remains."
        }
      ],
      details: {
        desk: "A heavy reading desk, its drawers pulled out and emptied long ago. One thing was left behind: a torn page, pinned beneath a candle stub.",
        page: "The handwriting slants and shakes. \"I turned the key myself and I cannot undo it. He took it down to the cellar and he will not give it up. Do not go below without a light. Do not trust what the house tells you once the fear takes hold. It lies. Trust only what you can hold in your hands.\"",
        book: "A thick book, dry where the others are rotten. The cover will not lie flat, as if something is wedged behind the pages.",
        shelves: "The books have rotted into blocks of grey pulp. One book feels wrong, drier and heavier than the rest.",
        rug: "A moth-eaten rug. One edge is curled back, and the boards beneath are a different colour from the rest of the floor."
      }
    },
    kitchen: {
      name: "Kitchen",
      arrival: "Stale air and old grease. Something was cooked here a very long time ago.",
      description: "A cold kitchen, its tiles cracked and its stove long dead. A drawer hangs beneath the counter, and a narrow door waits at the far end. The way back to the hallway is behind you.",
      // The lighter and rusty key are added later, when the drawer is opened.
      items: [],
      exits: { west: "hallway", north: "storeroom" },
      // The far door is locked until the player carries the rusty key.
      locks: {
        north: {
          unlockedFact: "storeroomDoorUnlocked",
          keyItem: "rusty key",
          lockedLine: "The narrow door is locked. The keyhole is crusted with rust.",
          unlockLine: "The rusty key grinds in the lock. The door opens as if it had been waiting."
        }
      },
      // Lies shown when fear is high. "replaces" must match the room text exactly.
      lies: [
        {
          minFear: 40,
          replaces: "The way back to the hallway is behind you.",
          text: "The way back to the hallway is only a wall."
        }
      ],
      details: {
        drawer: "A narrow drawer, shut tight. Something inside shifts when you touch it.",
        stove: "Cold iron, black with old soot. Nothing has burned here in years."
      }
    },
    storeroom: {
      name: "Storeroom",
      arrival: "The storeroom is narrow and still. Your footsteps sound like someone else's.",
      description: "Shelves of empty jars line a narrow room that smells of tin and damp. The only way out is the way you came.",
      // The oil can lies here from the start.
      items: ["oil can"],
      exits: { south: "kitchen" },
      details: {
        jars: "Rows of empty jars, each one wiped clean on the inside."
      }
    },
    cellar: {
      name: "Cellar",
      arrival: "You go down the steps one at a time. The lamp throws a small, shaking circle of light, and the dark presses in at its edge.",
      description: "Damp stone walls sweat in the lamplight. The floor is packed earth, and the steps behind you lead back up. Something has been scratched into the wall, over and over.",
      items: [],
      exits: { up: "library" },
      needsLight: true,
      // Lies shown when fear is high. "replaces" must match the room text exactly.
      lies: [
        {
          minFear: 30,
          replaces: "the steps behind you lead back up.",
          text: "the steps behind you have collapsed."
        },
        {
          minFear: 45,
          // This "replaces" text is a copy of ITEM_TEXT.key. ITEM_TEXT is defined
          // after INITIAL_STATE, so it is copied here. Edit both together.
          replaces: "In the hollow, an old iron key lies in the dust, dull and cold, as if it has waited a long time.",
          text: "The key is already in your hand, cold against your palm.",
          // The lie switches off once the player really carries the key.
          unlessCarried: "key"
        }
      ],
      details: {
        wall: "The same words, scratched again and again until the stone is raw: DO NOT ANSWER HIM. Beneath them, one stone sits crooked in the wall.",
        stone: "A square stone, set a little out of line with the rest. Its edges are worn, as if hands have gripped it before."
      }
    }
  }
};

// INTRO is the opening story. Each string is one line on the screen.
const INTRO = [
  "The storm had been chasing you for miles when you found the house,",
  "the door stood open, so you stepped inside to wait out the rain,",
  "then it slammed shut behind you, and the lock turned on its own,",
  "somewhere above you, something begins to walk...",
  "(Type 'help' if you lose your way, or 'hint' if you are confused)"
];

const DIRECTIONS = ["north", "south", "east", "west", "up", "down"];

// ITEM_TEXT is what the player sees when an item is lying in a room.
// An item with no entry here gets a plain "There is a ... here." line.
const ITEM_TEXT = {
  lamp:"Something brass glints in the dust by your feet, an old oil lamp on its side, dropped by someone in a hurry.",
  key: "In the hollow, an old iron key lies in the dust, dull and cold, as if it has waited a long time.",
  "brass key": "Behind the book, a small brass key lies in the dust, bright as if freshly polished.",
  "rusty key": "A rusty key lies at the bottom of the drawer, its teeth gnawed by damp.",
  lighter: "A brass lighter lies in the drawer, worn smooth by many thumbs.",
  "oil can": "A dented oil can sits among the jars, its spout crusted with dust."
};

// ITEM_DETAILS is what the player sees when examining an item.
// (The lamp text is not here. It comes from LAMP_TEXT and getLampText below.)
const ITEM_DETAILS = {
  key: "An old iron key, heavy and cold, its teeth worn smooth. Rust has eaten the edges, but it looks as if it would still turn.",
  "brass key": "A small brass key, oddly clean. It feels warm for a moment, then cold.",
  "rusty key": "A small key, orange with rust. It looks as if it fits something close by.",
  lighter: "A battered lighter, cold to the touch. The flint wheel still spins.",
  "oil can": "A tin can with a long spout. Something still sloshes inside."
};

// LAMP_TEXT is the lamp's examine text. It depends only on the lamp facts.
const LAMP_TEXT = {
  empty: "An old oil lamp, heavy and dry. The glass is cracked, and the tank is empty.",
  fueled: "An old oil lamp, its tank full of oil. The wick is dark and waiting.",
  lit: "An old oil lamp, burning with a small steady flame. Your shadow stands very still beside you."
};

// getLampText picks the lamp text. It reads only state.lit and state.fueled.
function getLampText(state) {
  if (state.lit) return LAMP_TEXT.lit;
  if (state.fueled) return LAMP_TEXT.fueled;
  return LAMP_TEXT.empty;
}

// HINT_TEXT holds the hints. HINT_TEXT[step - 1][level - 1] is one line.
// Level 1 is vague. Level 3 points at the object or place.
const HINT_TEXT = [
  // Step 1: take the lamp
  [
    "The dark will not forgive you for walking into it empty-handed.",
    "Something brass lies near your feet, made to carry a flame.",
    "The old oil lamp lies in this hallway. Pick it up before you go further."
  ],
  // Step 2: go north to the Library
  [
    "The cold draught has a direction. Follow the smell of paper.",
    "The dark archway breathes from deeper in the house.",
    "The archway leads north, into the Library."
  ],
  // Step 3: examine the desk and read the torn page
  [
    "Someone left words behind. Words are worth reading.",
    "Look closely at what stands in the middle of the Library.",
    "The reading desk holds a torn page. Study the desk, then the page."
  ],
  // Step 4: open the odd book and take the brass key
  [
    "Not everything on these shelves has rotted the same way.",
    "One book is drier and heavier than the rest. Something is wedged behind it.",
    "Pull the odd book from the Library shelf, then lift the small brass key from behind it."
  ],
  // Step 5: unlock the kitchen door and go in
  [
    "A small keyhole has waited in the Hallway all this time.",
    "The narrow door in the Hallway's side wall fits the key you found.",
    "Turn the brass key in the narrow Hallway door, then step through into the Kitchen."
  ],
  // Step 6: open the kitchen drawer, then take the lighter and the rusty key
  [
    "Something in this room is kept shut.",
    "A drawer hangs beneath the counter, and something inside it shifts.",
    "Look inside the Kitchen drawer, then carry off the lighter and the rusty key."
  ],
  // Step 7: unlock the storeroom door, go in and take the oil can
  [
    "Another door waits at the far end, its keyhole crusted with rust.",
    "The rusty key fits the far door of the Kitchen. Beyond it, tin glints among jars.",
    "Turn the rusty key in the far Kitchen door, step into the Storeroom and carry off the oil can."
  ],
  // Step 8: fill the lamp
  [
    "A lamp that is dry will not burn.",
    "You carry something that holds oil, and something else that wants it.",
    "Pour the oil from the can into the lamp."
  ],
  // Step 9: light the lamp
  [
    "Oil alone is not a flame.",
    "The lamp is full now. Something in your pocket can wake the wick.",
    "Use the lighter on the wick until the flame holds."
  ],
  // Step 10: pull the rug aside
  [
    "The floor remembers where something heavy has been moved.",
    "One edge of the floor covering curls away from the boards.",
    "The moth-eaten rug in the Library hides something. Drag it aside."
  ],
  // Step 11: go down to the cellar
  [
    "The cold that rises here comes from below.",
    "Something gapes in the floor now, and the air through it smells of earth.",
    "The trapdoor in the Library leads down to the Cellar. Bring your light."
  ],
  // Step 12: examine the wall
  [
    "Something in this room has been said many times.",
    "The walls here are not as blank as they first seem.",
    "Scratched words cover the Cellar wall. Study them closely."
  ],
  // Step 13: pull the crooked stone
  [
    "One thing here sits out of line with the rest.",
    "Worn edges show that hands have gripped it before.",
    "The crooked stone in the Cellar wall will move if you pull it."
  ],
  // Step 14: take the iron key
  [
    "What the house hid is waiting where the stone used to be.",
    "Something cold and made of iron lies in the hollow.",
    "The old iron key is in the hollow in the Cellar wall. Pick it up."
  ],
  // Step 15: go back up to the hallway and unlock the front door
  [
    "You have what you came for. Now return to where you started.",
    "The way out has not moved, and neither has its lock.",
    "Climb back up to the Hallway. The iron key was made for the front door."
  ]
];
// gameState holds the current state as the player plays.
// It starts empty here; init() sets it to INITIAL_STATE when the page loads.
let gameState;

// normalizeCommand cleans up what the player typed so commands match
// no matter the letter case or extra spaces around them. It trims
// whitespace and lowercases the text. If the player typed only spaces
// (or nothing), it returns "" (an empty string).
function normalizeCommand(rawInput) {
  let text = rawInput.trim().toLowerCase();

  // Remove filler words, so "take the lamp" becomes "take lamp".
  text = text.replace(/\b(the|a|an)\b/g, " ");

  // Squash repeated spaces into one, then trim the ends again.
  text = text.replace(/\s+/g, " ").trim();

  // Turn a leading "get", "grab" or "pick up" into "take".
  // A lone "get" becomes "take", so "Take what?" still works.
  text = text.replace(/^(get|grab|pick up|carry off|carry)(\s+|$)/, "take ").trim();

  // "go to kitchen" and "enter kitchen" both become "go kitchen".
  text = text.replace(/^(go to|go into|enter)\s+/, "go ").trim();

  // Drop trailing place words, so "take key from book" becomes "take key".
  // Only for action verbs, so "look in drawer" and "examine" keep their words.
  text = text.replace(/^(take|lift|pull|open|push|move|drag|fill|light|use|unlock|pour|turn)(\s.*?)\s+(from|off|out of|behind|inside|in|on|into|onto|with|using)\s+.*$/, "$1$2");

  // Other ways of saying a command, mapped to the standard one.
  const synonyms = {
    "north": "go north",
    "n": "go north",
    "move north": "go north",
    "walk north": "go north",
    "pick up lamp": "take lamp",
    "get lamp": "take lamp",
    "grab lamp": "take lamp",
    "look around": "look",
    "l": "look",
    "inv": "inventory",
    "i": "inventory",
    "south": "go south", "s": "go south",
    "east": "go east", "e": "go east",
    "west": "go west", "w": "go west",
    "up": "go up", "down": "go down",
    "climb down": "go down", "descend": "go down", "climb up": "go up",
    "open trapdoor": "go down",
    "move stone": "pull stone", "push stone": "pull stone", "pry stone": "pull stone",
    "use key": "unlock door", "open door": "unlock door",
    "get key": "take key", "grab key": "take key", "pick up key": "take key",
    // Lamp, drawer and book phrases (get/grab/pick up become take first).
    "refuel lamp": "fill lamp", "fuel lamp": "fill lamp",
    "search drawer": "open drawer", "pull drawer": "open drawer",
    "pull book": "open book", "take book": "open book", "read book": "open book",
    // Ways of asking for a hint.
    "hint": "hint",
    "hints": "hint",
    "help me": "hint",
    // Words the hints use, so following a hint always works.
    "pour oil": "fill lamp", "pour oil into lamp": "fill lamp", "pour oil in lamp": "fill lamp",
    "use oil can": "fill lamp", "use oil": "fill lamp",
    "use lighter": "light lamp", "use lighter on lamp": "light lamp",
    "light wick": "light lamp", "ignite lamp": "light lamp",
    "turn key": "unlock door", "turn brass key": "unlock door", "turn rusty key": "unlock door",
    "use brass key": "unlock door", "use rusty key": "unlock door",
    "unlock narrow door": "unlock door", "unlock far door": "unlock door",
    "open narrow door": "unlock door", "open far door": "unlock door",
    "look in drawer": "open drawer", "look inside drawer": "open drawer",
    "open odd book": "open book", "pull odd book": "open book",
    "lift key": "take key", "lift brass key": "take brass key",
    "lift small brass key": "take small brass key",
  };

  // Use the standard command if the text is in the list, else keep it.
  return Object.hasOwn(synonyms, text) ? synonyms[text] : text;
}

// renderOutput shows game text on the page. It takes a list of text
// lines (an array of strings) and adds each one as a new line inside
// the #output box. If the list is empty, nothing is added.
function renderOutput(lines) {
  const output = document.getElementById("output");
  for (const line of lines) {
    const lineDiv = document.createElement("div");
    lineDiv.textContent = line;
    output.insertBefore(lineDiv, document.getElementById("command-form"));
  }
  scrollToPrompt();
}

// scrollToPrompt scrolls the output box (not the whole page)
// so the prompt sits mid-screen.
function scrollToPrompt() {
  const output = document.getElementById("output");
  const form = document.getElementById("command-form");
  output.scrollTop = form.offsetTop - output.clientHeight / 2;
}

// typewriterActive says whether text should be typed out right now.
// It returns false when the effect is off, the player prefers reduced
// motion, or a delay setting is not a number from 0 to 5000.
function typewriterActive() {
  // Switched off in the settings.
  if (!TYPEWRITER_ENABLED) {
    return false;
  }
  // Reduced motion is read on every call, so a changed setting counts.
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  // Every delay must be a finite number from 0 to 5000.
  const delays = [TYPE_DELAY_MS, PUNCTUATION_PAUSE_MS, LINE_PAUSE_MS];
  for (const d of delays) {
    if (typeof d !== "number" || !Number.isFinite(d) || d < 0 || d > 5000) {
      return false;
    }
  }
  return true;
}

// scrollWhileTyping keeps the line being typed in view, near mid-screen.
// It never scrolls above the top of the output box.
function scrollWhileTyping() {
  const output = document.getElementById("output");
  output.scrollTop = Math.max(0, typingDiv.offsetTop + typingDiv.offsetHeight - output.clientHeight / 2);
}

// typeNextLine takes the next line from the queue. Blank lines appear at
// once. A text line gets an empty div, then typeChar fills it in.
function typeNextLine() {
  const output = document.getElementById("output");
  const form = document.getElementById("command-form");
  while (typingQueue.length > 0) {
    const line = typingQueue.shift();
    const lineDiv = document.createElement("div");
    // Same way renderOutput builds a line.
    output.insertBefore(lineDiv, form);
    if (line.trim() === "") {
      // Blank line: show it now, no delay, and go on to the next one.
      lineDiv.textContent = line;
      continue;
    }
    typingDiv = lineDiv;
    typingText = line;
    typeChar(0);
    return;
  }
  // Nothing left to type.
  endTyping();
}

// typeChar shows the first i + 1 characters of the current line, then
// waits and schedules the next step.
function typeChar(i) {
  typingDiv.textContent = typingText.slice(0, i + 1);
  // Play a soft tick for the letter that just appeared (spaces stay silent).
  playTick(typingText.charAt(i));
  scrollWhileTyping();
  const isLast = (i === typingText.length - 1);
  if (!isLast) {
    // Punctuation gets a longer pause than other characters.
    const pause = ".,?".includes(typingText.charAt(i)) ? PUNCTUATION_PAUSE_MS : TYPE_DELAY_MS;
    typingTimer = setTimeout(() => typeChar(i + 1), pause);
  } else if (typingQueue.length > 0) {
    // Line done and more follow: pause, then start the next one.
    typingTimer = setTimeout(typeNextLine, LINE_PAUSE_MS);
  } else {
    // Last character of the last line: show the prompt at once.
    typingTimer = null;
    endTyping();
  }
}

// showTyped draws what the player has typed, with the underscore cursor
// under the character at the caret, so the arrow keys show where you are.
function showTyped() {
  const input = document.getElementById("command-input");
  const text = input.value;
  const pos = input.selectionStart;
  document.getElementById("typed").textContent = text.slice(0, pos);
  document.getElementById("cursor").textContent = text.charAt(pos) || "\u00A0";
  document.getElementById("typed-after").textContent = text.slice(pos + 1);
  // Remember the length, so the next key sound knows if text grew or shrank.
  lastInputLength = input.value.length;
}

// endTyping finishes a typing session: shows the prompt again, clears
// anything typed meanwhile, and puts the caret back in the input.
function endTyping() {
  typing = false;
  const input = document.getElementById("command-input");
  document.getElementById("command-form").classList.remove("typing");
  input.value = "";
  showTyped();
  if (document.activeElement !== input) {
    input.focus();
  }
  scrollToPrompt();
}

// skipTyping shows all the remaining text at once and ends typing.
// It changes only what is on screen, never the game state.
function skipTyping() {
  // Stop the pending timer.
  clearTimeout(typingTimer);
  typingTimer = null;
  // Finish the line being typed.
  if (typingDiv) {
    typingDiv.textContent = typingText;
  }
  // Show every queued line now, and empty the queue.
  const rest = typingQueue;
  typingQueue = [];
  renderOutput(rest);
  endTyping();
}

// startTyping begins typing a list of lines on screen.
function startTyping(lines) {
  typing = true;
  // Hide the prompt while text is being typed.
  document.getElementById("command-form").classList.add("typing");
  // Copy the lines so the caller's array is not changed.
  typingQueue = [...lines];
  typeNextLine();
}

// showLines types the lines when the effect is on and some line has
// text. Otherwise it shows them at once.
function showLines(lines) {
  if (!typewriterActive() || !lines.some((line) => line.trim() !== "")) {
    renderOutput(lines);
  } else {
    startTyping(lines);
  }
}

// These keys alone do not start the sequence.
const START_IGNORED_KEYS = [
  "Shift", "Control", "Alt", "AltGraph", "Meta", "OS", "CapsLock", "NumLock",
  "ScrollLock", "Fn", "FnLock", "Hyper", "Super", "Symbol", "SymbolLock",
  "Tab", "Escape"
];

// handleStartInput reacts to a key or click during the start sequence.
function handleStartInput(event) {
  // Once the game runs, do nothing.
  if (startPhase === "done") return;
  // Leave the sound button alone.
  if (event.target && event.target.closest && event.target.closest("#sound-toggle")) return;
  if (event.type === "keydown") {
    // Leave browser shortcuts, held keys, modifiers, Tab, Escape and F1-F12 alone.
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.repeat) return;
    if (START_IGNORED_KEYS.includes(event.key)) return;
    if (/^F([1-9]|1[0-2])$/.test(event.key)) return;
  }
  // Any other key or click is used up here, so the page does not see it.
  event.preventDefault();
  event.stopPropagation();
  if (startPhase === "loading") {
    enterStart();         // first press: start the storm cue
  } else if (startPhase === "cue") {
    // Skip only after the guard time, so a double press does not skip.
    if (performance.now() - entryTime >= CUE_SKIP_GUARD_MS) beginIntro(true);
  }
  // In "auto" nothing happens: the intro starts by itself.
}

// updateDots cycles the dots after LOADING: 0, 1, 2, 3, then back to 0.
function updateDots() {
  dotCount = (dotCount + 1) % 4;
  document.getElementById("loading-dots").textContent = ".".repeat(dotCount);
}

// Shows or hides the "press any key" lines. If the page does not have them,
// it quietly does nothing, so a missing element can never freeze the start.
function setLoadingPromptVisible(visible) {
  for (const id of ["loading-prompt", "loading-hint"]) {
    const element = document.getElementById(id);
    if (element) element.classList.toggle("loading-hidden", !visible);
  }
}

// showLoadingPrompt reveals the "press any key" prompt and hint.
function showLoadingPrompt() {
  // Too late if the sequence already moved on.
  if (startPhase !== "loading") return;
  document.getElementById("loading-prompt").classList.remove("loading-hidden");
  document.getElementById("loading-hint").classList.remove("loading-hidden");
}

// startLoading starts the loading screen: word size, dots and prompt timer.
function startLoading() {
  // The word scales with the window width, within the min and max sizes.
  // The word AND the dots scale together, so the size goes on the whole title.
  const title = document.getElementById("loading-title") || document.getElementById("loading-word");
  if (title) {
    title.style.fontSize =
      "clamp(" + LOADING_WORD_MIN_PX + "px, " + LOADING_WORD_VW + "vw, " + LOADING_WORD_MAX_PX + "px)";
  }

  // Reduced motion: static dots. Otherwise the dots move.
  const dots = document.getElementById("loading-dots");
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    dots.textContent = "...";
  } else {
    dotCount = 0;
    dots.textContent = "";
    dotTimer = setInterval(updateDots, LOADING_DOT_MS);
  }

  // The prompt shows after a short wait. With no key, the game starts by itself.
  promptTimer = setTimeout(showLoadingPrompt, LOADING_PROMPT_DELAY_MS);
  autostartTimer = setTimeout(startAuto, LOADING_AUTOSTART_MS);
}

// startAuto starts the game with no key press: silent, no storm, no audio.
function startAuto() {
  // Too late if a key already started the sequence.
  if (startPhase !== "loading") return;
  startPhase = "auto";

  // Hide the prompt and hint. Sound settings are left untouched.
  clearTimeout(promptTimer);
  promptTimer = null;
  document.getElementById("loading-prompt").classList.add("loading-hidden");
  document.getElementById("loading-hint").classList.add("loading-hidden");

  // Short silent wait, then the intro.
  handoffTimer = setTimeout(function () { beginIntro(false); }, LOADING_SILENT_MS);
}

// enterStart handles the first key press or tap. Sound starts FIRST, so
// nothing on the page can stop it. The intro follows at once.
function enterStart() {
  startPhase = "cue";
  entryTime = performance.now();

  // This press allows sound. Start the storm right away.
  ensureAudio();
  if (soundEnabled) startStormCue();

  // Hand over to the intro at once. The storm keeps playing under the text.
  handoffTimer = setTimeout(function () { beginIntro(false); }, STORM_CUE_MS);

  // The autostart is no longer needed, and the prompt is hidden.
  clearTimeout(promptTimer);
  promptTimer = null;
  clearTimeout(autostartTimer);
  autostartTimer = null;
  setLoadingPromptVisible(false);
}

// beginIntro ends the loading screen and types the intro. It runs once.
function beginIntro(skipped) {
  // A skip and a timer may fire together: only the first one counts.
  if (startPhase !== "cue" && startPhase !== "auto") return;
  startPhase = "done";

  clearTimeout(promptTimer);
  promptTimer = null;
  clearTimeout(autostartTimer);
  autostartTimer = null;
  clearTimeout(handoffTimer);
  handoffTimer = null;
  clearInterval(dotTimer);
  dotTimer = null;

  // Show the game screen FIRST, so nothing below can leave the screen stuck.
  document.body.classList.remove("starting");

  // Skipped: cut the storm short. Otherwise the rain plays under the intro
  // for a while, then fades out. (Does nothing when no storm is playing.)
  if (skipped) skipStormCue();
  else setTimeout(function () { fadeRain(STORM_RAIN_FADE_OUT_S); }, STORM_RAIN_HOLD_MS);

  document.getElementById("command-input").value = "";
  showTyped();
  showLines([...INTRO, "\u00A0", ...handleLook(INITIAL_STATE).lines, "\u00A0"]);
  document.getElementById("command-input").focus();
}

// handleUnknown is used when the player types something that is not a
// known command. It returns a "not recognized" message and gives back the
// exact same state, so nothing in the game changes.
// (Requirements 8.1, 8.2, 9.4)
function handleUnknown(state) {
  // unknown: true tells the fear code that this command costs no fear.
  return { state, lines: ["That command is not recognized."], unknown: true };
}

// applyLies swaps true sentences for false ones when fear is high.
// It only returns text. It never changes the game state.
function applyLies(room, text, fear, carriedItems) {
  // No lies list (or not a list): show the true text.
  if (!Array.isArray(room.lies)) {
    return text;
  }

  // For each true sentence, remember the active lie with the highest minFear.
  const best = {};
  for (const lie of room.lies) {
    // Ignore a lie with a missing or wrong field.
    const valid = lie &&
      Number.isInteger(lie.minFear) &&
      typeof lie.replaces === "string" && lie.replaces !== "" &&
      typeof lie.text === "string" && lie.text !== "";
    if (!valid) continue;

    // Skip a lie that is not active yet, or is switched off by an item.
    if (fear < lie.minFear) continue;
    if (lie.unlessCarried && carriedItems.includes(lie.unlessCarried)) continue;

    const current = best[lie.replaces];
    if (!current || lie.minFear > current.minFear) {
      best[lie.replaces] = lie;
    }
  }

  // Replace each true sentence found in the text with its false one.
  let result = text;
  for (const replaces in best) {
    result = result.split(replaces).join(best[replaces].text);
  }
  return result;
}

// handleLook shows the current room's description and lists any items
// present in that room. It does not change the game state, so the same
// state reference is returned. (Requirement 4.1)
// The text goes through applyLies, which may swap in a false sentence.
// handleLook runs before applyFear, so it sees the fear from before
// this command's cost is added.
function handleLook(state) {
  const room = state.rooms[state.currentRoomId];
  const lines = [applyLies(room, room.description, state.fear, state.carriedItems)];
  // Mention each item present in the room so the player can see it.
  for (const item of room.items) {
    const itemText = ITEM_TEXT[item] || "There is a " + item + " here.";
    lines.push(applyLies(room, itemText, state.fear, state.carriedItems));
  }
  return { state, lines };
}

// handleGoNorth is used when the player tries to move north. There is no
// room to the north, so it returns a "cannot move" message and gives back
// the exact same state, so the player stays in the current room.
// (Requirements 5.1, 5.2)
// handleGo moves the player through an exit of the current room.
// If there is an exit that way, it builds a new state with the new room
// and describes it. A blocked way (like a locked door) gets its own message.
function handleGo(state, direction) {
  const room = state.rooms[state.currentRoomId];
  const nextRoomId = room.exits && room.exits[direction];

  if (nextRoomId) {
    const nextRoom = state.rooms[nextRoomId];

    // A locked exit: check the lock before the light rule.
    // Once its fact is true, the key is never checked again.
    const lock = room.locks && room.locks[direction];
    let unlockLine = null;
    let unlockFact = null;
    if (lock && !state[lock.unlockedFact]) {
      // No key: refuse and keep the same state.
      if (!state.carriedItems.includes(lock.keyItem)) {
        return { state, lines: [lock.lockedLine] };
      }
      // Key carried: remember the door is open and show the unlock line first.
      unlockFact = lock.unlockedFact;
      unlockLine = lock.unlockLine;
    }

    // A dark room cannot be entered without the lamp.
    if (nextRoom.needsLight && !state.carriedItems.includes("lamp")) {
      return { state, lines: ["It is pitch black that way. You cannot make yourself step into it without a light."] };
    }

    // Lamp carried but not lit: still too dark. Same state, no applyLies.
    if (nextRoom.needsLight && !state.lit) {
      return { state, lines: ["The lamp gives no light. You cannot go down into that dark."] };
    }

    // Move there: show the arrival line first, then the room itself.
    const newState = { ...state, currentRoomId: nextRoomId };
    // Set the door fact on the new state (the old state is not changed).
    if (unlockFact) newState[unlockFact] = true;
    // Remember first visits for the hint command (facts only, no text change).
    if (nextRoomId === "library") newState.libraryEntered = true;
    if (nextRoomId === "cellar") newState.cellarEntered = true;
    const lines = [];
    // The unlock line comes first. It is an action result, so no applyLies.
    if (unlockLine) lines.push(unlockLine, "\u00A0");

    // An arrival can be one text, or a set of texts depending on where you came from.
    let arrival = nextRoom.arrival;
    if (arrival && typeof arrival === "object") {
      arrival = arrival[state.currentRoomId];
    }

    // If the player carries the key, the hallway greets them differently.
    if (nextRoom.arrivalWithKey && state.carriedItems.includes("key")) {
      arrival = nextRoom.arrivalWithKey;
    }

    if (arrival) {
      // applyLies may swap in a false sentence when fear is high (text only).
      lines.push(applyLies(nextRoom, arrival, state.fear, state.carriedItems), "\u00A0");
    }
    lines.push(...handleLook(newState).lines);
    return { state: newState, lines };
  }

  // A blocked way has its own message.
  if (room.blocked && room.blocked[direction]) {
    return { state, lines: [room.blocked[direction]] };
  }

  return { state, lines: ["You cannot move " + direction + "."] };
}

// handleInventory lists the items the player is carrying. If the player
// has no items, it says they carry nothing. It does not change the game
// state, so the same state reference is returned.
// (Requirements 7.1, 7.2, 9.3)
function handleInventory(state) {
  // No items carried: tell the player they carry nothing.
  if (state.carriedItems.length === 0) {
    return { state, lines: ["You carry nothing."] };
  }
  // Name each carried item, one line per item.
  const lines = [];
  for (const item of state.carriedItems) {
    lines.push("You carry a " + item + ".");
  }
  return { state, lines };
}

// handleExamine lets the player look closely at something in the room,
// or at an item they carry. It only changes the state to remember the
// desk, page and wall were examined (used by hints).
function handleExamine(state, noun) {
  const room = state.rooms[state.currentRoomId];

  const aliases = {
    diary: "page", note: "page", paper: "page",
    shelf: "shelves", bookshelf: "shelves", bookcase: "shelves",
    carpet: "rug",
    doorway: "archway", arch: "archway",
    floor: "dust", floorboards: "dust", cobwebs: "dust", webs: "dust",
    moonlight: "shutters",
    "small brass key": "brass key",
    drawers: "drawer"
  };

  // Examining the room itself is the same as looking around.
  if (noun === "room" || noun === room.name.toLowerCase()) {
    return handleLook(state);
  }

  // Try the full phrase ("reading desk"), then each word from the end
  // ("desk"), so the player does not need to type the exact word.
  const words = noun.split(" ");
  let thing = noun;
  for (const candidate of [noun, ...words.slice().reverse()]) {
    let name = aliases[candidate] || ITEM_NAMES[candidate] || candidate;
    // "key" means whichever key lies in this room, if there is one.
    if (candidate === "key" && findRoomKey(room)) name = findRoomKey(room);
    const known = (room.details && room.details[name]) ||
      room.items.includes(name) || state.carriedItems.includes(name);
    if (known) { thing = name; break; }
  }

  // Something fixed in the room (desk, rug, page...).
  if (room.details && room.details[thing]) {
    // Remember the facts the hint command needs. The reply text is unchanged.
    let newState = state;
    if (state.currentRoomId === "library" && thing === "desk") newState = { ...state, deskExamined: true };
    if (state.currentRoomId === "library" && thing === "page") newState = { ...state, pageExamined: true };
    if (state.currentRoomId === "cellar" && thing === "wall") newState = { ...state, wallExamined: true };
    return { state: newState, lines: [room.details[thing]] };
  }

  // An item lying here or carried by the player.
  const itemIsHere = room.items.includes(thing) || state.carriedItems.includes(thing);
  if (itemIsHere && thing === "lamp") {
    // The lamp text depends on whether it is filled and lit.
    return { state, lines: [getLampText(state)] };
  }
  if (itemIsHere && ITEM_DETAILS[thing]) {
    return { state, lines: [ITEM_DETAILS[thing]] };
  }

  return { state, lines: ["You find nothing worth noticing."] };
}

// handleMoveRug drags the rug aside and reveals a trapdoor in the library.
// It builds a new state where the library has a new exit going down.
function handleMoveRug(state) {
  const room = state.rooms[state.currentRoomId];

  if (state.currentRoomId !== "library") {
    return { state, lines: ["There is no rug here."] };
  }
  if (room.exits.down) {
    return { state, lines: ["The rug is already dragged aside."] };
  }

  const newState = {
    ...state,
    rooms: {
      ...state.rooms,
      library: {
        ...room,
        description: room.description + " The rug lies dragged aside, and a trapdoor gapes in the floor.",
        exits: { ...room.exits, down: "cellar" },
        details: {
          ...room.details,
          trapdoor: "An iron ring set into old planks. The wood around it is worn smooth, as if something has gone up and down this way many times."
        }
      }
    }
  };
  return { state: newState, lines: ["You drag the rug aside. Beneath it is a trapdoor, an iron ring worn smooth by use. Cold air breathes up through the gaps, and it smells of earth."] };
}

// handlePullStone works the crooked stone in the cellar wall. It reveals a
// hollow with an old iron key in it, and the key becomes an item in the room.
function handlePullStone(state) {
  const room = state.rooms[state.currentRoomId];

  if (state.currentRoomId !== "cellar") {
    return { state, lines: ["There is no stone here to move."] };
  }
  if (room.stoneMoved) {
    return { state, lines: ["The stone has already been pulled out."] };
  }

  const newState = {
    ...state,
    rooms: {
      ...state.rooms,
      cellar: {
        ...room,
        stoneMoved: true,
        items: [...room.items, "key"],
        description: room.description + " A dark hollow gapes in the wall where the stone was.",
        details: {
          ...room.details,
          stone: "The stone sits on the floor now, rough and damp. Behind it the wall is hollow."
        }
      }
    }
  };
  return { state: newState, lines: ["You work your fingers around the crooked stone and pull. It grinds free. Behind it is a hollow in the wall, and in the hollow lies an old iron key."] };
}

// handleTakeKey picks up whichever key lies in the current room.
// Order: key in the room, then already carrying the iron key, then no key.
function handleTakeKey(state) {
  const room = state.rooms[state.currentRoomId];

  // 1. A key lies here: take it (findRoomKey and takeItem are defined below).
  const keyId = findRoomKey(room);
  if (keyId) {
    // The iron key keeps its old reply. The other keys use a plain one.
    const line = keyId === "key"
      ? "You take the key. It is colder than the cellar."
      : "You take the " + keyId + ".";
    return takeItem(state, keyId, line);
  }
  // 2. No key here, but the player already has the iron key.
  if (state.carriedItems.includes("key")) {
    return { state, lines: ["You already carry the key."] };
  }

  const nudge = hiddenNudge(state, "key");
  if (nudge) return { state, lines: [nudge] };

  // 3. No key anywhere to take.
  return { state, lines: ["There is no key here."] };
}

// handleUnlockDoor tries a door by hand. In the hallway, the iron key opens
// the front door (the escape). Any other locked door here opens if the player
// carries its key, and the player stays where they are.
function handleUnlockDoor(state) {
  const room = state.rooms[state.currentRoomId];
  const locks = Object.values(room.locks || {});

  // The front door: only in the hallway, and only with the iron key.
  if (state.currentRoomId === "hallway" && state.carriedItems.includes("key")) {
    return { state: { ...state, escaped: true }, lines: ESCAPE_LINES };
  }

  // A locked door here whose key the player carries: unlock it.
  for (const lock of locks) {
    if (!state[lock.unlockedFact] && state.carriedItems.includes(lock.keyItem)) {
      return { state: { ...state, [lock.unlockedFact]: true }, lines: [lock.unlockLine] };
    }
  }

  // The front door without the iron key.
  if (state.currentRoomId === "hallway") {
    return { state, lines: ["You try the lock. It does not give."] };
  }

  // A locked door here, but no key for it yet.
  for (const lock of locks) {
    if (!state[lock.unlockedFact]) {
      return { state, lines: [lock.lockedLine] };
    }
  }

  return { state, lines: ["There is no door here to unlock."] };
}

// handleHelp reminds the player which words the game understands.
// It does not reveal the map or change the game state.
function handleHelp(state) {
  return {
    state,
    lines: [
      "Try: look, go <direction>, examine <thing>, take <item>, inventory.",
      "Directions: north, south, east, west, up, down.",
      // Points the player to the hint command (costs fear when used).
      "Stuck? Type hint."
    ]
  };
}

// ITEM_NAMES maps what the player may type to an item id.
// There is no "key" or "book" here on purpose.
const ITEM_NAMES = {
  "lamp": "lamp",
  "brass key": "brass key",
  "small brass key": "brass key",
  "rusty key": "rusty key",
  "lighter": "lighter",
  "oil can": "oil can",
  "oil": "oil can",
  "can": "oil can"
};

// TAKE_REFUSALS are the replies for things the player tries to take but cannot.
const TAKE_REFUSALS = {
  page: "The paper is too brittle to lift. Read it where it lies.",
  desk: "The desk is far too heavy to carry.",
  rug: "The rug is heavy with damp. You would rather look under it.",
  stone: "The stone is wedged in the wall.",
  drawer: "The drawer is part of the counter.",
  door: "Doors do not come off that easily.",
  shelves: "The shelves lean on the wall. They are not going anywhere."
};

// ROOM_KEY_IDS lists the ids of the keys that can lie in a room.
const ROOM_KEY_IDS = ["key", "brass key", "rusty key"];

// findRoomKey returns the id of the first key in the room, or undefined.
function findRoomKey(room) {
  return ROOM_KEY_IDS.find(id => room.items.includes(id));
}

// hiddenNudge returns a nudge line when the player asks for an item that is
// hidden in this room but not found yet. It never names the exact command.
function hiddenNudge(state, itemId) {
  if (state.currentRoomId === "library" && !state.bookPulled &&
    (itemId === "key" || itemId === "brass key")) {
    return "Something is wedged inside the odd book. You would have to open it first.";
  }
  if (state.currentRoomId === "kitchen" && !state.drawerOpen &&
    (itemId === "key" || itemId === "rusty key" || itemId === "lighter")) {
    return "Something shifts inside the drawer, out of reach. You would have to open it first.";
  }
  return null;
}

// takeItem moves one item from the current room to carriedItems.
// It builds new objects and arrays, and changes nothing else.
function takeItem(state, itemId, line) {
  const room = state.rooms[state.currentRoomId];
  const newState = {
    ...state,
    carriedItems: [...state.carriedItems, itemId],
    rooms: {
      ...state.rooms,
      [state.currentRoomId]: {
        ...room,
        items: room.items.filter(item => item !== itemId)
      }
    }
  };
  return { state: newState, lines: [line] };
}

// handleTakeLamp picks up the lamp if it is sitting in the current room.
// If the player already carries the lamp, it says so and leaves the
// state unchanged (same state reference returned). If the lamp is in the
// room, it builds a new state: the lamp is removed from the room's items
// and added to carriedItems. (Requirements 6.1, 6.2, 9.3)
function handleTakeLamp(state) {
  const room = state.rooms[state.currentRoomId];

  // Already carrying the lamp: no change, just tell the player.
  if (state.carriedItems.includes("lamp")) {
    return { state, lines: ["You already carry the lamp."] };
  }

  // Lamp is in the room: move it from the room to carried items.
  if (room.items.includes("lamp")) {
    return takeItem(state, "lamp", "You take the lamp.");
  }

  // Lamp is neither in the room nor carried: nothing to take.
  return { state, lines: ["There is no lamp here."] };
}

// handleTake picks up any item the player names, like "take oil can".
// Replies: taken, already carried, or not here. Hidden items are not in
// room.items, so they cannot be taken. Only the taken case changes state.
function handleTake(state, noun) {
  const itemId = ITEM_NAMES[noun];

  // The two special cases keep their own handlers.
  if (noun === "lamp") return handleTakeLamp(state);
  if (noun === "key") return handleTakeKey(state);

  // Scenery the player cannot pick up gets its own reply, but only when
  // the thing is really in this room.
  const scenery = { diary: "page", note: "page", paper: "page" }[noun] || noun;
  const here = state.rooms[state.currentRoomId].details;
  if (here && here[scenery] && TAKE_REFUSALS[scenery]) {
    return { state, lines: [TAKE_REFUSALS[scenery]] };
  }

  // The word is not an item the game knows.
  if (!itemId) {
    return { state, lines: ["There is no " + noun + " here."] };
  }
  // Already in the player's hands.
  if (state.carriedItems.includes(itemId)) {
    return { state, lines: ["You already carry the " + itemId + "."] };
  }
  // Lying in this room: pick it up.
  if (state.rooms[state.currentRoomId].items.includes(itemId)) {
    return takeItem(state, itemId, "You take the " + itemId + ".");
  }

  const nudge = hiddenNudge(state, itemId);
  if (nudge) return { state, lines: [nudge] };

  // Known item, but not here.
  return { state, lines: ["There is no " + itemId + " here."] };
}

// handleFillLamp pours oil from the oil can into the lamp.
// Checks run in order: no lamp, no oil can, already full, then fill.
// Only the filled case builds a new state. The others return the same state.
// The replies are action results, so they never pass through applyLies.
function handleFillLamp(state) {
  if (!state.carriedItems.includes("lamp")) {
    return { state, lines: ["You have no lamp to fill."] };
  }
  if (!state.carriedItems.includes("oil can")) {
    return { state, lines: ["You have no oil can."] };
  }
  if (state.fueled) {
    return { state, lines: ["The lamp is already full."] };
  }
  return {
    state: { ...state, fueled: true },
    lines: ["You pour the oil into the lamp. It smells of old smoke."]
  };
}

// handleLightLamp lights the lamp with the lighter.
// Checks run in order: no lamp, already lit, no oil, no lighter, then light.
// Only the lit case builds a new state. The others return the same state.
// The replies are action results, so they never pass through applyLies.
function handleLightLamp(state) {
  if (!state.carriedItems.includes("lamp")) {
    return { state, lines: ["You have no lamp to light."] };
  }
  if (state.lit) {
    return { state, lines: ["The lamp is already lit."] };
  }
  if (!state.fueled) {
    return { state, lines: ["The lamp has no oil."] };
  }
  if (!state.carriedItems.includes("lighter")) {
    return { state, lines: ["You have nothing to light it with."] };
  }
  return {
    state: { ...state, lit: true },
    lines: ["The wick catches. A small flame steadies, and the shadows step back."]
  };
}

// handleOpenDrawer opens the kitchen drawer and reveals the lighter and
// the rusty key. It builds new objects and arrays, so INITIAL_STATE is safe.
// The replies are action results, so they never pass through applyLies.
function handleOpenDrawer(state) {
  if (state.currentRoomId !== "kitchen") {
    return { state, lines: ["There is no drawer here."] };
  }
  if (state.drawerOpen) {
    return { state, lines: ["The drawer is already open."] };
  }

  const room = state.rooms.kitchen;
  const newState = {
    ...state,
    drawerOpen: true,
    rooms: {
      ...state.rooms,
      kitchen: {
        ...room,
        // New array: the old items plus the two things from the drawer.
        items: [...room.items, "lighter", "rusty key"],
        details: {
          ...room.details,
          drawer: "The drawer hangs open and empty. The wood inside is stained in the shape of what it held."
        }
      }
    }
  };
  return { state: newState, lines: ["You pull the drawer open. Inside lie a brass lighter and a rusty key."] };
}

// handleOpenBook pulls the odd book from the Library shelf and reveals the
// brass key. The new Library copies the old one, so the rug and trapdoor
// changes are kept. INITIAL_STATE is never changed.
// The replies are action results, so they never pass through applyLies.
function handleOpenBook(state) {
  if (state.currentRoomId !== "library") {
    return { state, lines: ["There is no book to open here."] };
  }
  if (state.bookPulled) {
    return { state, lines: ["The book is already open."] };
  }

  const room = state.rooms.library;
  const newState = {
    ...state,
    bookPulled: true,
    rooms: {
      ...state.rooms,
      // New array: the old items plus the brass key.
      library: {
        ...room,
        items: [...room.items, "brass key"],
        details: {
          ...room.details,
          book: "The book hangs open, its pages cut into a hollow the shape of what it held."
        }
      }
    }
  };
  return { state: newState, lines: ["You pull the wrong book from the shelf. Behind it, in a hollow, lies a small brass key."] };
}

// STEP_COUNT is how many escape steps there are.
const STEP_COUNT = 15;

// isStepDoneOwn says if one step is done by its own facts only.
// It reads only the state, never the player's text.
function isStepDoneOwn(state, step) {
  const has = item => state.carriedItems.includes(item);
  switch (step) {
    case 1: return has("lamp");
    case 2: return state.libraryEntered;
    case 3: return state.deskExamined && state.pageExamined;
    case 4: return state.bookPulled && has("brass key");
    case 5: return state.kitchenDoorUnlocked;
    case 6: return state.drawerOpen && has("lighter") && has("rusty key");
    case 7: return state.storeroomDoorUnlocked && has("oil can");
    case 8: return state.fueled;
    case 9: return state.lit;
    case 10: return Boolean(state.rooms.library.exits.down);
    case 11: return state.cellarEntered;
    case 12: return state.wallExamined;
    case 13: return Boolean(state.rooms.cellar.stoneMoved);
    case 14: return has("key");
    default: return false;
  }
}

// isStepDone says if an escape step (1 to 14) is done. A step is done by its
// own facts. It is also done through a later step, but only when that later
// step cannot happen without it, so a player who skips ahead never gets a
// stale hint:
//   - Steps 1 and 2: only their own facts.
//   - Step 3 is optional: any step from 4 onward makes it done.
//   - Steps 4 to 9: a later step from 5 to 9, or any step from 11 onward.
//     Step 10 never counts, because the rug can be pulled at any time.
//   - Step 10 and later: any step from 11 onward.
function isStepDone(state, step) {
  if (isStepDoneOwn(state, step)) return true;
  if (step <= 2) return false;

  // Check each later step that proves this one was done.
  for (let later = step + 1; later < STEP_COUNT; later++) {
    // Steps 4 to 9 are not proven by step 10 (the rug).
    if (step >= 4 && step <= 9 && later === 10) continue;
    // Steps 10 and later are only proven by steps 11 and later.
    if (step >= 10 && later < 11) continue;
    if (isStepDoneOwn(state, later)) return true;
  }
  return false;
}

// getCurrentStep returns the first step that is not done.
// If steps 1 to 14 are all done, it returns 15.
function getCurrentStep(state) {
  for (let step = 1; step < STEP_COUNT; step++) {
    if (!isStepDone(state, step)) return step;
  }
  return STEP_COUNT;
}

// handleHint shows one hint for the current step. The hint gets clearer
// each time the player asks on the same step (3 levels at most).
// It only changes hintStep and hintCount. The text is never passed
// through applyLies, so a hint never lies.
function handleHint(state) {
  const step = getCurrentStep(state);

  // A new step starts again at level 1.
  const count = step === state.hintStep ? state.hintCount : 0;
  const level = Math.min(count, 2) + 1;

  const newState = { ...state, hintStep: step, hintCount: Math.min(3, count + 1) };
  // hint: true tells processCommand to charge HINT_FEAR_COST.
  return { state: newState, lines: [HINT_TEXT[step - 1][level - 1]], hint: true };
}

// runCommand is the core of the game. It takes the current state and
// the raw text the player typed, then returns { state, lines }:
//   - state is the game state after the command (same reference if unchanged)
//   - lines is a list of text lines to show on the screen
// This is a pure function: it never reads or changes the page (DOM).
// The new processCommand (added in task 5.3) wraps this function.
function runCommand(state, rawInput) {
  const command = normalizeCommand(rawInput);

  // A verb with no object: ask what the player means. "unknown: true" keeps
  // this free of fear, like other unrecognized text.
  const askBack = { examine: "Examine what?", take: "Take what?", go: "Go where?", read: "Read what?" };
  if (askBack[command]) {
    return { state, lines: [askBack[command]], unknown: true };
  }

  // examine <thing>: look closely at something. Several words work.
  for (const word of ["examine ", "read ", "look at ", "inspect "]) {
    if (command.startsWith(word)) {
      return handleExamine(state, command.slice(word.length));
    }
  }

  // move rug: reveal the trapdoor. (Several words work.)
  if (["move rug", "pull rug", "lift rug", "drag rug", "push rug", "slide rug", "remove rug", "shift rug", "look under rug"].includes(command)) {
    return handleMoveRug(state);
  }

  // pull stone: reveal the hollow and the key (cellar only).
  if (command === "pull stone") {
    return handlePullStone(state);
  }

  // take key: pick up the key if it is in the room.
  if (command === "take key") {
    return handleTakeKey(state);
  }

  // unlock door: escape through the front door (hallway only, needs the key).
  if (command === "unlock door") {
    return handleUnlockDoor(state);
  }

  // help: remind the player which words work.
  if (command === "help") {
    return handleHelp(state);
  }

  // hint: show one hint for the current step.
  if (command === "hint") {
    return handleHint(state);
  }

  // fill lamp: pour oil from the oil can into the lamp.
  if (command === "fill lamp") return handleFillLamp(state);

  // light lamp: light the filled lamp with the lighter.
  if (command === "light lamp") return handleLightLamp(state);

  // open drawer: open the kitchen drawer (search/pull drawer map here).
  if (command === "open drawer") return handleOpenDrawer(state);

  // open book: pull the book in the Library and reveal the brass key
  // (pull/take/read book map here).
  if (command === "open book") return handleOpenBook(state);

  // Empty or whitespace-only input: show nothing and change nothing.
  // (Requirement 3.4)
  if (command === "") {
    return { state, lines: [] };
  }

  // look: describe the current room and the items in it. (Requirement 4.1)
  if (command === "look") {
    return handleLook(state);
  }

  // go <direction>, or go <name of a room next door>.
  if (command.startsWith("go ")) {
    const where = command.slice(3);
    if (DIRECTIONS.includes(where)) {
      return handleGo(state, where);
    }
    // "go kitchen": find the exit that leads to a room with that name.
    const here = state.rooms[state.currentRoomId];
    for (const dir in here.exits) {
      if (state.rooms[here.exits[dir]].name.toLowerCase() === where) {
        return handleGo(state, dir);
      }
    }
  }
  // take lamp: pick up the lamp if it is in the room. (Requirements 6.1, 6.2)
  if (command === "take lamp") {
    return handleTakeLamp(state);
  }

  // take <item>: pick up any other item by name.
  if (command.startsWith("take ")) return handleTake(state, command.slice(5));

  // inventory: list the items the player carries. (Requirements 7.1, 7.2)
  if (command === "inventory") {
    return handleInventory(state);
  }

  // Anything else is not a known command.
  return handleUnknown(state);
}

// applyFear works out the new fear after a command. It compares the state
// before the command (oldState) with the state after it (newState) and
// returns a new state with the updated fear. It never changes either state.
function applyFear(oldState, newState) {
  // The cost depends on the room the player was in before the command.
  const cost = oldState.currentRoomId === "cellar" ? FEAR_COST_CELLAR : FEAR_COST_NORMAL;

  // Going down into the cellar adds a one-time scare. A refused move keeps
  // the same room, so it never gets this bonus.
  const enteredCellar = oldState.currentRoomId !== "cellar" && newState.currentRoomId === "cellar";
  const entryBonus = enteredCellar ? FEAR_CELLAR_ENTRY : 0;

  // Fear can never go above FEAR_MAX.
  const fear = Math.min(FEAR_MAX, oldState.fear + cost + entryBonus);

  return { ...newState, fear };
}

// applyHintFear adds the fixed hint cost. It replaces the normal cost
// (and the cellar cost), and fear never goes above FEAR_MAX.
function applyHintFear(oldState, newState) {
  const fear = Math.min(FEAR_MAX, oldState.fear + HINT_FEAR_COST);
  return { ...newState, fear };
}

// getThresholdLines finds the fear warnings that should show after a command.
// oldFear is the fear before the command. newState already has the new fear.
// It returns { shownThresholds, lines }: the warning lines (lowest first) and
// the updated list of thresholds already shown. It never changes newState.
function getThresholdLines(oldFear, newState) {
  // Start from a copy, so the state's own list is never changed.
  const shownThresholds = [...newState.shownThresholds];
  const lines = [];

  for (let i = 0; i < FEAR_THRESHOLDS.length; i++) {
    const threshold = FEAR_THRESHOLDS[i];
    // Count it only if fear just crossed it and it was not shown before.
    const crossed = oldFear < threshold && newState.fear >= threshold;
    if (crossed && !shownThresholds.includes(threshold)) {
      shownThresholds.push(threshold);
      // A blank line first, so the warning does not stick to the reply above.
      lines.push("\u00A0", THRESHOLD_LINES[i]);
    }
  }

  return { shownThresholds, lines };
}

// getStatusText builds the text for the status bar, like "Cellar | Fear: 12".
// It only reads the state and returns a string. It never touches the page.
function getStatusText(state) {
  const roomName = state.rooms[state.currentRoomId].name;
  return roomName + " | Fear: " + state.fear;
}

// processCommand is the function the page calls. It wraps runCommand and adds
// the fear rules: restart, game over, fear cost, warnings and the ending.
// It returns { state, lines }. It never reads or changes the page.
function processCommand(state, rawInput) {
  const command = normalizeCommand(rawInput);

  // Step 1: restart works in any state, costs no fear, and starts fresh.
  if (command === "restart") {
    return {
      state: INITIAL_STATE,
      lines: [...INTRO, "\u00A0", ...handleLook(INITIAL_STATE).lines]
    };
  }

  // Step 2: empty input does nothing, even after game over.
  if (command === "") {
    return { state, lines: [] };
  }

  // Step 3: after game over, only restart works. Show a short reminder.
  if (state.gameOver) {
    return { state, lines: [GAME_OVER_REMINDER] };
  }

  // Step 3b: after escaping, only restart works too.
  if (state.escaped) {
    return { state, lines: [ESCAPE_REMINDER] };
  }

  // Step 4: run the normal command logic.
  const result = runCommand(state, rawInput);

  // Step 4b: escaping ends the game right away, with no fear change.
  if (result.state.escaped) {
    return result;
  }

  // Step 5: unknown text and help cost no fear, so return them as they are.
  if (result.unknown || command === "help") {
    return result;
  }

  // Step 6: add the fear cost (refused commands cost fear too).
  // A hint has its own fixed cost.
  const feared = result.hint ? applyHintFear(state, result.state) : applyFear(state, result.state);

  // Step 7: find warning lines for any thresholds just crossed.
  const thresholds = getThresholdLines(state.fear, feared);

  // Step 8: build the final state and lines. Order: reply, warnings, ending.
  let finalState = { ...feared, shownThresholds: thresholds.shownThresholds };
  const lines = [...result.lines, ...thresholds.lines];

  // Step 9: at maximum fear the Caretaker catches the player.
  if (finalState.fear === FEAR_MAX) {
    finalState = { ...finalState, gameOver: true };
    lines.push(...GAME_OVER_LINES);
  }

  return { state: finalState, lines };
}

// ---- Inventory strip data ----

// The name of each item that has an icon. The key is the item id in carriedItems.
// The iron key has the item id "key" but is named "iron key".
// An item id that is not in this list gets no icon and is skipped.
// This is separate from the existing ITEM_NAMES. Do not change or redeclare that one.
const STRIP_ITEM_NAMES = {
  "lamp": "lamp",
  "brass key": "brass key",
  "rusty key": "rusty key",
  "key": "iron key",
  "lighter": "lighter",
  "oil can": "oil can"
};

// ---- Inventory strip variables ----
// Presentation only. None of these belong in gameState.

// The item ids shown at the last update, or null before the first update.
let lastShownItems = null;

// A short text that describes what the strip shows now (items and lamp look).
let lastStripSignature = null;

// ---- Inventory strip icons ----
// Each icon is 12 rows of 12 characters. "." is an empty cell.
// Every other character is a color in the icon's palette.

// Brass key and rusty key share one shape. Only the palette differs.
const KEY_ROWS = [
  "............",
  "............",
  "............",
  "............",
  "..bbb.......",
  "..b.bsssss..",
  "..bbb..s.s..",
  "............",
  "............",
  "............",
  "............",
  "............"
];

const ICONS = {
  "brass key": { rows: KEY_ROWS, palette: { b: "#f2d04a", s: "#d9ae22" } },
  "rusty key": { rows: KEY_ROWS, palette: { b: "#b4531c", s: "#7d3a12" } },
  key: {                                   // the iron key: thicker bow and shaft
    rows: [
      "............",
      "............",
      "..iii.......",
      ".i...i......",
      ".i...iiiiiii",
      ".i...iiiiiii",
      ".i...i..g..g",
      "..iii.......",
      "............",
      "............",
      "............",
      "............"
    ],
    palette: { i: "#9bb5a3", g: "#6d8576" }
  },
  lighter: {
    rows: [
      "............",
      ".....l......",
      ".....l......",
      "....ssss....",
      "....bbbb....",
      "....bbbb....",
      "....bbbb....",
      "....bbbb....",
      "....bbbb....",
      "....bbbb....",
      "............",
      "............"
    ],
    palette: { l: "#ffcc33", s: "#d0d0d0", b: "#c9a227" }
  },
  "oil can": {
    rows: [
      "............",
      "............",
      "............",
      "..hhhh......",
      "..h..h....p.",
      ".cccccc...p.",
      ".ccccccpppp.",
      ".cccccc.....",
      ".cccccc.....",
      ".cccccc.....",
      "............",
      "............"
    ],
    palette: { h: "#8a8a8a", c: "#5d7f9a", p: "#b0b0b0" }
  }
};

// The lamp has three looks. They share one palette.
const LAMP_PALETTE = { h: "#c9a227", g: "#7fe3b0", f: "#d9b648", l: "#ffcc33" };

const LAMP_LOOKS = {
  // Empty: glass is empty, no flame.
  dark: [
    "............",
    "....hhhh....",
    "...gggggg...",
    "...g....g...",
    "...g....g.hh",
    "...g....g..h",
    "...g....g.hh",
    "...gggggg...",
    "..hhhhhhhh..",
    "..hhhhhhhh..",
    "............",
    "............"
  ],
  // Fueled, not lit: fuel fill at the bottom of the glass, no flame.
  full: [
    "............",
    "....hhhh....",
    "...gggggg...",
    "...g....g...",
    "...g....g.hh",
    "...gffffg..h",
    "...gffffg.hh",
    "...gggggg...",
    "..hhhhhhhh..",
    "..hhhhhhhh..",
    "............",
    "............"
  ],
  // Lit: a flame inside the glass.
  lit: [
    "............",
    "....hhhh....",
    "...gggggg...",
    "...g.ll.g...",
    "...gllllg.hh",
    "...g.ll.g..h",
    "...g....g.hh",
    "...gggggg...",
    "..hhhhhhhh..",
    "..hhhhhhhh..",
    "............",
    "............"
  ]
};

// buildIconSvg turns an icon into an inline SVG string with sharp edges.
// It returns null if the icon is not 12 rows of 12 known characters.
function buildIconSvg(icon) {
  if (!icon || !Array.isArray(icon.rows) || icon.rows.length !== 12) return null;
  let cells = "";
  for (let y = 0; y < 12; y++) {
    const row = icon.rows[y];
    if (typeof row !== "string" || row.length !== 12) return null;
    for (let x = 0; x < 12; x++) {
      const ch = row[x];
      if (ch === ".") continue;                         // empty cell
      if (!icon.palette[ch]) return null;               // unknown character
      cells += '<rect class="px-' + ch + '" x="' + x + '" y="' + y +
        '" width="1" height="1" fill="' + icon.palette[ch] + '"/>';
    }
  }
  return '<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">' + cells + "</svg>";
}

// getLampLook picks "lit", "full" or "dark" from the lamp facts only.
// It reads state.lit and state.fueled, never fear, the room or the narrator.
function getLampLook(state) {
  if (state.lit) return "lit";
  if (state.fueled) return "full";
  return "dark";
}

// updateInventoryStrip redraws the inventory strip from carriedItems, fueled and lit.
// The strip always shows the true state, even when the narrator lies.
// It only reads the state. It never changes it.
// quiet is true after a restart: no pickup flash then.
function updateInventoryStrip(state, quiet) {
  try {
    const strip = document.getElementById("inventory-strip");
    if (!strip) return;

    // Step 1: list the items to draw, in carriedItems order.
    // Skip repeated ids, ids with no icon, and icons that are not valid.
    const lampLook = getLampLook(state);
    const shown = [];                                  // { id, name, svg }
    for (const id of state.carriedItems) {
      if (shown.some(item => item.id === id)) continue;   // same id twice: draw once
      if (!STRIP_ITEM_NAMES[id]) continue;                // no icon for this id
      const icon = id === "lamp"
        ? { rows: LAMP_LOOKS[lampLook], palette: LAMP_PALETTE }
        : ICONS[id];
      const svg = buildIconSvg(icon);
      if (!svg) continue;                                 // invalid icon: skip it
      shown.push({ id: id, name: STRIP_ITEM_NAMES[id], svg: svg });
    }

    // Step 2: if nothing visible changed, leave the strip alone.
    // This keeps a running flame flicker or flash from restarting.
    const ids = shown.map(item => item.id);
    const lampShown = ids.includes("lamp") ? lampLook : "";
    const signature = ids.join("|") + "#" + lampShown;
    if (signature === lastStripSignature) return;
    lastStripSignature = signature;

    // Step 3: find items that are newly carried since the last update.
    // No flash on the first update (lastShownItems is null),
    // after a restart (quiet), or when the player prefers reduced motion.
    const reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canFlash = lastShownItems !== null && !quiet && !reduceMotion;
    const newIds = canFlash ? ids.filter(id => !lastShownItems.includes(id)) : [];
    lastShownItems = ids;

    // Step 4: rebuild the strip. Only carried items get an element.
    strip.style.setProperty("--icon-size", INVENTORY_ICON_PX + "px");
    strip.style.setProperty("--flash-ms", INVENTORY_FLASH_MS + "ms");
    strip.textContent = "";

    const label = document.createElement("span");
    label.className = "strip-label";
    label.textContent = shown.length === 0 ? "CARRYING: NOTHING" : "CARRYING:";
    strip.appendChild(label);

    for (const item of shown) {
      const icon = document.createElement("div");
      icon.className = "carried-icon";
      if (item.id === "lamp" && lampLook === "lit") icon.classList.add("lamp-lit");
      icon.title = item.name;                          // only carried items get a title
      icon.setAttribute("aria-label", item.name);
      icon.setAttribute("role", "img");
      icon.innerHTML = item.svg;
      if (newIds.includes(item.id)) {
        icon.classList.add("flash");                   // pickup flash, once
        setTimeout(() => icon.classList.remove("flash"), INVENTORY_FLASH_MS);
      }
      strip.appendChild(icon);
    }
  } catch (error) {
    // The strip must never break the game.
  }
}

// updateStatusBar shows the room name and fear in the #status-bar element.
// If the page has no #status-bar, it does nothing.
function updateStatusBar(state) {
  const bar = document.getElementById("status-info");
  if (bar) {
    bar.textContent = getStatusText(state);
  }
}

// getSoundCommand checks if the text is a sound command. It trims, squashes
// extra spaces and lowercases. Returns "off", "on", or null for anything else.
function getSoundCommand(text) {
  const clean = text.trim().replace(/\s+/g, " ").toLowerCase();
  if (clean === "sound off" || clean === "mute") return "off";
  if (clean === "sound on" || clean === "unmute") return "on";
  return null;
}

// handleSubmit runs when the player submits the command form. It stops
// the page from reloading, reads the typed text, runs it through
// processCommand, saves the new state, shows the reply, then clears and
// refocuses the input so the player can type the next command.
// (Requirement 3.2)
function handleSubmit(event) {
  event.preventDefault(); // always stop the page from reloading
  if (startPhase !== "done") return; // no commands during the start screen
  // While text is typing, a submit only skips the typing. No command runs.
  if (typing) {
    skipTyping();
    return;
  }
  const input = document.getElementById("command-input");
  const text = input.value;
  // Show what the player typed, with a ">>" in front, like a command prompt.
  // Skip it if the player typed only spaces or nothing.
  if (text.trim() !== "") {
    renderOutput([">> " + text]);
    renderOutput(["\u00A0"]);
  }
  // A sound command only changes the sound. It skips the game and the clack.
  const soundValue = getSoundCommand(text);
  if (soundValue !== null) {
    setSound(soundValue === "on");
    showLines([soundValue === "on" ? "Sound on." : "Sound off.", "\u00A0"]);
    // If typing started, endTyping clears and focuses the input later.
    if (!typing) {
      input.value = "";
      showTyped();
      input.focus();
    }
    return;
  }
  // A real command was sent: play the clack just before running it.
  playClack();
  const result = processCommand(gameState, text);
  gameState = result.state;
  updateStatusBar(gameState);
  // Redraw the inventory strip. Quiet (no pickup flash) after a restart.
  updateInventoryStrip(gameState, normalizeCommand(text) === "restart");
  // Show the reply, with a blank line after it before the next prompt.
  const replyLines = [...result.lines];
  if (result.lines.length > 0) {
    replyLines.push("\u00A0");
  }
  showLines(replyLines);
  // If typing started, endTyping clears and focuses the input later.
  if (!typing) {
    input.value = "";
    showTyped();
    input.focus();
  }
}

// init sets up the game when the page loads. It resets the state to the
// start, shows the Hallway description, connects the form's submit event
// to handleSubmit, and focuses the input so the player can type right away.
// (Requirement 2.4)
function init() {
  gameState = INITIAL_STATE;
  // Load the saved sound choice and show it on the button.
  soundEnabled = loadSoundChoice();
  updateSoundToggle();
  updateStatusBar(gameState);
  // Draw the inventory strip at start. false: no quiet mode needed on first load.
  updateInventoryStrip(gameState, false);
  // The intro is typed later by beginIntro, after the start screen.
  const form = document.getElementById("command-form");
  form.addEventListener("submit", handleSubmit);
  document.getElementById("command-input").focus();
  document.addEventListener("click", () => document.getElementById("command-input").focus());
  const typingBox = document.getElementById("command-input");

  // Key sounds. Runs before showTyped, so lastInputLength is still the old length.
  // No sound while text is being typed on screen or during the start screen.
  typingBox.addEventListener("input", () => {
    if (typing || startPhase !== "done") return;
    const length = typingBox.value.length;
    if (length > lastInputLength) {
      playKeyClick();       // text grew: a letter was typed
    } else if (length < lastInputLength) {
      playBackspaceClick(); // text shrank: something was deleted
    }
  });
  for (const eventName of ["input", "keyup", "click", "select"]) {
    typingBox.addEventListener(eventName, showTyped);
  }
  // On keydown the caret has not moved yet, so check again a moment later.
  typingBox.addEventListener("keydown", () => setTimeout(showTyped, 0));

  // While typing: Enter or Space skips. Letters, Backspace, Delete and Tab
  // are blocked. Other keys (F5, F12, Escape, arrows) are left alone.
  typingBox.addEventListener("keydown", (event) => {
    if (!typing) return;
    // Never block browser shortcuts such as Ctrl+R.
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    const key = event.key;
    if (key === "Enter" || key === " ") {
      event.preventDefault(); // no submit, no space typed
      skipTyping();
    } else if (key.length === 1 || key === "Backspace" || key === "Delete" || key === "Tab") {
      event.preventDefault(); // nothing is added or removed
    }
  });

  // While typing: if text still gets in (paste, phone keyboard), clear it.
  typingBox.addEventListener("input", () => {
    if (typing) {
      typingBox.value = "";
      showTyped();
    }
  });

  // While typing: a click on the output skips, and focus stays in the input.
  const outputBox = document.getElementById("output");
  outputBox.addEventListener("mousedown", (event) => {
    if (typing) event.preventDefault();
  });
  outputBox.addEventListener("click", () => {
    if (typing) skipTyping();
  });
  showTyped();

  // The sound button flips sound on or off. It prints nothing.
  document.getElementById("sound-toggle").addEventListener("click", (event) => {
    setSound(!soundEnabled);
    // detail 0 means a keyboard press. Stop the click here so the page
    // does not move focus away from the button.
    if (event.detail === 0) event.stopPropagation();
  });

  // Browsers only allow audio after the player does something.
  // On the first key press or click, create the audio, then remove both.
  function firstAction() {
    ensureAudio();
    document.removeEventListener("keydown", firstAction, true);
    document.removeEventListener("click", firstAction, true);
  }
  document.addEventListener("keydown", firstAction, true);
  document.addEventListener("click", firstAction, true);

  // Start screen: keys and clicks are caught first (capture phase).
  document.addEventListener("keydown", handleStartInput, true);
  document.addEventListener("click", handleStartInput, true);

  // Safety net: if anything ever scrolls the page itself, put it back at the top.
  window.addEventListener("scroll", () => window.scrollTo(0, 0));

  // Show the loading screen last, once sound is loaded and listeners exist.
  // Only init() calls it, so it shows once per page load (not on restart).
  startLoading();
}

// Start the game when the page is ready. The document check keeps this
// line from running outside a browser (for example, in Node).
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", init);
}
