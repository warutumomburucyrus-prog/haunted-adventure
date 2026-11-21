// Haunted Adventure game engine.
// This file holds the game state and the command logic.

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
  // Scroll the output box (not the whole page) so the prompt sits mid-screen.
  const form = document.getElementById("command-form");
  output.scrollTop = form.offsetTop - output.clientHeight / 2;
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

// updateStatusBar shows the room name and fear in the #status-bar element.
// If the page has no #status-bar, it does nothing.
function updateStatusBar(state) {
  const bar = document.getElementById("status-info");
  if (bar) {
    bar.textContent = getStatusText(state);
  }
}

// handleSubmit runs when the player submits the command form. It stops
// the page from reloading, reads the typed text, runs it through
// processCommand, saves the new state, shows the reply, then clears and
// refocuses the input so the player can type the next command.
// (Requirement 3.2)
function handleSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("command-input");
  const text = input.value;
  // Show what the player typed, with a ">>" in front, like a command prompt.
  // Skip it if the player typed only spaces or nothing.
  if (text.trim() !== "") {
    renderOutput([">> " + text]);
    renderOutput(["\u00A0"]);
  }
  const result = processCommand(gameState, text);
  gameState = result.state;
  updateStatusBar(gameState);
  renderOutput(result.lines);
  // Leave a blank line after the reply, before the next prompt.
  if (result.lines.length > 0) {
    renderOutput(["\u00A0"]);
  }
  input.value = "";
  showTyped();
  input.focus();
}

// init sets up the game when the page loads. It resets the state to the
// start, shows the Hallway description, connects the form's submit event
// to handleSubmit, and focuses the input so the player can type right away.
// (Requirement 2.4)
function init() {
  gameState = INITIAL_STATE;
  updateStatusBar(gameState);
  renderOutput([...INTRO, "\u00A0", ...handleLook(INITIAL_STATE).lines, "\u00A0"]);
  const form = document.getElementById("command-form");
  form.addEventListener("submit", handleSubmit);
  document.getElementById("command-input").focus();
  document.addEventListener("click", () => document.getElementById("command-input").focus());
  const typingBox = document.getElementById("command-input");
  for (const eventName of ["input", "keyup", "click", "select"]) {
    typingBox.addEventListener(eventName, showTyped);
  }
  // On keydown the caret has not moved yet, so check again a moment later.
  typingBox.addEventListener("keydown", () => setTimeout(showTyped, 0));
  showTyped();
}

// Start the game when the page is ready. The document check keeps this
// line from running outside a browser (for example, in Node).
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", init);
}
