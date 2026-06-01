Create a complete browser game inspired by Vampire Survivors mechanics but set in an original sci-fi universe.

Game Title: Sector Genesis

Requirements:

Tech Stack:
- Vue 3 Composition API
- TypeScript
- Vite
- Pixi.js (for 2D graphics rendering)
- No backend
- LocalStorage for save system

Core Gameplay:
- Auto-attacking survivor-style gameplay.
- WASD movement.
- Endless enemy waves.
- Experience gems dropped by enemies.
- Level-up system.
- Upgrade selection every level.
- Increasing difficulty over time.
- Boss every 5 minutes.

Race System:
Implement only one race for now:

HUMANS

Human evolution path:

Level 1:
- Marine Recruit
- Rifle weapon

Level 10:
- Marine Veteran
- Increased fire rate

Level 20:
- Heavy Trooper
- Dual rifles

Level 30:
- Siege Commander
- Explosive projectiles

Level 40:
- Dominion General
- Plasma cannon

Each evolution must visually change the character sprite and weapon effects.

Weapons:
- Rifle
- Minigun
- Rocket Launcher
- Plasma Cannon

Upgrade System:
Choose 1 of 3 upgrades on level up.

Examples:
- Damage +10%
- Attack Speed +15%
- Movement Speed +10%
- Critical Chance +5%
- Projectile Count +1
- Projectile Size +10%
- Pickup Radius +20%
- Max Health +20%

Enemies:
- Alien Swarmling
- Void Stalker
- Mutant Brute
- Plasma Beast
- Elite Variants

Enemy scaling:
- HP scaling
- Damage scaling
- Spawn rate scaling

Bosses:
- Hive Queen
- Void Titan
- Bio Colossus

Visual Style:
- Dark sci-fi battlefield.
- Futuristic military aesthetic.
- Neon effects.
- Particle explosions.
- Damage numbers.
- XP gem effects.

Progression:
Persistent account progression.

Meta Currency:
- Credits

Permanent upgrades:
- Damage
- Health
- XP Gain
- Movement Speed
- Critical Chance

Save System:
Automatically save:
- Credits
- Unlocks
- Highest Level
- Statistics

Statistics:
- Total kills
- Total playtime
- Highest level reached
- Bosses defeated

Architecture:
Create scalable architecture for future races:
- Humans
- Psionics (future)
- Bioforms (future)

Use:
src/
  entities/
  systems/
  weapons/
  enemies/
  races/
  upgrades/
  ui/
  effects/
  saves/

Code Requirements:
- Clean architecture
- Strong TypeScript typing
- Reusable systems
- No hardcoded values
- Config-driven balancing

Future-proof:
All race data, upgrades, weapons and enemies must be configurable through JSON-like configuration files.

Generate:
1. Project structure
2. Core game loop
3. Entity system
4. Weapon system
5. Upgrade system
6. Enemy AI
7. Save system
8. UI
9. Initial balancing values
10. Complete implementation plan

The code should be production-ready and easy to extend with additional races later.