# Implementation Plan: Lamp Puzzle and Locked Rooms

## Overview

All changes are in `game.js`. `index.html` and `style.css` do not change. Read the current `game.js` before each task and keep the developer's own edits. Each task is one small change. Follow the build order from the design: state facts, command normalizing, lamp, locked rooms, take command, reveals, Cellar light rule. No tests are written and no syntax checks are run, because the developer tests in the browser.

## Tasks

- [x] 1. Add the new state facts
  - [x] 1.1 Add six boolean facts to `INITIAL_STATE`
    - Add `fueled`, `lit`, `kitchenDoorUnlocked`, `storeroomDoorUnlocked`, `drawerOpen` and `bookPulled`, all `false`, each with a short comment
    - Never edit `INITIAL_STATE` or its room arrays directly in handlers, always build new objects and arrays
    - _Requirements: 1.1, 1.2, 6.2, 7.1, 8.2, 9.1, 13.5_

- [x] 2. Update command normalizing
  - [x] 2.1 Rewrite `get`, `grab` and `pick up` to `take` in `normalizeCommand`
    - Run this after filler words are removed and spaces are squashed
    - A lone `get` becomes `take`, so "Take what?" still works
    - _Requirements: 10.1, 10.6, 9.4_

  - [x] 2.2 Add the new synonyms to the `synonyms` list
    - `refuel lamp` and `fuel lamp` become `fill lamp`
    - `search drawer` and `pull drawer` become `open drawer`
    - `pull book`, `take book` and `read book` become `open book`
    - _Requirements: 2.1, 3.1, 7.2, 9.3, 9.4, 9.5_

- [x] 3. Add the lamp commands
  - [x] 3.1 Add the lamp text and `getLampText`
    - Add `LAMP_TEXT` with `empty`, `fueled` and `lit` texts, each different and at most two sentences
    - Add `getLampText(state)` that reads only `fueled` and `lit`
    - Remove the old `ITEM_DETAILS.lamp` text
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 11.5, 11.6_

  - [x] 3.2 Use `getLampText` in `handleExamine`
    - When the noun is `lamp` and the lamp is in the room or carried, show `getLampText(state)`
    - _Requirements: 4.6_

  - [x] 3.3 Add `handleFillLamp` and its `runCommand` branch
    - Check in this order: no lamp, no oil can, already full, then fill
    - Return the same state when nothing changes
    - _Requirements: 1.3, 1.5, 2.2, 2.3, 2.4, 2.5, 2.6, 8.8_

  - [x] 3.4 Add `handleLightLamp` and its `runCommand` branch
    - Check in this order: no lamp, already lit, no oil, no lighter, then light
    - _Requirements: 1.3, 1.4, 1.5, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 4. Add the locked-door rule and the new rooms
  - [x] 4.1 Add the lock check to `handleGo`
    - Read `room.locks` for the direction, before the `needsLight` check
    - Refuse with `lockedLine` when the key is missing
    - When the key is carried, set the door fact on the new state, show `unlockLine` first, then move
    - Once the fact is true, do not check the key again
    - Do not pass the unlock line through `applyLies`
    - _Requirements: 6.3, 6.4, 6.5, 8.3, 8.4, 8.5, 12.1, 12.8_

  - [x] 4.2 Add the Kitchen room and connect it to the Hallway
    - Add the `kitchen` room with `locks.north` for the Storeroom, the exact description phrases, and the lie from the design
    - Add the `east` exit and `locks.east` to the Hallway
    - Add the narrow door sentence to the Hallway description and keep the front door sentence
    - Add the Kitchen `details` for drawer and stove
    - _Requirements: 6.1, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 11.7, 12.2_

  - [x] 4.3 Add the Storeroom room
    - Add the `storeroom` room with `oil can` in `items`, a `south` exit, and the exact last sentence
    - Add `ITEM_TEXT` and `ITEM_DETAILS` for the oil can
    - _Requirements: 8.1, 8.6, 8.7, 8.8, 8.9, 8.10, 11.1, 11.2, 11.7_

- [x] 5. Checkpoint - Check the lamp and the doors
  - Ask the user to open `index.html` and try the lamp and door commands so far, and ask if questions arise.

- [x] 6. Add the generic take command
  - [x] 6.1 Add the item names, key helper and `takeItem`
    - Add `ITEM_NAMES` and `ROOM_KEY_IDS`
    - Add `findRoomKey(room)` and the shared `takeItem(state, itemId, line)` helper
    - Reuse `takeItem` in `handleTakeLamp` without changing its replies
    - _Requirements: 10.2, 10.16, 10.17, 10.18, 10.19, 10.20_

  - [x] 6.2 Rewrite `handleTakeKey` to use `findRoomKey`
    - Order: take the key in the room, then "You already carry the key.", then "There is no key here."
    - Keep the existing Iron_Key reply
    - _Requirements: 10.7, 10.8, 10.9, 10.10, 10.11, 10.12, 13.3_

  - [x] 6.3 Add `handleTake` and its `runCommand` branch
    - Place it after the `take lamp` and `take key` branches
    - Replies: taken, already carried, not here
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.13, 10.14, 10.15_

  - [x] 6.4 Add item text for the keys and the lighter
    - Add `ITEM_TEXT` and `ITEM_DETAILS` for `brass key`, `rusty key` and `lighter`
    - Use the exact rusty key item text from the requirements
    - Add examine aliases `small brass key`, `drawers` and `book`, and make `examine key` use `findRoomKey`
    - _Requirements: 9.6, 11.1, 11.2, 11.3, 11.4, 11.8_

- [x] 7. Add the drawer and the book
  - [x] 7.1 Add `handleOpenDrawer` and its `runCommand` branch
    - Wrong room: "There is no drawer here."
    - Already open: same state and a short line
    - Otherwise set `drawerOpen`, add `lighter` and `rusty key` to the Kitchen items, and replace `details.drawer` with the open text
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7, 10.13, 10.15_

  - [x] 7.2 Change the Library shelves text
    - Update `details.shelves` so it mentions one book feeling wrong
    - _Requirements: 9.2, 9.11_

  - [x] 7.3 Add `handleOpenBook` and its `runCommand` branch
    - Wrong room, already open and found cases
    - Build the new Library with `{ ...room, items: [...] }` so the rug and trapdoor changes are kept
    - _Requirements: 9.7, 9.8, 9.9, 9.10, 9.11, 10.14_

- [x] 8. Add the Cellar light rule
  - [x] 8.1 Require a lit lamp for `needsLight` rooms in `handleGo`
    - No lamp: keep the pitch black line
    - Lamp carried but `lit` is false: stay put and show the "lamp gives no light" line
    - Lit lamp: move on and keep the existing Cellar fear cost and entry fear
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9. Final checkpoint - Walk through the game
  - Ask the user to play through the walkthrough from the design in the browser, and ask if questions arise.
  - _Requirements: 12.5, 12.6, 12.7, 13.1, 13.2, 13.4, 13.6, 13.7, 13.8_

## Notes

- No test tasks are included. The developer tests in the browser.
- Each task references specific requirements for traceability.
- Hints, help text, `applyFear` and `applyLies` do not change.
- All tasks edit `game.js`, so each runs in its own wave.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["3.2"] },
    { "id": 5, "tasks": ["3.3"] },
    { "id": 6, "tasks": ["3.4"] },
    { "id": 7, "tasks": ["4.1"] },
    { "id": 8, "tasks": ["4.2"] },
    { "id": 9, "tasks": ["4.3"] },
    { "id": 10, "tasks": ["5"] },
    { "id": 11, "tasks": ["6.1"] },
    { "id": 12, "tasks": ["6.2"] },
    { "id": 13, "tasks": ["6.3"] },
    { "id": 14, "tasks": ["6.4"] },
    { "id": 15, "tasks": ["7.1"] },
    { "id": 16, "tasks": ["7.2"] },
    { "id": 17, "tasks": ["7.3"] },
    { "id": 18, "tasks": ["8.1"] },
    { "id": 19, "tasks": ["9"] }
  ]
}
```
