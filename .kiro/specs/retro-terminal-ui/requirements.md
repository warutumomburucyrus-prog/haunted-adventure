# Requirements Document

## Introduction

This feature changes the presentation of Haunted Adventure from a dark, haunted theme to a retro green terminal look and feel. The game already works: the player types commands (`look`, `go north`, `take lamp`, `inventory`) and reads text replies. This feature changes only how the game looks and feels — the visual theme, the command echo, the status bar, and a loading screen — without changing how the command logic works.

## Glossary

- **Game_Page**: the `index.html` page that runs in the browser.
- **Game_Engine**: the game logic in `game.js`, including game state, command parsing, and command handlers.
- **Output_Display**: the scrollable area (the `#output` element) where command echoes, room descriptions, and game replies appear.
- **Command_Input**: the text field (the `#command-input` element) where the player types commands.
- **Command_Echo**: a line shown in the Output_Display that repeats the text the player typed, prefixed with a `>>` character.
- **Status_Bar**: a bar displayed at the top of the Game_Page, above the Output_Display, that shows the name of the Current_Room.
- **Loading_Screen**: an animated screen shown when the Game_Page opens, displaying typed text for approximately two seconds before the game begins.
- **Terminal_Theme**: the retro green-on-black visual presentation applied to all text and elements on the Game_Page.
- **Current_Room**: the room the player currently occupies, identified by `gameState.currentRoomId` and displayed by its `name` property.
- **Game_Text**: all text shown on the Game_Page, including the Output_Display, Command_Input, and Status_Bar.

## Requirements

### Requirement 1: Retro Green Terminal Visual Theme

**User Story:** As a player, I want the game to look like a retro green terminal, so that it feels like a classic computer adventure.

#### Acceptance Criteria

1. THE Terminal_Theme SHALL display all Game_Text in a green color on a black background covering the entire Game_Page, including the backgrounds of the Output_Display and the Command_Input.
2. THE Terminal_Theme SHALL use a monospace font at a font size of at least 18 pixels for all Game_Text.
3. THE Terminal_Theme SHALL load all fonts, styles, and scripts from local files with relative paths, using no external URLs and no embedded resource references.

### Requirement 2: Command Echo with ">" Prefix

**User Story:** As a player, I want each command I type to appear in the output prefixed with `>`, so that I can easily tell my commands apart from the game's replies.

#### Acceptance Criteria

1. WHEN the Player submits text that is not empty and not whitespace-only in the Command_Input, THE Game_Engine SHALL display the text the Player typed, preserving the Player's original letter case, prefixed with a `>` character, in the Output_Display before any game reply lines for that command.
2. WHEN the Player submits empty or whitespace-only input in the Command_Input, THE Game_Engine SHALL display no Command_Echo and no reply lines.

### Requirement 3: Scrolling Output History

**User Story:** As a player, I want the full history of my commands and the game's replies to stay visible and scrollable, so that I can look back at what happened.

#### Acceptance Criteria

1. THE Output_Display SHALL retain all previously displayed command echoes, room descriptions, and game replies, such that older lines remain present after new lines are added.
2. WHEN new lines are added to the Output_Display, THE Output_Display SHALL automatically scroll to the bottom so that the most recently added line is visible, while keeping all older lines reachable by scrolling upward.

### Requirement 4: Status Bar Showing Current Room

**User Story:** As a player, I want a status bar at the top of the page showing my current room, so that I always know where I am in the game.

#### Acceptance Criteria

1. THE Game_Page SHALL display a Status_Bar at the top of the page, above the Output_Display.
2. THE Status_Bar SHALL show the name property of the Current_Room.
3. WHEN the Current_Room changes, THE Status_Bar SHALL update to show the name property of the new Current_Room.

### Requirement 5: Animated Loading Screen

**User Story:** As a player, I want a short animated loading screen when the page opens, so that the game has a classic terminal boot-up feel.

#### Acceptance Criteria

1. WHEN the Game_Page opens, THE Loading_Screen SHALL appear and display text using a character-by-character typing animation at a per-character interval of 50 to 100 milliseconds.
2. THE Loading_Screen SHALL remain visible for between 1.5 and 2.5 seconds.
3. WHEN the Loading_Screen visibility duration of 1.5 to 2.5 seconds elapses, THE Game_Engine SHALL hide the Loading_Screen and begin the game by displaying the starting room description in the Output_Display.

### Requirement 6: Command Behavior Preservation

**User Story:** As a player, I want the commands to work exactly as before, so that the new presentation does not change the game's behavior.

#### Acceptance Criteria

1. WHEN a player submits a command, THE Game_Engine SHALL produce the same reply text and the same changes to Current_Room, items carried, and Fear_Level that the Game_Engine produced for that command prior to the presentation changes.
2. THE Terminal_Theme, Command_Echo, Status_Bar, and Loading_Screen SHALL be limited to the visual presentation of the Game_Page and SHALL NOT alter the command recognition, the reply text, or the changes to Current_Room, items carried, and Fear_Level produced by the Game_Engine.

### Requirement 7: Technology Constraint

**User Story:** As a developer, I want the game to use only plain HTML, CSS, and JavaScript with no frameworks or external resources, so that it runs by opening a single file in a browser.

#### Acceptance Criteria

1. THE Game_Page SHALL be built with HTML, CSS, and JavaScript only, with no references to external frameworks or libraries.
2. THE Game_Page SHALL load all code and styles from local files with relative paths, using no external URLs (http, https, or protocol-relative // URLs) and no embedded resource references.
3. WHEN the Game_Page is opened via the file protocol without a web server, build step, or network access, THE Game_Page SHALL display and function identically to when opened with a web server.
