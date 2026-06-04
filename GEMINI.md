# Sector Genesis - Project Context

## Project Overview
**Sector Genesis** is a sci-fi incremental "survivor-style" browser game (inspired by Vampire Survivors and StarCraft). It features a race-based evolution system, automatic combat, and persistent meta-progression.

### Key Technologies
- **Framework**: Vue 3 (Composition API)
- **Rendering**: Pixi.js v8 (2D WebGL/WebGPU)
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Bundler**: Vite

## Building and Running
The project follows standard npm scripts for Vite:

- `npm install`: Install dependencies.
- `npm run dev`: Start development server (usually at http://localhost:5173).
- `npm run build`: Compile and minify for production.
- `npm run preview`: Preview the production build locally.

## Architecture
The project is structured to separate game logic from UI and state:

- `src/engine/`: Main game loop (`GameEngine.ts`), input management, and gameplay systems (Spawner, Collision, Weapons).
- `src/entities/`: Class-based game objects (Player, Enemy, Projectile, Entity base).
- `src/stores/`: Pinia stores handling game session state (`gameStore.ts`) and persistent data.
- `src/config/`: Configuration files for balancing, race evolutions (`human.config.ts`), and upgrades.
- `src/components/`: Vue components for UI overlays (HUD, Upgrade menu, Game Over).

## Development Conventions
- **Rendering**: Keep all rendering logic inside Pixi.js containers. The Vue layer should only handle UI overlays and menus.
- **State**: Use Pinia for state that needs to be accessed by both Vue and Pixi.js (e.g., player XP, health, kills).
- **Performance**: Use object pooling for high-frequency entities like Projectiles and Gems (TODO).
- **Types**: Maintain strict TypeScript typing for all configurations and entity interactions.
- **Extensions**: New races and weapons should be added via the `src/config/` and `src/entities/` directories, following existing patterns.

## Current Status
- [x] Core Engine & Movement
- [x] Human Race (Marine evolution path)
- [x] Enemy Spawning & AI
- [x] Weapon System (Auto-targeting)
- [x] XP & Level-up System
- [x] Upgrade Selection UI
- [x] HUD & Game Over screens
- [x] Boss Encounters (5m Zergling, 10m Mutalisk)
- [x] Boss Loot (Increased XP gems)
- [ ] Persistent Save System (LocalStorage)
- [ ] Advanced Visual Effects (Particles, Screen Shake)
- [ ] Additional Races (Psionics, Bioforms)
