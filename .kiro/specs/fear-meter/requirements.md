# Requirements Document

## Introduction

The fear meter adds a fear number to the Haunted Adventure game state. Fear rises as the player acts, rises faster in the cellar, and is shown in the status bar. Crossing fear thresholds shows unsettling lines. At 100 fear the Caretaker catches the player and the game ends until the player types restart. Only game code changes the fear number. The narrator never decides it.

## Glossary

- **Game**: The Haunted Adventure web page and its game.js logic.
- **Game_State**: The object in game.js that holds the current room, carried items, fear, and game-over status.
- **Fear**: A whole number from 0 to 100 stored in the Game_State.
- **Recognized_Command**: A command that processCommand matches to a known action (look, go with a valid direction, take lamp, inventory, examine and its synonyms, move rug and its synonyms, help, restart). Empty input and unknown input are not Recognized_Commands.
- **Fear_Cost**: The amount Fear rises for one Recognized_Command, set by the named constants.
- **Cellar**: The room with the id "cellar".
- **Status_Bar**: The strip at the top of the page (the #status-bar element).
- **Threshold**: A Fear value of 25, 50 or 75 that triggers a one-time warning line.
- **Threshold_Line**: The short unsettling line shown the first time Fear passes a Threshold.
- **Caretaker**: The unseen presence that haunts the player and ends the game at 100 Fear.
- **Game_Over**: The state in which the Caretaker has caught the player and the Game accepts only the restart command.
- **Fear_Constants**: The named constants at the top of game.js that hold every fear number.

## Requirements

### Requirement 1: Fear in the game state

**User Story:** As a developer, I want fear stored in the game state, so that game code is the single source of truth for it.

#### Acceptance Criteria

1. THE Game_State SHALL contain a Fear value stored as a whole number.
2. WHEN a new game starts, THE Game SHALL set Fear to 0.
3. THE Game SHALL keep Fear between 0 and 100 inclusive.
4. IF a Fear increase would raise Fear above 100, THEN THE Game SHALL set Fear to 100.
5. THE Game SHALL change Fear only through game code, and the AI narrator SHALL NOT change Fear.

### Requirement 2: Tunable fear constants

**User Story:** As a developer, I want the fear numbers in named constants, so that I can tune them easily.

#### Acceptance Criteria

1. THE Game SHALL define the Fear_Constants in a single block at the top of game.js, before any function definition.
2. THE Fear_Constants SHALL include named values for starting Fear (0), maximum Fear (100), normal Fear_Cost (1), cellar Fear_Cost (3), cellar entry Fear increase (10), and the Thresholds (25, 50, 75).
3. THE Game SHALL read every fear number used in game logic from the Fear_Constants, with no fear number written as a literal elsewhere in game.js.
4. WHEN the developer changes a value in the Fear_Constants and reloads the page, THE Game SHALL use the changed value in all fear calculations without any other edit to game.js.

### Requirement 3: Fear from commands

**User Story:** As a player, I want my actions to build fear, so that the house feels more threatening over time.

#### Acceptance Criteria

1. WHEN the player enters a Recognized_Command other than help, THE Game SHALL raise Fear by the normal Fear_Cost.
2. WHILE the player is in the Cellar, WHEN the player enters a Recognized_Command other than help, THE Game SHALL raise Fear by the cellar Fear_Cost instead of the normal Fear_Cost.
3. WHEN the player enters help in any room, including the Cellar, THE Game SHALL leave Fear unchanged.
4. WHEN the player enters empty input (no characters, or only spaces) or a command that is not a Recognized_Command, THE Game SHALL leave Fear unchanged.
5. WHEN the player enters a Recognized_Command other than help that the Game refuses (for example, moving through a locked door or into a dark room without the lamp), THE Game SHALL raise Fear by the Fear_Cost and SHALL leave the player's room and items unchanged.
6. THE Game SHALL choose the Fear_Cost from the room the player was in before the command ran, so a move out of the Cellar costs the cellar Fear_Cost and a move into the Cellar costs the normal Fear_Cost.

### Requirement 4: Fear from entering the cellar

**User Story:** As a player, I want the cellar to be frightening, so that going down feels dangerous.

#### Acceptance Criteria

1. WHEN the player moves into the Cellar and the move is accepted, THE Game SHALL raise Fear by the cellar entry Fear increase, in addition to the Fear_Cost of the command.
2. IF a move into the Cellar is refused, THEN THE Game SHALL leave out the cellar entry Fear increase, apply only the Fear_Cost of the command, and keep the player in the current room.
3. THE Game SHALL apply the cellar entry Fear increase once per accepted move, including when the player enters the Cellar again after leaving it.

### Requirement 5: Fear in the status bar

**User Story:** As a player, I want to see my fear, so that I know how close I am to the Caretaker.

#### Acceptance Criteria

1. THE Status_Bar SHALL show the current room name and the Fear in the format "<Room name> | Fear: <number>", for example "Cellar | Fear: 12".
2. WHEN a new game starts, THE Status_Bar SHALL show the starting room name and Fear of 0.
3. WHEN the current room changes, THE Game SHALL update the Status_Bar to show the new room name and the current Fear.
4. WHEN Fear changes, THE Game SHALL update the Status_Bar to show the new Fear and the current room name.

### Requirement 6: Threshold lines

**User Story:** As a player, I want the house to react as my fear grows, so that the tension is felt.

#### Acceptance Criteria

1. WHEN Fear first rises from below 25 to 25 or above, THE Game SHALL show the Threshold_Line for 25 in the same command reply.
2. WHEN Fear first rises from below 50 to 50 or above, THE Game SHALL show the Threshold_Line for 50 in the same command reply.
3. WHEN Fear first rises from below 75 to 75 or above, THE Game SHALL show the Threshold_Line for 75 in the same command reply.
4. THE Game SHALL show each Threshold_Line at most once per game.
5. WHEN one command raises Fear to or above more than one Threshold that has not yet been shown, THE Game SHALL show the Threshold_Line for each of those Thresholds in ascending order, one line per Threshold.
6. THE Game_State SHALL record which Thresholds have been shown.
7. THE Game SHALL write each Threshold_Line as a single short sentence with a quiet, cold, unsettling tone and no gore.
8. WHEN a new game starts, THE Game SHALL clear the record of shown Thresholds.

### Requirement 7: Game over at 100 fear

**User Story:** As a player, I want a clear ending when my fear is too high, so that the danger has consequences.

#### Acceptance Criteria

1. WHEN Fear reaches 100, THE Game SHALL set Game_Over in the Game_State.
2. WHEN Game_Over is set, THE Game SHALL show a short game-over message of 1 to 3 sentences saying the Caretaker has caught the player, with a quiet, unsettling tone and no gore.
3. WHEN Game_Over is set, THE Game SHALL tell the player to type restart, in the same reply as the game-over message.
4. WHEN the player's command raises Fear to 100, THE Game SHALL show the command's normal reply and any Threshold_Line before the game-over message.
5. WHILE Game_Over is set, WHEN the player enters a command other than restart, THE Game SHALL show one reminder line telling the player to type restart, without running the command's normal action.
6. WHILE Game_Over is set, THE Game SHALL leave every Game_State value unchanged when a command other than restart is entered.

### Requirement 8: Restart

**User Story:** As a player, I want to restart after being caught, so that I can try again.

#### Acceptance Criteria

1. WHEN the player enters restart, THE Game SHALL replace the Game_State with a fresh initial state with Fear 0, the starting room, no carried items, no Thresholds shown, and Game_Over cleared.
2. WHEN the player enters restart, THE Game SHALL show the opening story and the starting room description.
3. WHEN the player enters restart, THE Status_Bar SHALL show the starting room name and Fear of 0.
4. THE Game SHALL accept restart both during play and during Game_Over.
5. WHEN the player enters restart, THE Game SHALL restore the lamp to the Hallway and remove the trapdoor revealed in the Library.
6. WHEN the player enters restart while Game_Over is set, THE Game SHALL accept commands again, starting with the next command.
7. THE Game SHALL treat restart as a Recognized_Command that does not raise Fear.

### Requirement 9: Existing behavior preserved

**User Story:** As a developer, I want the current commands to keep working, so that the fear meter does not break the game.

#### Acceptance Criteria

1. WHEN the player enters look, go, take lamp, inventory, examine, move rug or help, THE Game SHALL return the same reply text as before the fear meter, followed by any Threshold_Line or game-over message.
2. WHEN the player enters a command that was valid before the fear meter, THE Game SHALL make the same changes to the room, carried items, room items and exits as before the fear meter.
3. THE Game SHALL keep every command synonym that worked before the fear meter.
4. IF the player enters unknown text or only spaces, THEN THE Game SHALL give the same reply as before the fear meter and add no fear lines.
5. THE Game SHALL keep the existing prompt, typed-text echo, input clearing, focus and scrolling behavior.
6. THE Game SHALL keep processCommand free of reads or writes to the page (DOM).