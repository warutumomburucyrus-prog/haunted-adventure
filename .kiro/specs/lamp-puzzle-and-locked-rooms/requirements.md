# Requirements Document

## Introduction

This feature adds a lamp puzzle and two locked rooms to the Haunted Adventure. The lamp starts empty and unlit. The player must find an oil can and a lighter to fuel and light it, and the Cellar can only be entered once the lamp is lit.

Two new rooms are added. The Kitchen lies east of the Hallway behind a door locked until the player carries the small brass key. The Storeroom lies north of the Kitchen behind a door locked until the player carries the rusty key. The small brass key is hidden behind a book in the Library. The lighter and the rusty key are hidden in a Kitchen drawer. The oil can lies in the Storeroom. A generic take command, with the verbs take, get and grab, lets the player pick up any item lying in the current room. The word "key" in a take command means the one key lying in the current room.

Game code owns every fact in this feature, including the lamp facts, the unlocked doors and the revealed items. All new text is short, cold and quiet. The existing lamp, fear meter, lying narrator, hidden iron key, hint command and escape ending keep working.

## Glossary

- **Game**: The Haunted Adventure text game running in the web page (game.js).
- **Game_State**: The object holding every game fact: current room, carried items, fear, rooms, and the facts defined below.
- **Command_Processor**: The game code that turns player input into a reply and a new Game_State.
- **Lamp**: The item with id "lamp". It starts lying in the Hallway.
- **Fueled**: A boolean fact in the Game_State. It is false at the start and true once the Lamp has been filled.
- **Lit**: A boolean fact in the Game_State. It is false at the start and true once the Lamp has been lit.
- **Oil_Can**: The item with id "oil can". It starts lying in the Storeroom.
- **Lighter**: The item with id "lighter". It starts hidden in the Kitchen drawer.
- **Brass_Key**: The item with id "brass key", described to the player as the small brass key. It starts hidden behind a book in the Library.
- **Rusty_Key**: The item with id "rusty key". It starts hidden in the Kitchen drawer.
- **Iron_Key**: The existing item with id "key", the old iron key hidden in the Cellar wall.
- **Take_Verb**: One of the words "take", "get" or "grab" that starts a take command.
- **Room_Key**: The one key lying in the current room that the word "key" refers to: the Brass_Key in the Library, the Rusty_Key in the Kitchen, the Iron_Key in the Cellar. Each of these rooms holds at most one key at a time. A key that is not yet revealed (Drawer closed, Wrong_Book not opened) does not lie in the room.
- **Hallway**: The existing room that holds the front door and the Lamp at the start.
- **Library**: The existing room north of the Hallway.
- **Cellar**: The existing room below the Library.
- **Kitchen**: The new room east of the Hallway.
- **Storeroom**: The new room north of the Kitchen.
- **Kitchen_Door**: The way east from the Hallway to the Kitchen. It is locked at the start.
- **Storeroom_Door**: The way north from the Kitchen to the Storeroom. It is locked at the start.
- **Unlocked_Door_Fact**: A boolean fact in the Game_State for each of the Kitchen_Door and the Storeroom_Door. It is false at the start and true once the door is unlocked.
- **Drawer**: The fixed feature of the Kitchen that holds the Lighter and the Rusty_Key.
- **Drawer_Open_Fact**: A boolean fact in the Game_State. It is false at the start and true once the Drawer has been opened.
- **Wrong_Book**: The one book on the Library shelves that feels wrong.
- **Book_Pulled_Fact**: A boolean fact in the Game_State. It is false at the start and true once the Wrong_Book has been opened.
- **Lying_Narrator**: The existing system where room descriptions may be replaced by false sentences chosen by game code from the fear number.
- **Fear**: The number from 0 to FEAR_MAX in the Game_State, changed only by game code.
- **Never_Lie_Text**: Inventory replies, replies to actions, the status bar, threshold lines and the ending text. This text is never changed by the Lying_Narrator.
- **Lying_Surfaces**: Room descriptions, item text and examine text shown by look, examine and arrival. Only these may be changed by the Lying_Narrator, and only through lines written in room data.

## Requirements

### Requirement 1: Lamp facts in the game state

**User Story:** As a player, I want the lamp to have a real fuel and light condition, so that the lamp puzzle behaves the same way every time.

#### Acceptance Criteria

1. THE Game_State SHALL hold the Fueled fact and the Lit fact.
2. WHEN a new game starts or the player types restart, THE Game_State SHALL set Fueled to false and Lit to false.
3. THE Command_Processor SHALL change Fueled and Lit only through the fill lamp command and the light lamp command.
4. WHEN Lit is true, THE Command_Processor SHALL keep Lit true for the rest of the game.
5. THE Command_Processor SHALL keep the Oil_Can and the Lighter available after every use.

### Requirement 2: Fill the lamp

**User Story:** As a player, I want to fill the lamp with oil, so that I can later light it.

#### Acceptance Criteria

1. THE Command_Processor SHALL accept "fill lamp", "refuel lamp" and "fuel lamp" as the same command, with or without the word "the".
2. WHEN the player gives the fill lamp command while carrying the Lamp and the Oil_Can and Fueled is false, THE Command_Processor SHALL set Fueled to true and reply with one short line saying the lamp is filled.
3. WHEN the player gives the fill lamp command while carrying the Lamp and the Oil_Can and Fueled is true, THE Command_Processor SHALL leave the Game_State facts unchanged and reply with one short line saying the lamp is already full.
4. IF the player gives the fill lamp command without carrying the Lamp, THEN THE Command_Processor SHALL leave Fueled unchanged and reply with one short line saying the lamp is missing.
5. IF the player gives the fill lamp command while carrying the Lamp but not the Oil_Can, THEN THE Command_Processor SHALL leave Fueled unchanged and reply with one short line saying the oil can is missing.
6. IF the player gives the fill lamp command while carrying neither the Lamp nor the Oil_Can, THEN THE Command_Processor SHALL leave Fueled unchanged and reply with one short line saying the lamp is missing.

### Requirement 3: Light the lamp

**User Story:** As a player, I want to light the lamp once it has oil, so that I can see in dark places.

#### Acceptance Criteria

1. THE Command_Processor SHALL accept "light lamp" and "light the lamp" as the same command.
2. WHEN the player gives the light lamp command while carrying the Lamp and the Lighter and Fueled is true and Lit is false, THE Command_Processor SHALL set Lit to true and reply with one short line saying the lamp is lit.
3. WHEN the player gives the light lamp command while Lit is true and the player carries the Lamp, THE Command_Processor SHALL leave the Game_State facts unchanged and reply with one short line saying the lamp is already lit.
4. IF the player gives the light lamp command without carrying the Lamp, THEN THE Command_Processor SHALL leave Lit unchanged and reply with one short line saying the lamp is missing.
5. IF the player gives the light lamp command while carrying the Lamp and Fueled is false, THEN THE Command_Processor SHALL leave Lit unchanged and reply with one short line saying the lamp has no oil.
6. IF the player gives the light lamp command while carrying the Lamp and Fueled is true and the player does not carry the Lighter, THEN THE Command_Processor SHALL leave Lit unchanged and reply with one short line saying the lighter is missing.

### Requirement 4: Examine the lamp

**User Story:** As a player, I want to examine the lamp, so that I can see what state it is in.

#### Acceptance Criteria

1. WHEN the player examines the Lamp while Fueled is false, THE Command_Processor SHALL show the empty lamp text.
2. WHEN the player examines the Lamp while Fueled is true and Lit is false, THE Command_Processor SHALL show the fueled lamp text.
3. WHEN the player examines the Lamp while Lit is true, THE Command_Processor SHALL show the lit lamp text.
4. THE Game SHALL keep the empty, fueled and lit lamp texts different from each other.
5. THE Command_Processor SHALL choose the lamp text only from the Fueled fact and the Lit fact.
6. WHEN the player examines the Lamp while the Lamp lies in the current room or is carried, THE Command_Processor SHALL show the lamp text for the current facts.

### Requirement 5: The Cellar needs a lit lamp

**User Story:** As a player, I want the dark Cellar to need a real light, so that carrying the lamp is not enough.

#### Acceptance Criteria

1. WHEN the player moves down from the Library while carrying the Lamp and Lit is true, THE Command_Processor SHALL move the player to the Cellar.
2. IF the player moves down from the Library while carrying the Lamp and Lit is false, THEN THE Command_Processor SHALL keep the player in the Library and reply with a refusal line saying the lamp gives no light.
3. IF the player moves down from the Library without carrying the Lamp, THEN THE Command_Processor SHALL keep the player in the Library and reply with the existing pitch black refusal line.
4. WHILE the player is in the Cellar, THE Command_Processor SHALL keep applying the existing Cellar fear cost and the existing Cellar entry fear.
5. WHERE a room has the needsLight setting, THE Command_Processor SHALL apply the lit-lamp rule from this requirement to that room.

### Requirement 6: Kitchen and its locked door

**User Story:** As a player, I want a locked door east of the Hallway, so that I need the small brass key to reach a new room.

#### Acceptance Criteria

1. THE Game SHALL provide a Kitchen east of the Hallway, with an exit west back to the Hallway.
2. THE Game_State SHALL hold the Unlocked_Door_Fact for the Kitchen_Door, set to false at the start and after restart.
3. IF the player moves east from the Hallway without carrying the Brass_Key while the Unlocked_Door_Fact for the Kitchen_Door is false, THEN THE Command_Processor SHALL keep the player in the Hallway and reply with a line saying the door is locked.
4. WHEN the player moves east from the Hallway while carrying the Brass_Key and the Unlocked_Door_Fact for the Kitchen_Door is false, THE Command_Processor SHALL set that fact to true, show one short unlocking line, and move the player to the Kitchen.
5. WHEN the player moves east from the Hallway while the Unlocked_Door_Fact for the Kitchen_Door is true, THE Command_Processor SHALL move the player to the Kitchen without needing the Brass_Key.
6. THE Hallway description SHALL include the exact sentence "A narrow door, swollen with damp, stands shut in the side wall."
7. THE Hallway description SHALL keep the exact sentence "behind you the front door waits, silent and shut." so that the existing Hallway lie still applies.
8. THE Hallway description SHALL contain no compass direction in the new door mention.
9. THE Kitchen description SHALL include the exact phrase "a narrow door waits at the far end".
10. THE Kitchen description SHALL keep the exact sentence "The way back to the hallway is behind you."
11. THE Kitchen description SHALL contain no compass direction.
12. THE Kitchen SHALL not need light to be entered.

### Requirement 7: Kitchen drawer

**User Story:** As a player, I want to search the kitchen drawer, so that I can find the lighter and the rusty key.

#### Acceptance Criteria

1. THE Game_State SHALL hold the Drawer_Open_Fact, set to false at the start and after restart.
2. THE Command_Processor SHALL accept "open drawer", "search drawer" and "pull drawer" as the same command.
3. WHEN the player gives the open drawer command in the Kitchen while the Drawer_Open_Fact is false, THE Command_Processor SHALL set the Drawer_Open_Fact to true, add the Lighter and the Rusty_Key to the items lying in the Kitchen, and reply with one short line describing what was found.
4. WHEN the player gives the open drawer command in the Kitchen while the Drawer_Open_Fact is true, THE Command_Processor SHALL leave the Game_State unchanged and reply with one short line saying the drawer is already open.
5. IF the player gives the open drawer command outside the Kitchen, THEN THE Command_Processor SHALL leave the Game_State unchanged and reply with one short line saying there is no drawer here.
6. WHEN the player examines the drawer in the Kitchen, THE Command_Processor SHALL show examine text that depends on the Drawer_Open_Fact.
7. THE Kitchen SHALL list each item lying in it, including the Lighter and the Rusty_Key after the Drawer is opened, when the player types look.

### Requirement 8: Storeroom and its locked door

**User Story:** As a player, I want a locked door north of the Kitchen, so that I need the rusty key to reach the oil can.

#### Acceptance Criteria

1. THE Game SHALL provide a Storeroom north of the Kitchen, with an exit south back to the Kitchen.
2. THE Game_State SHALL hold the Unlocked_Door_Fact for the Storeroom_Door, set to false at the start and after restart.
3. IF the player moves north from the Kitchen without carrying the Rusty_Key while the Unlocked_Door_Fact for the Storeroom_Door is false, THEN THE Command_Processor SHALL keep the player in the Kitchen and reply with a line saying the door is locked.
4. WHEN the player moves north from the Kitchen while carrying the Rusty_Key and the Unlocked_Door_Fact for the Storeroom_Door is false, THE Command_Processor SHALL set that fact to true, show one short unlocking line, and move the player to the Storeroom.
5. WHEN the player moves north from the Kitchen while the Unlocked_Door_Fact for the Storeroom_Door is true, THE Command_Processor SHALL move the player to the Storeroom without needing the Rusty_Key.
6. THE Storeroom SHALL not need light, whether the Lamp is carried, fueled or lit.
7. THE Storeroom SHALL start with the Oil_Can lying in it.
8. THE Storeroom description SHALL end with the exact sentence "The only way out is the way you came."
9. THE Storeroom description SHALL contain no compass direction.
10. WHEN the player types look in the Storeroom while the Oil_Can lies there, THE Command_Processor SHALL list the Oil_Can with its item text.

### Requirement 9: Library shelves and the wrong book

**User Story:** As a player, I want to notice an odd book on the shelves, so that I can find the small brass key.

#### Acceptance Criteria

1. THE Game_State SHALL hold the Book_Pulled_Fact, set to false at the start and after restart.
2. WHEN the player examines the shelves in the Library, THE Command_Processor SHALL show examine text that mentions one book feeling wrong.
3. THE Command_Processor SHALL accept "open book", "pull book", "take book" and "read book" as the same command.
4. WHEN the player types "get book", "grab book" or "pick up book", THE Command_Processor SHALL run the open book command.
5. WHEN the player types "take book", THE Command_Processor SHALL run the open book command and SHALL not pass the input to the generic take command.
6. WHEN the player types "examine book", THE Command_Processor SHALL show the same text as "examine shelves".
7. WHEN the player gives the open book command in the Library while the Book_Pulled_Fact is false, THE Command_Processor SHALL set the Book_Pulled_Fact to true, add the Brass_Key to the items lying in the Library, and reply with one short line describing what was found.
8. WHEN the player gives the open book command in the Library while the Book_Pulled_Fact is true, THE Command_Processor SHALL leave the Game_State unchanged and reply with one short line saying the book is already open.
9. IF the player gives the open book command outside the Library, THEN THE Command_Processor SHALL leave the Game_State unchanged and reply with one short line saying there is no book to open here.
10. WHEN the Brass_Key lies in the Library, THE Command_Processor SHALL list the Brass_Key with its item text when the player types look in the Library.
11. THE Game SHALL keep the existing Library desk, page, rug and trapdoor behavior unchanged.

### Requirement 10: Generic take command

**User Story:** As a player, I want to take any item lying in the room, so that I can pick up the new items without special commands.

#### Acceptance Criteria

1. THE Command_Processor SHALL accept "take", "get" and "grab" as Take_Verbs that behave the same way in the generic take command.
2. WHEN the player types a Take_Verb followed by the name of an item lying in the current room, THE Command_Processor SHALL remove that item from the room, add it to the carried items, and reply with one short line saying the item was taken.
3. IF the player types a Take_Verb followed by the name of an item that is carried already, THEN THE Command_Processor SHALL leave the Game_State unchanged and reply with one short line saying the player already carries it.
4. IF the player types a Take_Verb followed by a name that is not lying in the current room and is not carried, THEN THE Command_Processor SHALL leave the Game_State unchanged and reply with one short line saying the item is not here.
5. WHEN the player types "take lamp", "get lamp" or "grab lamp", THE Command_Processor SHALL keep the existing replies of the lamp take command.
6. THE Command_Processor SHALL keep accepting "pick up lamp" and "pick up key" with the existing replies.
7. WHEN the player types a Take_Verb followed by "key", THE Command_Processor SHALL treat "key" as the Room_Key of the current room.
8. WHEN the player types a Take_Verb followed by "key" in the Library while the Brass_Key lies there, THE Command_Processor SHALL take the Brass_Key.
9. WHEN the player types a Take_Verb followed by "key" in the Kitchen while the Rusty_Key lies there, THE Command_Processor SHALL take the Rusty_Key.
10. WHEN the player types a Take_Verb followed by "key" in the Cellar while the Iron_Key lies there, THE Command_Processor SHALL take the Iron_Key and keep the existing Iron_Key take replies.
11. IF the player types a Take_Verb followed by "key" while no key lies in the current room, THEN THE Command_Processor SHALL leave the Game_State unchanged and reply with one short line saying there is no key here.
12. IF the player types a Take_Verb followed by "key" while the player carries the Iron_Key and no key lies in the current room, THEN THE Command_Processor SHALL keep the existing reply saying the player already carries the key.
13. WHILE the Drawer_Open_Fact is false, THE Command_Processor SHALL treat the Rusty_Key as not lying in the Kitchen, including for a Take_Verb followed by "key".
14. WHILE the Book_Pulled_Fact is false, THE Command_Processor SHALL treat the Brass_Key as not lying in the Library, including for a Take_Verb followed by "key".
15. WHILE the Drawer_Open_Fact is false, THE Command_Processor SHALL treat the Lighter as not lying in the Kitchen.
16. THE Command_Processor SHALL accept a Take_Verb followed by "brass key" or "small brass key" as naming the Brass_Key, with or without the word "the".
17. THE Command_Processor SHALL accept a Take_Verb followed by "rusty key" as naming the Rusty_Key, with or without the word "the".
18. THE Command_Processor SHALL accept a Take_Verb followed by "lighter" as naming the Lighter, with or without the word "the".
19. THE Command_Processor SHALL accept a Take_Verb followed by "oil can", "oil" or "can" as naming the Oil_Can, with or without the word "the".
20. THE Command_Processor SHALL change only the carried items and the items lying in the current room when it handles a take command.

### Requirement 11: Item and examine text

**User Story:** As a player, I want the new items to have atmospheric text, so that they fit the haunted tone.

#### Acceptance Criteria

1. THE Game SHALL provide item text, shown when the item lies in a room, for the Brass_Key, the Rusty_Key, the Lighter and the Oil_Can.
2. THE Game SHALL provide examine text for the Brass_Key, the Rusty_Key, the Lighter and the Oil_Can.
3. THE Game SHALL use the exact item text "A rusty key lies at the bottom of the drawer, its teeth gnawed by damp." for the Rusty_Key when it lies in a room.
4. WHEN the player examines one of these items while it lies in the current room or is carried, THE Command_Processor SHALL show its examine text.
5. THE Game SHALL write all new item text and examine text in a cold, quiet, unsettling tone, with no gore.
6. THE Game SHALL write each new item text and each new examine text in at most two sentences.
7. THE Game SHALL write the arrival lines and unlocking lines for the Kitchen and the Storeroom in the same tone and at most two sentences each.
8. WHEN the player types inventory while carrying a new item, THE Command_Processor SHALL list that item by its name, using the existing "You carry a ..." form.

### Requirement 12: Lying narrator and fear rules stay intact

**User Story:** As a player, I want the new content to follow the existing truth and fear rules, so that the game stays fair.

#### Acceptance Criteria

1. THE Game SHALL keep the Never_Lie_Text free of lies for every reply added by this feature.
2. THE Game SHALL write any lie for the new rooms or items in room data, and THE Command_Processor SHALL choose it from the Fear value only.
3. THE Lying_Narrator SHALL change only Lying_Surfaces, and a lie SHALL not change the Game_State.
4. THE Command_Processor SHALL not change Fear through any narrator text.
5. WHEN any command from this feature is processed, THE Command_Processor SHALL apply the existing fear cost, the existing threshold lines and the existing game over rule in the same way as for other commands.
6. WHEN the player gives an unrecognized command, THE Command_Processor SHALL keep the existing unrecognized reply and charge no fear.
7. IF Fear reaches FEAR_MAX, THEN THE Command_Processor SHALL end the game with the existing game over lines.
8. THE Game SHALL keep each lamp, key and door reply true to the Game_State, regardless of the Fear value.

### Requirement 13: Existing behavior is preserved

**User Story:** As a player, I want everything that already works to keep working, so that the new puzzle does not break the game.

#### Acceptance Criteria

1. THE Game SHALL keep the existing look, examine, inventory, help, hint and restart commands working.
2. THE Game SHALL keep the existing escape ending: WHEN the player unlocks the front door in the Hallway while carrying the Iron_Key, THE Command_Processor SHALL end the game with the existing escape lines.
3. THE Game SHALL keep the hidden Iron_Key behavior: the key appears only after the player pulls the crooked stone in the Cellar, and "take key" in the Cellar works as before.
4. THE Game SHALL keep the existing fear meter values, thresholds and status bar format of the form "Room name | Fear: number".
5. WHEN the player types restart, THE Command_Processor SHALL reset every fact added by this feature to its starting value.
6. WHEN the player types hint, THE Command_Processor SHALL keep showing hints for the nine existing Escape_Steps with the existing hint fear cost.
7. WHEN the player types help, THE Command_Processor SHALL keep showing the help lines and charge no fear.
8. THE Game SHALL use plain HTML, CSS and JavaScript only, with no frameworks.
