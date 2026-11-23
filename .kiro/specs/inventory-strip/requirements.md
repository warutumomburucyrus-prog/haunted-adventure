# Requirements Document

## Introduction

The inventory strip is a presentation-only bar that sits directly under the status bar, inside one header wrapper that holds both. It shows only the items the player currently carries. It draws one pixel-art icon in full green for each item id in `carriedItems`, in pickup order. It has no fixed slots, no empty outlines, no placeholders, and no names or tooltips for items the player does not carry, so the strip never reveals what exists in the game. A dim "CARRYING:" label comes first. When nothing is carried, the strip shows the dim line "CARRYING: NOTHING". The strip keeps the same height whether it holds zero icons or six. It reads the game state and never writes to it. Commands, state, fear, hints, the lying narrator and all game rules stay unchanged.

## Glossary

- **Inventory_Strip**: The bar placed directly under the Status_Bar (`#inventory-strip`) that shows the carried items.
- **Status_Bar**: The existing green header strip (`#status-bar`) that shows the title, room, fear and sound button.
- **Header**: The single wrapper element (`#header`) in index.html that contains the Status_Bar and the Inventory_Strip as normal blocks. It is the Pinned_Header.
- **Pinned_Header**: The Header, fixed at the top of the page so that it never scrolls away.
- **Carried_Icon**: One icon drawn in the Inventory_Strip for one item id in `carriedItems`.
- **Carrying_Label**: The dim text "CARRYING:" shown at the start of the Inventory_Strip when at least one item is carried.
- **Nothing_Line**: The dim text "CARRYING: NOTHING" shown in the Inventory_Strip when no item is carried.
- **Item_Name**: The name given to a Carried_Icon: "lamp", "brass key", "rusty key", "iron key", "lighter" or "oil can".
- **Iron_Key**: The item with the id "key". Its Item_Name is "iron key".
- **Game_State**: The existing `gameState` object. Its `carriedItems`, `fueled` and `lit` fields are the only fields the Inventory_Strip reads.
- **Icon**: A pixel picture of 12 columns by 12 rows, written in game.js as an array of 12 strings and drawn with a small color palette.
- **Icon_Renderer**: The code in game.js that turns an Icon into an inline SVG with `shape-rendering="crispEdges"`.
- **Lamp_Look**: One of three pictures of the lamp: dark (empty), full (fueled and not lit), or lit (with a flame).
- **Pickup_Flash**: A single short brightening of a Carried_Icon when its item becomes carried.
- **Reduced_Motion**: The browser setting that matches the media query `prefers-reduced-motion: reduce`.
- **Loading_Screen**: The existing cover shown while the body has the class "starting".
- **Layout_Constants**: Named constants at the top of game.js for the icon size and the Pickup_Flash time.
- **Strip_Height**: The fixed height of the Inventory_Strip, the same for every state.
- **Small_Phone**: A viewport 320 pixels wide.

## Requirements

### Requirement 1: Header structure and strip placement

**User Story:** As a player, I want an inventory bar under the status bar, so that I can see what I carry at all times.

#### Acceptance Criteria

1. THE Header SHALL be one element in index.html that contains the Status_Bar followed directly by the Inventory_Strip, with no other visible element between them.
2. THE Pinned_Header styles (`flex: 0 0 auto`, `position: sticky`, `top: 0` and a `z-index`) SHALL be applied to the Header, and the Status_Bar and the Inventory_Strip SHALL be normal blocks inside the Header.
3. WHILE the output area scrolls, THE Header SHALL remain fully visible at the same screen position as before the scroll began.
4. THE Inventory_Strip SHALL use a black background and green monospace text, using the same background color, text color and font family as the terminal output area.
5. THE Inventory_Strip SHALL keep the same Strip_Height whether it holds zero Carried_Icons, one, or six, so that the Header height does not change and the output area does not move when the first item is picked up.

### Requirement 2: Carried items only

**User Story:** As a player, I want the strip to show only what I carry, so that it never hints at items I have not found.

#### Acceptance Criteria

1. THE Inventory_Strip SHALL draw one Carried_Icon, in full green, for each item id in `carriedItems`, in the order of `carriedItems`.
2. THE Inventory_Strip SHALL contain no fixed slots, no empty outlines, no placeholders and no text for items that are not in `carriedItems`.
3. WHEN `carriedItems` gains or loses an item id, THE Inventory_Strip SHALL update to show exactly the item ids now in `carriedItems` before the next player command is accepted.
4. IF `carriedItems` contains the same item id more than once, THEN THE Inventory_Strip SHALL draw one Carried_Icon for that item id.
5. IF `carriedItems` contains an item id that has no Icon, THEN THE Inventory_Strip SHALL skip that item id, draw the remaining Carried_Icons and SHALL NOT display an error to the player.
6. THE Inventory_Strip SHALL map the Iron_Key item id "key" to the Item_Name "iron key", and the item ids "lamp", "brass key", "rusty key", "lighter" and "oil can" to the Item_Names with the same spelling.

### Requirement 3: Pixel-art icons

**User Story:** As a player, I want clear pixel-art icons, so that each item is easy to recognise.

#### Acceptance Criteria

1. THE Icon_Renderer SHALL draw every Icon from a grid of exactly 12 columns by 12 rows, defined in game.js as an array of 12 strings of 12 characters each, plus a color palette that maps each non-empty character to one color.
2. WHEN an Icon is drawn, THE Icon_Renderer SHALL output the Icon as inline SVG with `shape-rendering="crispEdges"`.
3. THE Inventory_Strip SHALL use no image files, no external libraries and no downloads.
4. THE Icon of the lamp SHALL show a handle and a glass, each made of at least 4 filled cells, with the glass in a different palette color from the handle.
5. THE Icon of the brass key SHALL show a key shape (a round bow and a shaft with at least 1 tooth) drawn in brass-yellow palette colors and occupying no more than 8 columns by 8 rows of the grid.
6. THE Icon of the rusty key SHALL use the same key shape as the brass key, drawn in palette colors with a more orange and darker hue than the brass key.
7. THE Icon of the Iron_Key SHALL use grey-green palette colors and a shaft and bow at least 1 cell thicker than those of the brass key.
8. THE Icon of the lighter SHALL show a rectangular lighter body at least 3 cells wide and 5 cells tall, with a flame or striker part of a different palette color at the top.
9. THE Icon of the oil can SHALL show a can body at least 5 cells wide and 4 cells tall, with a spout extending at least 3 cells from the body.
10. WHEN an Icon is drawn at an icon size of 32 pixels, THE Icon_Renderer SHALL render each of the 144 grid cells as a square of 32/12 pixels per side with sharp edges and no anti-aliased blur.
11. IF an Icon definition does not have exactly 12 rows of 12 characters, or uses a character that is not in its palette, THEN THE Icon_Renderer SHALL draw no cells for the invalid Icon, THE Inventory_Strip SHALL skip that item id, and the game state SHALL stay unchanged.

### Requirement 4: Lamp looks

**User Story:** As a player, I want the lamp icon to show its condition, so that I can see whether it is empty, full or burning.

#### Acceptance Criteria

1. WHILE the lamp is carried and `fueled` is false and `lit` is false, THE Inventory_Strip SHALL show the dark Lamp_Look, which has no flame and no fuel fill.
2. WHILE the lamp is carried and `fueled` is true and `lit` is false, THE Inventory_Strip SHALL show the full Lamp_Look, which has a fuel fill and no flame.
3. WHILE the lamp is carried and `lit` is true, THE Inventory_Strip SHALL show the lit Lamp_Look with a flame, regardless of the value of `fueled`.
4. WHEN `fueled` or `lit` changes while the lamp is carried, THE Inventory_Strip SHALL update the Lamp_Look to match the new values within 100 milliseconds.
5. THE Inventory_Strip SHALL choose the Lamp_Look only from `fueled` and `lit`, and SHALL NOT use the fear level, the current room, or the narrator text to choose it.
6. WHILE the Lamp_Look is lit and Reduced_Motion is not set, THE Inventory_Strip SHALL animate the lamp flame with a repeating flicker of 1 to 3 seconds per cycle.
7. WHILE Reduced_Motion is set, THE Inventory_Strip SHALL show the lit Lamp_Look with a static flame and no animation.

### Requirement 5: Read-only truthful updates

**User Story:** As a player, I want the strip to always be correct, so that I can trust it even when the narrator lies.

#### Acceptance Criteria

1. THE Inventory_Strip SHALL read only `carriedItems`, `fueled` and `lit` from the Game_State.
2. THE Inventory_Strip SHALL leave every Game_State value unchanged, so that a snapshot of the Game_State taken before an Inventory_Strip update is identical to a snapshot taken after it.
3. WHEN `updateStatusBar` runs, THE game SHALL update the Inventory_Strip inside `updateStatusBar` or right next to its call, so that the Status_Bar and the Inventory_Strip are always updated together from the same Game_State.
4. WHEN `init` finishes, THE Inventory_Strip SHALL be updated from the current `carriedItems`, `fueled` and `lit` values of the Game_State before the player can enter the first command.
5. WHEN a command has been processed, THE Inventory_Strip SHALL be updated from the current `carriedItems`, `fueled` and `lit` values of the Game_State in the same update as the Status_Bar, whether or not the command changed the Game_State.
6. WHEN a restart has been processed, THE Inventory_Strip SHALL be updated from the reset Game_State in the same update as the Status_Bar, so that it shows the starting `carriedItems`, `fueled` and `lit` values.
7. WHILE the fear level is at or above the threshold at which room descriptions may lie, THE Inventory_Strip SHALL show the same `carriedItems`, `fueled` and `lit` values as the Game_State, and SHALL NOT use any lie text from the room data.
8. THE game.js file SHALL contain a comment next to the Inventory_Strip update code stating that the Inventory_Strip always shows the true state, even when the narrator lies.
9. THE Inventory_Strip SHALL leave the behavior of `processCommand`, `runCommand`, fear, hints, the lying narrator and all game rules unchanged, so that the same command sequence produces the same Game_State and the same reply text with or without the Inventory_Strip.

### Requirement 6: Pickup flash

**User Story:** As a player, I want a new item to flash once, so that I notice what I just picked up.

#### Acceptance Criteria

1. WHEN the Inventory_Strip is updated and an item id is in `carriedItems` that was not in `carriedItems` at the previous update, THE Inventory_Strip SHALL play the Pickup_Flash exactly once on the Carried_Icon of that item, and on no other Carried_Icon.
2. WHEN the Inventory_Strip is updated and several item ids are newly in `carriedItems`, THE Inventory_Strip SHALL play one Pickup_Flash on each of those Carried_Icons.
3. THE Pickup_Flash SHALL last for the number of milliseconds defined for it in the Layout_Constants, with a tolerance of 50 milliseconds.
4. WHEN the Inventory_Strip is updated and no item id is newly in `carriedItems`, THE Inventory_Strip SHALL play no Pickup_Flash.
5. WHILE Reduced_Motion is set, THE Inventory_Strip SHALL show the newly carried Carried_Icon in full green without playing the Pickup_Flash.
6. WHEN a restart changes `carriedItems`, THE Inventory_Strip SHALL show the Carried_Icons for the reset `carriedItems` without playing any Pickup_Flash.
7. WHEN the first update after `init` finishes finds items already in `carriedItems`, THE Inventory_Strip SHALL show those Carried_Icons without playing a Pickup_Flash.

### Requirement 7: Labels and carrying text

**User Story:** As a player using a screen reader or a mouse hover, I want each carried item named, and I want to see a clear line when I carry nothing, so that I always know what the strip says.

#### Acceptance Criteria

1. THE Inventory_Strip SHALL give every Carried_Icon a `title` attribute whose value is exactly the Item_Name of that item.
2. THE Inventory_Strip SHALL give every Carried_Icon an `aria-label` attribute whose value is exactly the Item_Name of that item.
3. THE Inventory_Strip SHALL give no `title` and no `aria-label` for any item that is not in `carriedItems`.
4. WHILE `carriedItems` holds no item id, THE Inventory_Strip SHALL show the Nothing_Line, dim, and no Carried_Icon.
5. WHILE `carriedItems` holds at least one item id that has an Icon, THE Inventory_Strip SHALL show the Carrying_Label, dim, followed by the Carried_Icons, and SHALL NOT show the Nothing_Line.
6. THE Nothing_Line wording SHALL match the inventory command's "You carry nothing" reply in meaning, with the text "CARRYING: NOTHING".
7. THE Inventory_Strip SHALL show the Carrying_Label and the Nothing_Line in the same dim color and the same font as each other.

### Requirement 8: Loading screen visibility

**User Story:** As a player, I want the loading screen to stay clean, so that the strip does not spoil the start sequence.

#### Acceptance Criteria

1. WHILE the body has the class "starting", THE Inventory_Strip SHALL be hidden by the CSS rule `body.starting #inventory-strip { display: none; }`, so that it is not rendered and takes up no space on the page.
2. WHEN `beginIntro` removes the class "starting" from the body, THE Inventory_Strip SHALL become visible, showing the items currently carried according to the Game_State.
3. THE Inventory_Strip SHALL stay hidden from the first rendered frame while the body has the class "starting", using the CSS rule alone and no script.
4. IF `beginIntro` is never called, THEN THE Inventory_Strip SHALL remain hidden for as long as the body has the class "starting".

### Requirement 9: Small screen fit and constants

**User Story:** As a phone player, I want all my icons on one row, so that I never need to scroll sideways.

#### Acceptance Criteria

1. THE Layout_Constants SHALL define the icon size as a whole number of pixels from 24 to 40 inclusive.
2. THE Layout_Constants SHALL define the Pickup_Flash time as a whole number of milliseconds from 200 to 2000 inclusive.
3. THE Layout_Constants SHALL be placed at the top of game.js, above all function definitions, together with the other named constants.
4. WHILE the viewport is a Small_Phone and six items are carried, THE Inventory_Strip SHALL show the Carrying_Label and all six Carried_Icons on one row, with every Carried_Icon fully visible and none wrapped onto a second row.
5. WHILE the viewport is a Small_Phone, THE Inventory_Strip SHALL cause no horizontal scrolling, so the page scroll width is no greater than the viewport width.
6. IF the Carrying_Label and six Carried_Icons at the defined icon size and gaps would be wider than a Small_Phone viewport, THEN THE Inventory_Strip SHALL shrink the Carried_Icons so that all of them still fit on one row, with each Carried_Icon no smaller than 24 pixels.
7. THE Strip_Height SHALL be large enough to hold one row of Carried_Icons at the defined icon size.

### Requirement 10: Existing features keep working

**User Story:** As a player, I want everything else to work as before, so that the new strip does not break the game.

#### Acceptance Criteria

1. WHEN the Inventory_Strip is added or updated, THE Inventory_Strip SHALL leave the typewriter effect (character-by-character text reveal), sound, Loading_Screen, underscore cursor and Pinned_Header behaving the same as before the strip was added, with no change to their visible behavior or timing.
2. WHEN the player enters any command that existed before the Inventory_Strip was added, THE Inventory_Strip SHALL leave the command's reply text, its effect on the game state (current room, items carried, fear level) and its effect on the status bar the same as before the strip was added.
3. IF the Inventory_Strip cannot be displayed or updated, THEN THE game SHALL keep accepting commands, show the usual replies and keep the game state unchanged.
4. THE Inventory_Strip SHALL be built with plain HTML, CSS and JavaScript only, with no frameworks or libraries, and each new function SHALL have a comment of 1 to 2 lines explaining what it does.
