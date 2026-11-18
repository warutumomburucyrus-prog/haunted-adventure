# Requirements Document

## Introduction

The lying narrator makes room descriptions untrustworthy when the player is afraid. Each room can hold a list of lies in its room data. A lie has a minimum Fear and a replacement line. When the Game shows a room description and Fear is at or above the minimum of a lie, the Game shows the replacement line in place of the true line. Lies change only the text on screen. They never change the Game_State. The inventory command, results of actions, the Status_Bar, the Threshold_Lines and the ending text always tell the truth.

## Glossary

- **Game**: The Haunted Adventure web page and its game.js logic.
- **Game_State**: The object in game.js that holds the current room, carried items, fear, room data and ending status.
- **Fear**: The whole number from 0 to 100 stored in the Game_State. Only game code changes it.
- **Room_Data**: The object for one room inside the Game_State, including its description, arrival text, items and lies.
- **True_Line**: A sentence of room description text, arrival text or item line that the Game shows when no lie applies.
- **Lie**: An entry in the Room_Data with three parts: a minimum Fear, the True_Line it replaces, and a replacement line. A Lie may also have a condition on the Game_State, such as an item not being carried.
- **Active_Lie**: A Lie whose minimum Fear is at or below the Fear used for the current command and whose condition, if any, is met.
- **Lie_Fear**: The Fear stored in the Game_State at the moment the player submits a command, before that command's own Fear_Cost is added.
- **Description_Text**: The text the Game shows when the player looks at a room or arrives in it. This covers the room description, the arrival text and the item lines for items lying in the room.
- **Truthful_Text**: Text that never lies: the inventory command output, the results of actions, the Status_Bar, the Threshold_Lines, the game over text and the escape text.
- **Hallway**: The room with the id "hallway".
- **Library**: The room with the id "library".
- **Cellar**: The room with the id "cellar".
- **Status_Bar**: The strip at the top of the page that shows the room name and Fear.
- **Threshold_Line**: The unsettling line shown the first time Fear passes a Threshold.

## Requirements

### Requirement 1: Lies stored in room data

**User Story:** As a developer, I want lies written in the room data, so that I can find and edit them easily.

#### Acceptance Criteria

1. WHERE a room defines a list of Lies in the Room_Data, THE Game SHALL read that list as the only source of Lies for that room, and the list SHALL hold 0 to 10 Lies.
2. IF a room has no list of Lies or its list is empty, THEN THE Game SHALL show only the True_Lines of that room at every Fear value from 0 to 100, and SHALL NOT show an error to the player.
3. THE Game SHALL store each Lie with three fields: a minimum Fear (a whole number from 1 to 100), the exact True_Line it replaces, and a replacement line of 1 to 200 characters.
4. WHEN the Game shows a room description, THE Game SHALL mark a Lie as an Active_Lie only if the current Lie_Fear is greater than or equal to the minimum Fear of that Lie, and the AI narrator SHALL NOT decide which Lie applies.
5. IF a Lie names a True_Line that is not found in its room, or has a missing or invalid field, THEN THE Game SHALL ignore that Lie, show the True_Line text unchanged, and leave the current room, items carried and Fear unchanged.
6. IF two or more Active_Lies replace the same True_Line, THEN THE Game SHALL show the replacement line of the Active_Lie with the highest minimum Fear.
7. WHEN the developer edits a Lie in the Room_Data and reloads the page, THE Game SHALL use the edited Lie without any other change to game.js.

### Requirement 2: Showing lies in descriptions

**User Story:** As a player, I want the house to misdescribe itself when I am afraid, so that I feel I cannot trust what I read.

#### Acceptance Criteria

1. WHEN the player looks at a room and a Lie for that room is an Active_Lie, THE Game SHALL show the replacement line in place of the True_Line that the Lie replaces, and SHALL NOT show that True_Line in the same output.
2. WHEN the player arrives in a room and a Lie for that room is an Active_Lie, THE Game SHALL show the replacement line in place of the True_Line that the Lie replaces, in both the arrival text and the room description shown with it, and SHALL NOT show that True_Line in either.
3. WHEN the player looks at or arrives in a room and no Lie for that room is an Active_Lie, THE Game SHALL show every True_Line of that room unchanged.
4. WHEN the player looks at or arrives in a room and more than one Lie for that room is an Active_Lie, THE Game SHALL replace each True_Line with its own replacement line and SHALL show every other line of the description unchanged.
5. WHILE Lie_Fear is below the minimum Fear of a Lie, THE Game SHALL show the True_Line for that Lie whenever the room is shown, even if other Lies for the same room are Active_Lies.
6. WHEN the Game shows a replacement line, THE Game SHALL leave the current room, the items carried, the room contents, and the Fear number unchanged by that replacement.
7. WHEN the player enters the inventory command, takes an action, or reads the status bar, a threshold line, or the ending text, THE Game SHALL show the true text with no replacement line, regardless of Lie_Fear.

### Requirement 3: Lies never change the game state

**User Story:** As a developer, I want lies to be text only, so that game code stays the single source of truth.

#### Acceptance Criteria

1. WHEN the Game shows an Active_Lie, THE Game SHALL leave every Game_State field (current room, items carried, items in each room, and fear number) identical to the values it would hold if the True_Line had been shown instead.
2. WHEN a lie describes an exit as blocked or missing, THE Game SHALL still move the player to the true destination room when the player enters the matching go command for that exit.
3. WHEN a lie describes an item as carried, THE Game SHALL keep that item in its true location, and WHEN the player enters the inventory command, THE Game SHALL list exactly the items in the true carried list, with no additions and no omissions.
4. WHEN a lie describes an item as absent from the room, THE Game SHALL still let the player take that item with the matching take command if the item is truly in that room.
5. WHEN any command is processed, THE Game SHALL leave the Room_Data lists of Lies with the same entries, in the same order, as before the command.

### Requirement 4: Text that never lies

**User Story:** As a player, I want some text to stay honest, so that I always have a reliable way to learn the true state of the game.

#### Acceptance Criteria

1. WHEN the player enters the inventory command, THE Game SHALL show Truthful_Text listing exactly the items in the player's carried-items state, with no omitted, added or renamed items, at every Fear value from 0 to 100.
2. WHEN the player enters a command that performs an action (take lamp, take key, move rug, pull stone, go, unlock door), THE Game SHALL show a result message that matches the actual change or non-change in game state, at every Fear value from 0 to 100.
3. IF a command that performs an action fails (for example, the item is not in the room, the door is locked, or the player has no key), THEN THE Game SHALL show a result message stating that the action failed and the reason. THE Game SHALL leave the game state unchanged, at every Fear value from 0 to 100.
4. WHILE the game is running, THE Status_Bar SHALL show the room name of the player's current room and the current Fear value as an integer from 0 to 100, and SHALL update both within the same command turn in which they change, at every Fear value.
5. WHEN Fear passes a Threshold, THE Game SHALL show the Threshold_Line exactly as written in the game data, with no lie substitution, at every Fear value.
6. WHEN the game ends because Fear reaches 100, THE Game SHALL show the game over text exactly as written in the game data, with no lie substitution.
7. WHEN the player escapes through the front door, THE Game SHALL show the escape text exactly as written in the game data, with no lie substitution.
8. WHEN the player enters the restart command, THE Game SHALL reset the game state to its starting values and show the introduction text exactly as written in the game data, with no lie substitution.

### Requirement 5: Hallway lie

**User Story:** As a player, I want the hallway to claim the front door is open, so that I am tempted to run for it.

#### Acceptance Criteria

1. THE Hallway Room_Data SHALL contain exactly one Lie with minimum Fear 50 that replaces the True_Line about the front door standing silent and shut.
2. THE replacement line of the Hallway Lie SHALL describe the front door as standing open to the night, using the words "open" and "night", and SHALL be no longer than 20 words.
3. WHILE Lie_Fear is 50 or more, WHEN the player looks at the Hallway or arrives in the Hallway, THE Game SHALL show the replacement line in place of the True_Line about the front door and SHALL show all other Hallway lines unchanged.
4. WHILE Lie_Fear is below 50, WHEN the player looks at the Hallway or arrives in the Hallway, THE Game SHALL show the True_Line about the front door and SHALL NOT show the replacement line.
5. WHEN the player enters the command "go south" in the Hallway, regardless of Lie_Fear, THE Game SHALL show the true blocked message "The front door is locked. It will not budge." and SHALL keep the player in the Hallway.
6. WHEN the Game shows the replacement line, THE Game SHALL leave the current room, the items carried, the Fear value and the locked state of the front door unchanged.

### Requirement 6: Library lie

**User Story:** As a player, I want the library to claim the way back is bricked up, so that I fear I am trapped.

#### Acceptance Criteria

1. THE Library Room_Data SHALL contain exactly one Lie with a minimum Fear of 50 that replaces the True_Line about the light coming from the way the player came in.
2. THE replacement line of the Library Lie SHALL state that the way back to the Hallway is bricked up and that only bare wall remains, in no more than 200 characters.
3. WHILE Lie_Fear is 50 or more, WHEN the player looks at the Library, THE Game SHALL show the replacement line in place of the True_Line about the way back and SHALL show every other line of the Library description unchanged.
4. WHILE Lie_Fear is 50 or more, WHEN the player arrives in the Library, THE Game SHALL show the replacement line in place of the True_Line about the way back in the room description shown with the arrival, and SHALL show every other line of that description unchanged.
5. WHILE Fear is below 50, WHEN the player looks at the Library or arrives in the Library, THE Game SHALL show the True_Line about the way back and SHALL NOT show the replacement line.
6. WHILE the way back is described as bricked up, WHEN the player enters "go south" in the Library, THE Game SHALL move the player to the Hallway, SHALL show the Hallway description, and SHALL leave the items carried unchanged.

### Requirement 7: Cellar steps lie

**User Story:** As a player, I want the cellar to claim the steps have collapsed, so that I fear I cannot climb out.

#### Acceptance Criteria

1. THE Cellar Room_Data SHALL contain exactly one Lie with a minimum Fear of 50 that replaces the True_Line about the steps leading back up.
2. THE replacement line of the Cellar steps Lie SHALL state that the steps up are collapsed and SHALL be 200 characters or fewer.
3. WHILE Lie_Fear is 50 or more (Lie_Fear range 0 to 100), WHEN the player looks at the Cellar or arrives in the Cellar, THE Game SHALL show the replacement line in place of the True_Line about the steps.
4. WHILE Lie_Fear is below 50, WHEN the player looks at the Cellar or arrives in the Cellar, THE Game SHALL show the True_Line about the steps and SHALL NOT show the replacement line.
5. WHILE the Cellar steps Lie is shown, WHEN the player enters "go up" in the Cellar, THE Game SHALL move the player to the Library, leave the Fear value unchanged by the Lie, and show a result line that does not state the steps are collapsed.
6. WHEN the player enters "go up" in the Cellar, THE Game SHALL apply the same movement result to the Library whether Lie_Fear is below 50 or 50 or more.

### Requirement 8: Cellar key lie

**User Story:** As a player, I want the cellar to claim I already hold the key when I do not, so that I might leave without it.

#### Acceptance Criteria

1. THE Cellar Room_Data SHALL contain exactly one key Lie with a minimum Fear of 75 (on the 0 to 100 Fear scale) that replaces the True_Line for the key lying in the hollow.
2. THE replacement line of the Cellar key Lie SHALL be 1 to 2 sentences, 200 characters or fewer, and SHALL describe the key as already in the hand of the player.
3. WHILE Lie_Fear is 75 or more, the player does not carry the key, and the key is lying in the Cellar, WHEN the player looks at the Cellar, THE Game SHALL show the replacement line in place of the True_Line for the key.
4. WHILE Lie_Fear is below 75, the player does not carry the key, and the key is lying in the Cellar, WHEN the player looks at the Cellar, THE Game SHALL show the True_Line for the key.
5. WHEN the player enters take key in the Cellar while the key is lying in the Cellar, THE Game SHALL add the key to the carried items, remove the key from the Cellar, show the true result of the action, and leave Fear and every other game fact unchanged by the Lie.
6. WHILE the player does not carry the key, WHEN the player enters the inventory command, THE Game SHALL show an inventory that does not list the key, whatever the Lie_Fear value.
7. WHILE the player carries the key, THE Game SHALL show the True_Line for any text about the key and SHALL NOT show the replacement line.
8. WHILE the stone has not been pulled out and the key is not lying in the Cellar, THE Game SHALL show no key text and the Cellar key Lie SHALL add no text, whatever the Lie_Fear value.
9. IF the player enters the take key command in the Cellar while the key is not lying in the Cellar, THEN THE Game SHALL show a refusal that the key cannot be taken, leave the carried items unchanged, and show no replacement line.

### Requirement 9: Existing behavior stays working

**User Story:** As a developer, I want the new feature to leave the rest of the game working, so that nothing I built breaks.

#### Acceptance Criteria

1. WHEN the player enters any command or synonym that the Game accepted before this feature was added, THE Game SHALL produce the same reply text and the same changes to room, items carried and Fear as it produced before this feature was added, at every Fear value from 0 to 100.
2. WHEN the player performs any action that has a Fear cost, reaches a Threshold, or reaches the game over Fear value, THE Game SHALL apply the same Fear cost, show the same Threshold_Line once per Threshold, and apply the same game over rule as before this feature was added.
3. WHEN the player interacts with the hidden key, the rug, the trapdoor or the stone, THE Game SHALL produce the same reply text and the same changes to room, items carried and Fear as it produced before this feature was added, at every Fear value from 0 to 100.
4. WHEN the player carries the key and enters unlock door in the Hallway, THE Game SHALL show the escape text unchanged and end the game, at every Fear value from 0 to 100.
5. WHILE Fear is below 50, THE Game SHALL show Description_Text that matches, character for character, the text it showed before this feature was added.
6. THE Game SHALL be built with plain HTML, CSS and JavaScript and SHALL NOT load any framework.
