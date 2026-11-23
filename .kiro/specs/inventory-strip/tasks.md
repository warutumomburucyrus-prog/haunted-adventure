# Implementation Plan: Inventory Strip

## Overview

Add a bar under the status bar that shows only the items the player carries: a dim "CARRYING:" label followed by one pixel-art icon per carried item, or the dim line "CARRYING: NOTHING". There are no fixed slots, empty outlines or placeholders. The strip keeps a constant height. The work goes in small steps: HTML, then CSS, then the data and functions in game.js, then the two call lines that wire it in.

Rules for every task:
- Read the current index.html, style.css and game.js before editing, and keep any changes the developer made by hand.
- Make only the one small change the task describes.
- Do not edit `processCommand`, `runCommand`, the game state, fear, hints or the lying narrator logic.
- Give every new function a comment of 1 to 2 lines.
- There are no tests of any kind. The developer checks the result in the browser.

## Tasks

- [x] 1. Add the header wrapper and the strip to index.html
  - [x] 1.1 Wrap `#status-bar` in a new `#header` div and add the empty `#inventory-strip` div
    - Keep the status bar markup exactly as it is. Put `<div id="inventory-strip" role="group" aria-label="Inventory"></div>` directly after it, inside `#header`.
    - Keep `class="starting"` on the body.
    - _Requirements: 1.1, 1.4, 8.3_

- [x] 2. Add the strip styles to style.css
  - [x] 2.1 Move the pinned-header rules from `#status-bar` to a new `#header` rule
    - Remove `flex: 0 0 auto`, `position: sticky`, `top: 0` and `z-index` from `#status-bar` and put them on `#header`. Leave the other `#status-bar` rules alone.
    - _Requirements: 1.2, 1.3, 10.1_

  - [x] 2.2 Add the `#inventory-strip` rule and the `.strip-label` rule
    - Background `#0a0a0a`, text `#33ff66`, monospace, one flex row with no wrapping, `overflow: hidden`.
    - Fixed height of `calc(var(--icon-size, 32px) + 13px)` so the height is the same with 0 to 6 icons.
    - `.strip-label` is dim, `white-space: nowrap`, and used for both "CARRYING:" and "CARRYING: NOTHING".
    - _Requirements: 1.4, 1.5, 7.7, 9.5, 9.7_

  - [x] 2.3 Add the rule that hides the strip while the loading screen shows
    - Add `body.starting #inventory-strip { display: none; }`. No script is involved.
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 2.4 Add the `.carried-icon` and `.carried-icon svg` rules
    - Square icon with `flex: 0 1 var(--icon-size, 32px)`, `min-width: 24px`, `max-width: var(--icon-size, 32px)` and `aspect-ratio: 1 / 1`. The SVG fills the icon.
    - Do not add any rule for empty slots or outlines.
    - _Requirements: 2.2, 9.4, 9.6_

  - [x] 2.5 Add the pickup flash, the lit-lamp flicker and the reduced-motion rules
    - Add `.carried-icon.flash` with the `icon-flash` keyframes, using `var(--flash-ms, 600ms)`.
    - Add `.carried-icon.lamp-lit .px-l` with the `flame-flicker` keyframes (1.6s cycle).
    - Add `animation: none` for both inside the existing `prefers-reduced-motion` block, or create one if there is none.
    - _Requirements: 4.6, 4.7, 6.3, 6.5_

- [x] 3. Add the inventory strip code to game.js
  - [x] 3.1 Add the two layout constants at the top of game.js
    - Add `INVENTORY_ICON_PX = 32` and `INVENTORY_FLASH_MS = 600` with the other constants, above all functions. Comment the allowed ranges (24 to 40 and 200 to 2000).
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 3.2 Add `STRIP_ITEM_NAMES` and the two presentation variables
    - Add `STRIP_ITEM_NAMES` mapping `lamp`, `brass key`, `rusty key`, `key` (named "iron key"), `lighter` and `oil can` to their names. Put it just above `updateStatusBar`.
    - `STRIP_ITEM_NAMES` is separate from the existing `ITEM_NAMES` in game.js (what the player may type, used by `handleTake` and `handleExamine`). Do not change, rename or redeclare `ITEM_NAMES`.
    - Add `let lastShownItems = null;` and `let lastStripSignature = null;` as presentation variables. Do not add anything to `gameState`.
    - _Requirements: 2.5, 2.6, 5.1, 5.2, 6.7, 7.1, 7.2_

  - [x] 3.3 Add `KEY_ROWS` and `ICONS` for the keys, lighter and oil can
    - Use the 12 by 12 grids and palettes from design.md. The brass key and rusty key share `KEY_ROWS`.
    - Check that every grid has 12 rows of exactly 12 characters.
    - _Requirements: 3.1, 3.3, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [x] 3.4 Add `LAMP_PALETTE` and `LAMP_LOOKS` (dark, full, lit)
    - Use the grids from design.md. Check that every row has exactly 12 characters.
    - _Requirements: 3.1, 3.4, 4.1, 4.2, 4.3_

  - [x] 3.5 Add `buildIconSvg(icon)`
    - Check the whole grid first. Return `null` if it is not 12 rows of 12 characters or uses a character that is not in the palette. Otherwise return inline SVG with `shape-rendering="crispEdges"`, `viewBox="0 0 12 12"` and a `px-<letter>` class on each rect.
    - _Requirements: 3.2, 3.10, 3.11_

  - [x] 3.6 Add `getLampLook(state)`
    - Return "lit" if `lit`, else "full" if `fueled`, else "dark". Read only `lit` and `fueled`.
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x] 3.7 Add `updateInventoryStrip(state, quiet)`
    - Read only `carriedItems`, `fueled` and `lit`. Never write to the state. Wrap the body in `try/catch`.
    - Build the list of icons in `carriedItems` order. Draw a repeated id once. Skip ids with no entry in `STRIP_ITEM_NAMES`, no icon or an invalid icon, with no message. Read item names from `STRIP_ITEM_NAMES`, never from `ITEM_NAMES`.
    - Skip the redraw if the list and the lamp look are the same as the last update (use `lastStripSignature`).
    - Show the dim "CARRYING: NOTHING" line when the list is empty, otherwise the dim "CARRYING:" label followed by the icons. Create no element for items that are not carried.
    - Set `title` and `aria-label` to the item name on each carried icon only. Add `lamp-lit` to the lamp icon while the lamp is lit. Set `--icon-size` and `--flash-ms` on the strip from the constants.
    - Add the `flash` class, removed after `INVENTORY_FLASH_MS`, only to icons newly carried since the last update. Play no flash when `quiet` is true, on the first update after init (`lastShownItems` is `null`), or when reduced motion is set. Always update `lastShownItems`.
    - Add a comment saying the strip always shows the true state, even when the narrator lies.
    - _Requirements: 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.11, 4.4, 4.5, 5.1, 5.2, 5.7, 5.8, 6.1, 6.2, 6.4, 6.5, 6.6, 6.7, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 10.3, 10.4_

  - [x] 3.8 Call `updateInventoryStrip(gameState, false)` right after `updateStatusBar(gameState)` in `init`
    - Add one line and change nothing else in `init`.
    - _Requirements: 5.3, 5.4, 6.7, 10.1_

  - [x] 3.9 Call `updateInventoryStrip` right after `updateStatusBar(gameState)` in `handleSubmit`
    - Add one line with a short comment. Pass `true` as `quiet` when the typed command is `restart`, using the same `normalizeCommand` check that `processCommand` uses. Do not edit `processCommand` or `runCommand`.
    - Change nothing else in `handleSubmit`.
    - _Requirements: 5.3, 5.5, 5.6, 5.9, 6.6, 10.1, 10.2_

- [x] 4. Checkpoint - Confirm the strip is wired in
  - Confirm the strip is called next to both `updateStatusBar(gameState)` calls, and ask the user if questions arise.

## Notes

- There are no tests of any kind. The developer checks the result in the browser.
- Make one small change at a time and explain what it does.
- Each task lists the requirements it covers.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["2.3"] },
    { "id": 4, "tasks": ["2.4"] },
    { "id": 5, "tasks": ["2.5"] },
    { "id": 6, "tasks": ["3.1"] },
    { "id": 7, "tasks": ["3.2"] },
    { "id": 8, "tasks": ["3.3"] },
    { "id": 9, "tasks": ["3.4"] },
    { "id": 10, "tasks": ["3.5"] },
    { "id": 11, "tasks": ["3.6"] },
    { "id": 12, "tasks": ["3.7"] },
    { "id": 13, "tasks": ["3.8"] },
    { "id": 14, "tasks": ["3.9"] },
    { "id": 15, "tasks": ["4"] }
  ]
}
```
