# Agario

This is a multiplayer blob game inspired by **Agar.io** where players control blobs that move around the game world. The objective is to grow your blob by consuming smaller blobs and other players while avoiding being consumed by larger blobs. The game includes AI players, player splitting, repulsion between blobs, and merging mechanics. The leaderboard shows the top players.

## Features

- **Player Movement**: Blobs move towards the cursor, with smaller blobs moving faster than larger ones.
- **Splitting**: Players can split their blob into smaller parts.
- **Merging**: Blobs automatically merge after a set amount of time.
- **Repulsion**: Blobs repel each other to prevent overlap.
- **Leaderboard**: Displays the top 10 players with the current player highlighted.
- **AI Players**: Computer-controlled players also compete in the game.

## To-Do List

### General Improvements

- [ ] **Improve Movement**: Adjust mouse movement to ensure smaller blobs move faster and larger blobs move slower.
- [ ] **Refine Repulsion Logic**: Improve the repulsion behavior between blobs to ensure they don't overlap but can still stay close.
- [ ] **Add Split/Merge Cooldown**: Implement a cooldown for merging blobs every 5 seconds, regardless of the number of blobs.

### Player Features

- [ ] **Enhance Player Controls**: Ensure smooth player movement and blob control.
- [ ] **Refine Player Blob Attraction**: Speed up blob attraction based on mass (smaller blobs attract faster).
- [ ] **Collision Logic**: Fine-tune the collision mechanics between blobs and walls.
  
### AI Improvements

- [ ] **Improve AI Movement**: Implement smarter AI behavior, making AI players chase smaller blobs and avoid larger ones.
- [ ] **AI Splitting**: Enable AI players to split their blobs when necessary.

### Leaderboard

- [x] **Highlight Player in Leaderboard**: Always highlight the current player in red in the leaderboard, regardless of their position.
- [ ] **Leaderboard Real-Time Update**: Ensure the leaderboard updates dynamically without lag.
  
### Performance & Optimization

- [ ] **Optimize Blob Physics**: Improve performance by optimizing collision detection and movement calculations.
- [ ] **Optimize Rendering**: Implement efficient rendering methods to handle larger numbers of blobs and players.

### UI and UX

- [ ] **Add Score UI**: Display the player's current score and mass on the screen.
- [ ] **Add Settings Menu**: Implement a settings menu for volume control, graphics, and gameplay options.
- [ ] **Mobile Compatibility**: Add support for mobile controls and ensure responsive design for different screen sizes.

---

## Design and Animations To-Do List

### Visual Design

- [ ] **Blob Customization**: Allow players to customize the appearance of their blobs (colors, patterns, skins).
- [ ] **Smooth Transitions**: Create smoother transitions for blob size changes (e.g., growing or shrinking after consuming another blob).
- [ ] **UI Design Overhaul**: Improve the game's overall UI design for menus, leaderboards, and gameplay HUD (heads-up display).
- [ ] **Leaderboard Design**: Enhance the appearance of the leaderboard with clean, modern styling and animations.

### Animations

- [ ] **Blob Movement Animation**: Add smooth animations for blob movement, ensuring it feels fluid when blobs move toward the cursor.
- [ ] **Splitting Animation**: Design an animation for blob splitting that gives a satisfying effect, like a "pop" or burst.
- [ ] **Merging Animation**: Create a merging animation that smoothly combines two blobs, emphasizing the mass absorption process.
- [ ] **Repulsion Effect**: Add a subtle bouncing or force effect when blobs repel each other to avoid overlap.
- [ ] **Eating Animation**: Design an animation for when a blob consumes smaller blobs or other players, making it visually rewarding.
- [ ] **Leaderboard Animation**: Animate the leaderboard update so that players rise or fall in rankings smoothly, with visual cues like color shifts or size adjustments.

### Particle Effects

- [ ] **Particle Trails**: Add particle trails behind blobs when they reach higher speeds, adding a dynamic element to the game.
- [ ] **Collision Effects**: Implement visual effects when blobs collide, like small particles or waves radiating outward.
- [ ] **Victory Animations**: Create a special animation for the top player on the leaderboard, such as a crown or glow effect.

### Sound Design (Optional)

- [ ] **Blob Movement Sounds**: Add subtle sounds when blobs move quickly or split.
- [ ] **Collision Sounds**: Add light "bumping" sounds when blobs collide.
- [ ] **Consumption Sound Effect**: Design a satisfying sound for when a blob consumes another, emphasizing the growth.

---

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/multiplayer-blob-game.git
   cd multiplayer-blob-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the game:
   ```bash
   npm start
   ```

4. Open your browser and go to `http://localhost:3000` to play the game.

---

This `README.md` file now includes a section specifically for design and animation improvements, alongside the general gameplay and feature to-do list. This will help organize and prioritize visual and interactive elements in the game.
