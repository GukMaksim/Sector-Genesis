# Sector Genesis — Project Context

## Project Overview
**Sector Genesis** is a sci-fi incremental "survivor-style" browser game (inspired by Vampire Survivors, The Tower, Brotato, and StarCraft). Features a deep 4-layer upgrade system, race-based evolution, automatic combat, weapon evolution synergies, and persistent meta-progression.

### Key Technologies
- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **Rendering**: Pixi.js v8 (2D WebGL/WebGPU)
- **State Management**: Pinia (3 stores: game, upgrade, meta)
- **Styling**: Tailwind CSS + custom sci-fi theme
- **Language**: TypeScript (strict)
- **Bundler**: Vite
- **No separate test/lint config found**

## Building and Running
- `npm install` — Install dependencies
- `npm run dev` — Start dev server (http://localhost:5173)
- `npm run build` — Type-check (`vue-tsc -b`) + production build (`vite build`)
- `npm run preview` — Preview production build locally

## Architecture

```
src/
├── engine/           — Main loop, PIXI systems
│   ├── GameEngine.ts — Singleton orchestrator (loop, collisions, spawn)
│   ├── managers/
│   │   └── InputManager.ts — Keyboard/mouse/touch input
│   └── systems/
│       ├── WeaponSystem.ts    — 5 weapons, behavior hooks (ricochet)
│       ├── SpawnerSystem.ts   — Enemy spawning with scaling
│       ├── BackgroundSystem.ts — Infinite tile grid + fog of war
│       └── IndicatorSystem.ts — Arrow indicators to resources
├── entities/         — PIXI game objects
│   ├── Entity.ts     — Abstract base (container, health bar)
│   ├── Player.ts     — Marine with 4-dir animations, evolution visuals
│   ├── Enemy.ts      — Zergling, Mutalisk + bosses
│   ├── Projectile.ts — With ricochet/pierce/splash support
│   ├── XpGem.ts      — Collector magnet behavior
│   └── ResourceNode.ts — Mineral/gas harvesting
├── upgrades/         — NEW: 4-layer upgrade system
│   ├── UpgradeManager.ts    — Central orchestrator
│   ├── UpgradeRegistry.ts   — All upgrade + evolution definitions
│   ├── types.ts             — Shared types (UpgradeDef, EvolutionDef, etc.)
│   ├── conditions.ts        — Prerequisites, rarity rolling (common→legendary)
│   ├── effects/
│   │   ├── StatEffect.ts       — Numeric stat modifiers
│   │   ├── BehaviorEffect.ts   — Behaviors (ricochet, stim pack)
│   │   └── WeaponModEffect.ts  — Per-weapon stat mods
│   ├── runes/          — Layer 1: 20 run-time upgrade definitions
│   │   ├── damageUpgrades.ts   — Heavy Barrels, Ricochet Rounds, Chain Lightning...
│   │   ├── utilityUpgrades.ts  — Stim Pack, Combat Shield, Sensor Drone...
│   │   └── weaponUpgrades.ts   — Gauss/Minigun/Rocket/Plasma Mastery + Requisitions
│   ├── evolutions/     — Layer 2: Weapon evolution synergies
│   │   └── index.ts           — Pyromancer Assault, Overcharge Protocol
│   ├── meta/           — Layer 3: Cross-run meta-progression
│   │   ├── MetaUpgradeManager.ts — localStorage persistence
│   │   └── metaUpgrades.ts      — 7 permanent upgrades
│   └── specializations/ — Layer 4: Class choice at level 10
│       ├── ReaperSpec.ts — Speed + close-quarters path
│       └── GhostSpec.ts  — Crit + stealth path
├── stores/           — Pinia state
│   ├── gameStore.ts     — Run state (level, resources, weapons, baseStats)
│   ├── upgradeStore.ts  — Active upgrades, behaviors, specializations
│   └── metaStore        — (handled via MetaUpgradeManager + localStorage)
├── config/
│   ├── human.config.ts  — Evolution stages (visual only, stats via upgrades)
│   └── skillTree.config.ts — (REMOVED — replaced by Layer 1 upgrades)
├── components/       — Vue UI overlays
│   ├── GameView.vue           — Main game shell + all overlays
│   ├── RaceSelection.vue      — Race picker + meta-upgrades button
│   ├── UpgradeChoice.vue      — "Choose 1 of 3" level-up overlay
│   ├── InRunShop.vue          — Field Armory (rerolls, heals, weapon requisitions)
│   ├── MetaUpgradePanel.vue   — Permanent upgrade shop (credits)
│   ├── SpecializationChoice.vue — Reaper/Ghost picker at level 10
│   ├── EvolutionNotification.vue — Evolution popup animation
│   ├── WeaponHotbar.vue       — Weapon selection (keys 1-4)
│   ├── Minimap.vue            — 150x150 fog-of-war minimap
│   └── MobileJoystick.vue     — Touch joystick
└── types/
    └── game.ts         — RaceType, WeaponId, EvolutionStage
```

## 4-Layer Upgrade System

| Layer | Name | When | Currency | Persistence |
|-------|------|------|----------|-------------|
| 1 | **Run-time Upgrades** | Every level-up (choose 1 of 3) | Free | Run only |
| 2 | **Weapon Evolutions** | Auto when 2 upgrades reach max level | Consumes base upgrades | Run only |
| 3 | **Meta-progression** | Between runs (menu or game-over) | Credits (earned per run) | localStorage |
| 4 | **Specializations** | Level 10 (Reaper or Ghost) | Free (one-time choice) | Run only |

### Rarity Weights for Upgrade Choice
- Common 55%, Uncommon 28%, Rare 13%, Legendary 4%

### Weapon Unlock Sources
- **Shop (ARMORY)**: Spend minerals/gas during run
- **Upgrade choices**: Rare "Requisition" cards appear in the pool (require prerequisites)
- **Meta-upgrades**: "Arsenal Access" permanently starts Minigun every run

### In-Run Currency Uses (Minerals/Gas)
- Re-roll upgrade choices (50 minerals)
- Extra choice (+1 option, 30 gas)
- Emergency heal +40 HP (75 minerals)
- Weapon requisitions (Minigun 200/100 → Orbital Laser 600/500)

## Development Conventions
- **PIXI only** for rendering; Vue handles UI overlays only
- **Pinia** bridges Vue ↔ Engine state
- **Strict TypeScript** for all configs and interactions
- New upgrades → add to `upgrades/runes/` (auto-registered by `UpgradeRegistry`)
- New evolutions → add to `upgrades/evolutions/`
- New meta-upgrades → add to `upgrades/meta/metaUpgrades.ts`
- New weapons → implement class in `WeaponSystem.ts` + add `WeaponId` type + add to shop/requisition pool

## Current Status
- [x] Core Engine & Movement
- [x] Human Race (Marine evolution path, 5 visual stages)
- [x] Enemy Spawning & AI (Zergling, Mutalisk, bosses)
- [x] Weapon System (GaussRifle, Minigun, RocketLauncher, PlasmaCannon, OrbitalLaser)
- [x] XP & Level-up System → triggers upgrade choice
- [x] Layer 1: Run-time upgrade choices (choose 1 of 3)
- [x] Layer 2: Weapon evolution synergies (Gauss+Stim → Flamethrower)
- [x] Layer 3: Meta-progression (7 permanent upgrades, localStorage)
- [x] Layer 4: Specializations (Reaper / Ghost at level 10)
- [x] In-Run Shop (ARMORY — rerolls, heals, weapon requisitions)
- [x] Ricochet behavior effect (bullets bounce to next target)
- [x] Stim Pack behavior effect (trigger on kill streak)
- [x] Weapon unlock via upgrade pool (Requisition cards)
- [x] Resource harvesting (minerals + gas) + indicator arrows
- [x] Boss Encounters (5m Zergling, 10m Mutalisk)
- [x] Boss Loot (50 small XP gems)
- [x] HUD, Minimap, Weapon Hotbar, Game Over screen
- [ ] Particle effects & screen shake
- [ ] Additional races (Psionics, Bioforms)
- [ ] Additional weapon evolution synergies
- [ ] Pixi.js object pooling for Projectiles/Gems
