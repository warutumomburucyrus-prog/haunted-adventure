# Requirements Document

## Introduction

This feature adds a hint command to the Haunted Adventure. The player types "hint", "hints" or "help me" and the game shows one short, vague, atmospheric hint about the first escape step the player has not yet done. Asking again on the same step gives a clearer hint, up to three levels per step. Each hint costs a fixed amount of fear. Game code chooses every hint from the game state, and hints never lie.

The nine escape steps, in order, are:

1. Take the lamp.
2. Go north to the Library.
3. Examine the desk and read the torn page.
4. Pull the rug aside.
5. Go down to the Cellar.
6. Examine the wall.
7. Pull the crooked stone.
8. Take the key.
9. Go back up to the Hallway and unlock the front door.

## Glossary

- **Game**: The Haunted Adventure text game running in the web page (game.js).
- **Game_State**: The object holding every game fact: current room, carried items, fear, rooms and the hint facts defined below.
- **Hint_Command**: The player input "hint", "hints" or "help me" after normalization.
- **Escape_Step**: One of the nine ordered steps listed in the Introduction.
- **Current_Step**: The first Escape_Step in order that the Game_State does not record as done.
- **Hint_Level**: A number from 1 to 3 for how clear a hint is. Level 1 is the vaguest and level 3 is the clearest.
- **Hint_Count**: The number of hints shown for the Current_Step, stored in the Game_State.
- **Hint_Text**: The table of hint lines in game code, with three lines for each Escape_Step.
- **HINT_FEAR_COST**: The constant naming the fear a hint costs. Its value is 5.
- **Fear**: The number from 0 to FEAR_MAX in the Game_State, changed only by game code.
- **Narrator_Lies**: The false room sentences that applyLies swaps in when Fear is high.
- **Ending_State**: The state where gameOver or escaped is true in the Game_State.

## Requirements

### Requirement 1: Hint command input

**User Story:** As a player, I want to type a hint command, so that I can get help when I am stuck.

#### Acceptance Criteria

1. WHEN the player enters "hint", THE Game SHALL treat the input as the Hint_Command.
2. WHEN the player enters "hints", THE Game SHALL treat the input as the Hint_Command.
3. WHEN the player enters "help me", THE Game SHALL treat the input as the Hint_Command.
4. WHEN the player enters "help", THE Game SHALL show the help text and SHALL NOT treat the input as the Hint_Command.
5. WHEN the Hint_Command succeeds, THE Game SHALL show exactly one line of Hint_Text.

### Requirement 2: Hint matches progress

**User Story:** As a player, I want the hint to match my progress, so that the hint helps with the step I am actually on.

#### Acceptance Criteria

1. WHEN the Hint_Command runs, THE Game SHALL select the Current_Step from the Game_State alone.
2. THE Game_State SHALL record which of the following facts are true: the player has entered the Library, the player has examined the desk, the player has examined the torn page, and the player has examined the wall.
3. WHEN the player examines the desk, THE Game SHALL record in the Game_State that the desk was examined.
4. WHEN the player examines the torn page, THE Game SHALL record in the Game_State that the torn page was examined.
5. WHEN the player examines the wall in the Cellar, THE Game SHALL record in the Game_State that the wall was examined.
6. WHEN the player enters the Library, THE Game SHALL record in the Game_State that the Library was entered.
7. THE Game SHALL treat Escape_Step 1 as done WHEN the lamp is in the carried items.
8. THE Game SHALL treat Escape_Step 2 as done WHEN the Library has been entered.
9. THE Game SHALL treat Escape_Step 3 as done WHEN both the desk and the torn page have been examined.
10. THE Game SHALL treat Escape_Step 4 as done WHEN the Library has an exit going down.
11. THE Game SHALL treat Escape_Step 5 as done WHEN the Cellar has been entered.
12. THE Game SHALL treat Escape_Step 6 as done WHEN the wall has been examined.
13. THE Game SHALL treat Escape_Step 7 as done WHEN the Cellar stone has been moved.
14. THE Game SHALL treat Escape_Step 8 as done WHEN the key is in the carried items.
15. THE Game SHALL select Escape_Step 9 as the Current_Step WHEN Escape_Steps 1 to 8 are done.

### Requirement 3: Hints get clearer

**User Story:** As a player, I want repeated hints on the same step to get clearer, so that I can choose how much help I take.

#### Acceptance Criteria

1. WHEN the Hint_Command runs and the Hint_Count for the Current_Step is 0, THE Game SHALL show the Hint_Level 1 line for the Current_Step.
2. WHEN the Hint_Command runs and the Hint_Count for the Current_Step is 1, THE Game SHALL show the Hint_Level 2 line for the Current_Step.
3. WHEN the Hint_Command runs and the Hint_Count for the Current_Step is 2 or more, THE Game SHALL show the Hint_Level 3 line for the Current_Step.
4. WHEN the Game shows a hint, THE Game SHALL increase the Hint_Count in the Game_State by 1, up to a maximum of 3.
5. WHEN the Current_Step changes, THE Game SHALL reset the Hint_Count in the Game_State to 0.
6. THE Game SHALL keep the Hint_Count unchanged WHILE the Current_Step stays the same.

### Requirement 4: Atmospheric hint text

**User Story:** As a player, I want hints to stay atmospheric, so that the game keeps its cold and unsettling tone.

#### Acceptance Criteria

1. THE Hint_Text SHALL contain three lines for each of the nine Escape_Steps.
2. THE Hint_Text SHALL NOT contain the exact command text the player must type for any Escape_Step.
3. THE Hint_Text SHALL use a quiet, cold and unsettling tone without gore.
4. THE Hint_Text lines for Hint_Level 1 SHALL be vague, and the lines for Hint_Level 3 SHALL point to the object or place involved.

### Requirement 5: Hint fear cost

**User Story:** As a player, I want hints to carry a fear cost, so that asking for help has a price.

#### Acceptance Criteria

1. THE Game SHALL define the constant HINT_FEAR_COST with the value 5.
2. WHEN the Hint_Command succeeds, THE Game SHALL add HINT_FEAR_COST to Fear instead of the normal command cost.
3. WHEN the Hint_Command succeeds in the Cellar, THE Game SHALL add HINT_FEAR_COST to Fear and SHALL NOT add FEAR_COST_CELLAR.
4. WHEN the Hint_Command raises Fear past a value in FEAR_THRESHOLDS, THE Game SHALL show that threshold line once, after the hint.
5. IF the Hint_Command raises Fear to FEAR_MAX, THEN THE Game SHALL end the game and show the GAME_OVER_LINES after the hint.
6. THE Game SHALL cap Fear at FEAR_MAX after a hint.
7. WHEN the Hint_Command succeeds, THE Game SHALL show the new Fear in the status bar.

### Requirement 6: Truthful hints

**User Story:** As a player, I want hints to be truthful, so that I can trust them even when the house lies.

#### Acceptance Criteria

1. THE Game SHALL show Hint_Text exactly as written in the Hint_Text table, regardless of Fear.
2. WHILE Fear is at or above a Narrator_Lies minimum, THE Game SHALL leave the hint line unchanged by applyLies.
3. WHEN the Hint_Command runs, THE Game SHALL leave the current room, the carried items, the room data and the shownThresholds list unchanged, except for the Hint_Count and the Fear.

### Requirement 7: Respect the endings

**User Story:** As a player, I want the hint command to respect the endings, so that the game over and escape screens stay final.

#### Acceptance Criteria

1. WHILE the Game_State has gameOver set to true, THE Game SHALL answer the Hint_Command with GAME_OVER_REMINDER and SHALL NOT change Fear or the Hint_Count.
2. WHILE the Game_State has escaped set to true, THE Game SHALL answer the Hint_Command with ESCAPE_REMINDER and SHALL NOT change Fear or the Hint_Count.
3. WHEN the player enters "restart", THE Game SHALL reset the Hint_Count and the recorded hint facts to their starting values.

### Requirement 8: Help text mentions hint

**User Story:** As a player, I want the help text to mention the hint command, so that I can find it.

#### Acceptance Criteria

1. WHEN the player enters "help", THE Game SHALL include "hint" in the help text.
2. WHEN the player enters "help", THE Game SHALL keep the help text free of any Fear cost and any Hint_Count change.

### Requirement 9: Existing behavior stays intact

**User Story:** As a developer, I want the new command to leave existing behavior intact, so that the rest of the game keeps working.

#### Acceptance Criteria

1. THE Game SHALL keep every existing command working with the same replies as before this feature.
2. THE Game SHALL keep the normal fear cost for every command other than the Hint_Command.
3. THE Game SHALL keep the Narrator_Lies working for room descriptions and arrival text.
4. THE Game SHALL keep the key hidden in the Cellar until the player pulls the stone.
5. WHEN the player unlocks the front door while carrying the key, THE Game SHALL show the ESCAPE_LINES.
6. THE Game SHALL keep all new hint code in plain JavaScript with short comments, using no frameworks.
