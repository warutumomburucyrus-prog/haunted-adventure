# Requirements Document

## Introduction

This feature delivers the foundational version of Haunted Adventure, a haunted text adventure that runs in a web page in the style of classic games like Zork. The player sees a dark screen showing the description of a single room — an old hallway in a haunted house — and types text commands to interact with the game.

This first scope is intentionally minimal and excludes the AI narrator and the fear meter, which may be added in later features. The supported commands are: `look`, `go north`, `take lamp`, and `inventory`. The game code (plain JavaScript) is the single source of truth for game facts: the current room and the items the player carries.

## Glossary

- **Game_Page**: The single HTML page that runs Haunted Adventure in a web browser.
- **Game_Engine**: The JavaScript code that stores game state and processes player commands.
- **Command_Input**: The text field on the Game_Page where the Player types commands.
- **Output_Display**: The area on the Game_Page that shows room descriptions and text replies.
- **Player**: The person who interacts with the game by typing commands into the Command_Input.
- **Current_Room**: The single room the Player currently occupies, stored by the Game_Engine.
- **Carried_Items**: The list of items the Player is carrying, stored by the Game_Engine.
- **Hallway**: The only room in this feature — an old hallway in a haunted house.
- **Lamp**: The only item in this feature, located in the Hallway at the start.

## Requirements

### Requirement 1: Dark Screen Display

**User Story:** As a player, I want a dark screen, so that the haunted atmosphere is set from the start.

#### Acceptance Criteria

1. WHEN the Game_Page loads, THE Game_Page SHALL display a dark background covering the full width and height of the browser viewport.
2. WHILE the dark background is displayed, THE Game_Page SHALL display all text in a light color that is readable against the dark background.

### Requirement 2: Initial Game State

**User Story:** As a player, I want to see where I am when the game starts, so that I can begin playing immediately.

#### Acceptance Criteria

1. WHEN the Game_Page loads, THE Game_Engine SHALL set the Current_Room to the Hallway.
2. WHEN the Game_Page loads, THE Game_Engine SHALL place the Lamp in the Hallway.
3. WHEN the Game_Page loads, THE Game_Engine SHALL set the Carried_Items to empty.
4. WHEN the Game_Page loads, THE Game_Engine SHALL display the description of the Hallway in the Output_Display.

### Requirement 3: Command Input

**User Story:** As a player, I want to type commands into the game, so that I can interact with the haunted house.

#### Acceptance Criteria

1. THE Game_Page SHALL provide a Command_Input where the Player can type text up to 100 characters.
2. WHEN the Player submits text that is not empty and not whitespace-only in the Command_Input, THE Game_Engine SHALL read the submitted text as a command and clear the Command_Input.
3. THE Game_Engine SHALL recognize the commands `look`, `go north`, `take lamp`, and `inventory` regardless of letter case and after trimming leading and trailing whitespace.
4. IF the Player submits empty or whitespace-only text in the Command_Input, THEN the Game_Engine SHALL clear the Command_Input without displaying any message in the Output_Display.

### Requirement 4: Look Command

**User Story:** As a player, I want to look around, so that I can see what is in the current room.

#### Acceptance Criteria

1. WHEN the Player types `look`, THE Game_Engine SHALL display the description of the Current_Room and any items present in the Current_Room in the Output_Display.

### Requirement 5: Go North Command

**User Story:** As a player, I want to move north, so that I can try to leave the hallway.

#### Acceptance Criteria

1. WHEN the Player types `go north`, THE Game_Engine SHALL display a message in the Output_Display stating that the Player cannot move north.
2. WHEN the Player types `go north`, THE Game_Engine SHALL keep the Current_Room unchanged.

### Requirement 6: Take Lamp Command

**User Story:** As a player, I want to pick up the lamp, so that I can carry the lamp with me.

#### Acceptance Criteria

1. WHEN the Player types `take lamp` and the Lamp is in the Hallway, THE Game_Engine SHALL move the Lamp from the Hallway to the Carried_Items and display a message in the Output_Display stating that the Player has taken the Lamp.
2. WHEN the Player types `take lamp` and the Lamp is in the Carried_Items, THE Game_Engine SHALL display a message in the Output_Display stating that the Player already carries the Lamp.

### Requirement 7: Inventory Command

**User Story:** As a player, I want to see what I am carrying, so that I know my items.

#### Acceptance Criteria

1. WHEN the Player types `inventory` and the Carried_Items contains one or more items, THE Game_Engine SHALL display the name of each item in the Carried_Items in the Output_Display.
2. IF the Player types `inventory` and the Carried_Items is empty, THEN THE Game_Engine SHALL display a message in the Output_Display stating that the Player carries nothing.

### Requirement 8: Unknown Command Handling

**User Story:** As a player, I want feedback when I type something the game does not understand, so that I know the command was not recognized.

#### Acceptance Criteria

1. WHEN the Player submits a command that, ignoring letter case and leading or trailing whitespace, does not match `look`, `go north`, `take lamp`, or `inventory`, THE Game_Engine SHALL display a message in the Output_Display stating that the command is not recognized.
2. WHEN the Player submits a command that is not recognized, THE Game_Engine SHALL preserve the Current_Room and Carried_Items without change.

### Requirement 9: Game State Tracking

**User Story:** As a developer, I want the game code to track the current room and the carried items, so that the game state stays consistent.

#### Acceptance Criteria

1. THE Game_Engine SHALL store the Current_Room as a single value identifying exactly one room at any time.
2. THE Game_Engine SHALL store the Carried_Items as a list that holds zero or more items.
3. WHEN the Game_Engine processes a recognized Player command, THE Game_Engine SHALL change the Current_Room and the Carried_Items only according to that command's defined behavior.
4. IF the Game_Engine receives an unrecognized command, THEN the Game_Engine SHALL preserve the Current_Room and Carried_Items without change.

### Requirement 10: Technology Constraint

**User Story:** As a developer, I want the game built with plain web technologies, so that the game runs in a browser without external frameworks.

#### Acceptance Criteria

1. THE Game_Page SHALL be built using only HTML, CSS, and JavaScript.
2. THE Game_Page SHALL reference no scripts, stylesheets, or other resources from external URLs.
