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
  "The old key turns. The lock gives with a soft click, and the front door swings open onto cold night air.",
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
  rooms: {
    hallway: {
      name: "Hallway",
      arrival: "You step back into the hallway. The front door has not moved, and neither has the lock. You came here for something you do not have yet.",
      arrivalWithKey: "You step into the hallway with the key cold in your fist. The front door waits, and you could swear the lock is listening.",
      description: "You stand in an old hallway of a haunted house. Dust coats the floorboards and cobwebs drape the walls. Pale moonlight leaks through the shutters. A cold draught seeps from a dark archway deeper in, and behind you the front door waits, silent and shut.",
      items: ["lamp"],
      exits: { north: "library" },
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
        dust: "Only your footprints, and a long smear that runs through the dust toward the archway, as if something heavy was dragged that way, many times."
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
        shelves: "The books have rotted into blocks of grey pulp. Whatever they once said is gone.",
        rug: "A moth-eaten rug. One edge is curled back, and the boards beneath are a different colour from the rest of the floor."
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
  "(Type help if you lose your way.)"
];

const DIRECTIONS = ["north", "south", "east", "west", "up", "down"];

// ITEM_TEXT is what the player sees when an item is lying in a room.
// An item with no entry here gets a plain "There is a ... here." line.
const ITEM_TEXT = {
  lamp:"Something brass glints in the dust by your feet, an old oil lamp on its side, dropped by someone in a hurry.",
  key: "In the hollow, an old iron key lies in the dust, dull and cold, as if it has waited a long time."
};

// ITEM_DETAILS is what the player sees when examining an item.
const ITEM_DETAILS = {
  lamp: "An old oil lamp, heavy and half full. The glass is cracked, but the wick still takes a flame and might be useful.",
  key: "An old iron key, heavy and cold, its teeth worn smooth. Rust has eaten the edges, but it looks as if it would still turn."
};

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
    "get key": "take key", "grab key": "take key", "pick up key": "take key"
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

    // A dark room cannot be entered without the lamp.
    if (nextRoom.needsLight && !state.carriedItems.includes("lamp")) {
      return { state, lines: ["It is pitch black that way. You cannot make yourself step into it without a light."] };
    }

    // Move there: show the arrival line first, then the room itself.
    const newState = { ...state, currentRoomId: nextRoomId };
    const lines = [];

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
// or at an item they carry. It never changes the game state.
function handleExamine(state, noun) {
  const room = state.rooms[state.currentRoomId];

  const aliases = {
    diary: "page", note: "page", paper: "page",
    books: "shelves", bookshelf: "shelves", bookshelves: "shelves",
    carpet: "rug",
    doorway: "archway", arch: "archway",
    floor: "dust", floorboards: "dust", cobwebs: "dust", webs: "dust",
    moonlight: "shutters"
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
    const name = aliases[candidate] || candidate;
    const known = (room.details && room.details[name]) ||
      room.items.includes(name) || state.carriedItems.includes(name);
    if (known) { thing = name; break; }
  }

  // Something fixed in the room (desk, rug, page...).
  if (room.details && room.details[thing]) {
    return { state, lines: [room.details[thing]] };
  }

  // An item lying here or carried by the player.
  const itemIsHere = room.items.includes(thing) || state.carriedItems.includes(thing);
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

// handleTakeKey picks up the key if it is lying in the current room.
function handleTakeKey(state) {
  const room = state.rooms[state.currentRoomId];

  if (state.carriedItems.includes("key")) {
    return { state, lines: ["You already carry the key."] };
  }
  if (room.items.includes("key")) {
    const newState = {
      ...state,
      carriedItems: [...state.carriedItems, "key"],
      rooms: {
        ...state.rooms,
        [state.currentRoomId]: {
          ...room,
          items: room.items.filter(item => item !== "key")
        }
      }
    };
    return { state: newState, lines: ["You take the key. It is colder than the cellar."] };
  }
  return { state, lines: ["There is no key here."] };
}

// handleUnlockDoor tries the front door. It only works in the hallway.
// With the key the player escapes. Without it the lock does not give.
function handleUnlockDoor(state) {
  if (state.currentRoomId !== "hallway") {
    return { state, lines: ["There is no door here to unlock."] };
  }
  if (!state.carriedItems.includes("key")) {
    return { state, lines: ["You try the lock. It does not give."] };
  }
  return { state: { ...state, escaped: true }, lines: ESCAPE_LINES };
}

// handleHelp reminds the player which words the game understands.
// It does not reveal the map or change the game state.
function handleHelp(state) {
  return {
    state,
    lines: [
      "Try: look, go <direction>, examine <thing>, take <item>, inventory.",
      "Directions: north, south, east, west, up, down."
    ]
  };
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
    const newState = {
      ...state,
      carriedItems: [...state.carriedItems, "lamp"],
      rooms: {
        ...state.rooms,
        [state.currentRoomId]: {
          ...room,
          items: room.items.filter(item => item !== "lamp")
        }
      }
    };
    return { state: newState, lines: ["You take the lamp."] };
  }

  // Lamp is neither in the room nor carried: nothing to take.
  return { state, lines: ["There is no lamp here."] };
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

  // Empty or whitespace-only input: show nothing and change nothing.
  // (Requirement 3.4)
  if (command === "") {
    return { state, lines: [] };
  }

  // look: describe the current room and the items in it. (Requirement 4.1)
  if (command === "look") {
    return handleLook(state);
  }

  // go <direction>: move through an exit if there is one. (Requirement 5.1)
  if (command.startsWith("go ")) {
    const direction = command.slice(3);
    if (DIRECTIONS.includes(direction)) {
      return handleGo(state, direction);
    }
  }

  // take lamp: pick up the lamp if it is in the room. (Requirements 6.1, 6.2)
  if (command === "take lamp") {
    return handleTakeLamp(state);
  }

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
  const feared = applyFear(state, result.state);

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
