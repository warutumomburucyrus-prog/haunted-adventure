// Haunted Adventure game engine.
// This file holds the game state and the command logic.

// INITIAL_STATE is the starting game state: the player begins in the Hallway,
// carrying nothing, with a lamp sitting in the room.
const INITIAL_STATE = {
  currentRoomId: "hallway",
  carriedItems: [],
  rooms: {
    hallway: {
      name: "Hallway",
      arrival: "You step back into the hallway. The front door has not moved, but you feel watched.",
      description: "You stand in an old hallway of a haunted house. Dust coats the floorboards and cobwebs drape the walls. Pale moonlight leaks through the shutters. A cold draught seeps from a dark archway deeper in, and behind you the front door waits, silent and shut.",
      items: ["lamp"],
      exits: { north: "library" },
      blocked: { south: "The front door is locked. It will not budge." }
    },
    library: {
      name: "Library",
      arrival: "You duck under the archway. The air is colder here and smells of old paper and wet stone.",
      description: "Shelves lean against the walls, their books swollen and rotten. A reading desk stands in the middle of the room, a moth-eaten rug beneath it. The only light comes from the way you came in.",
      items: [],
      exits: { south: "hallway" },
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
      details: {
        wall: "The same words, scratched again and again until the stone is raw: DO NOT ANSWER HIM."
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
  lamp:"Something brass glints in the dust by your feet, an old oil lamp on its side, dropped by someone in a hurry."
};

// ITEM_DETAILS is what the player sees when examining an item.
const ITEM_DETAILS = {
  lamp: "An old oil lamp, heavy and half full. The glass is cracked, but the wick still takes a flame."
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
    "open trapdoor": "go down"
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
  document.getElementById("command-form").scrollIntoView({ block: "center" });
}

// handleUnknown is used when the player types something that is not a
// known command. It returns a "not recognized" message and gives back the
// exact same state, so nothing in the game changes.
// (Requirements 8.1, 8.2, 9.4)
function handleUnknown(state) {
  return { state, lines: ["That command is not recognized."] };
}

// handleLook shows the current room's description and lists any items
// present in that room. It does not change the game state, so the same
// state reference is returned. (Requirement 4.1)
function handleLook(state) {
  const room = state.rooms[state.currentRoomId];
  const lines = [room.description];
  // Mention each item present in the room so the player can see it.
  for (const item of room.items) {
    lines.push(ITEM_TEXT[item] || "There is a " + item + " here.");
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
    if (nextRoom.arrival) {
      lines.push(nextRoom.arrival, "\u00A0");
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

  // Other words for the same thing.
  const aliases = {
    diary: "page", note: "page", paper: "page",
    books: "shelves", bookshelf: "shelves", bookshelves: "shelves",
    carpet: "rug"
  };
  const thing = aliases[noun] || noun;

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

// processCommand is the core of the game. It takes the current state and
// the raw text the player typed, then returns { state, lines }:
//   - state is the game state after the command (same reference if unchanged)
//   - lines is a list of text lines to show on the screen
// This is a pure function: it never reads or changes the page (DOM).
function processCommand(state, rawInput) {
  const command = normalizeCommand(rawInput);

  // examine <thing>: look closely at something. Several words work.
  for (const word of ["examine ", "read ", "look at ", "inspect "]) {
    if (command.startsWith(word)) {
      return handleExamine(state, command.slice(word.length));
    }
  }

  // move rug: reveal the trapdoor. (Several words work.)
  if (["move rug", "pull rug", "lift rug", "drag rug"].includes(command)) {
    return handleMoveRug(state);
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
  renderOutput(result.lines);
  // Leave a blank line after the reply, before the next prompt.
  if (result.lines.length > 0) {
    renderOutput(["\u00A0"]);
  }
  input.value = "";
  document.getElementById("typed").textContent = "";
  input.focus();
}

// init sets up the game when the page loads. It resets the state to the
// start, shows the Hallway description, connects the form's submit event
// to handleSubmit, and focuses the input so the player can type right away.
// (Requirement 2.4)
function init() {
  gameState = INITIAL_STATE;
  renderOutput([...INTRO, "\u00A0", ...handleLook(INITIAL_STATE).lines, "\u00A0"]);
  const form = document.getElementById("command-form");
  form.addEventListener("submit", handleSubmit);
  document.getElementById("command-input").focus();
  document.addEventListener("click", () => document.getElementById("command-input").focus());
  const typed = document.getElementById("typed");
  const input = document.getElementById("command-input");
  input.addEventListener("input", () => { typed.textContent = input.value; });
}

// Start the game when the page is ready. The document check keeps this
// line from running outside a browser (for example, in Node).
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", init);
}
