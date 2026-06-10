# Sector Genesis Agent Guide

## Commands
- `npm run dev` — Start Vite dev server
- `npm run build` — Type-check (`vue-tsc -b`) then production build (`vite build`)
- `npm run preview` — Preview production build locally
- No test, lint, or formatter config exists

## TypeScript
- Strict mode via `@vue/tsconfig/tsconfig.dom.json`
- `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` enforced
- `erasableSyntaxOnly` = `enum`, `namespace`, and constructor parameter properties are compile errors
- TypeScript ~6.0, Vue 3 with `<script setup lang="ts">`, Pinia stores

## Architecture
- **Pixi.js v8** GameEngine singleton orchestrates all rendering (spawner, weapon, background, indicators)
- **Vue 3** handles UI overlays only (HUD, menus, shop, upgrade choices)
- **Pinia** bridges Vue ↔ Engine — `gameStore` (run state), `upgradeStore` (active upgrades/behaviors)
- No `metaStore` — meta-progression uses `MetaUpgradeManager` + `localStorage` directly
- Engine instance exposed globally: `(window as any).gameEngine` — used by stores to call weapon system / player methods
- Entrypoint: `src/main.ts` → `App.vue` → `RaceSelection` or `GameView`

## Movement
- WASD + Arrow keys, mouse-hold-to-move, touch joystick (`.mobile-only`, visible on `pointer: coarse`)
- `InputManager` (singleton) sums all input vectors and normalizes

## Upgrade System (4 layers)
| Layer | What | When | Currency |
|-------|------|------|----------|
| 1 | Run-time upgrades | Every level-up (choose 1 of 3) | Free |
| 2 | Weapon evolutions | Auto when prerequisites met | Consumes base upgrades |
| 3 | Meta-progression | Between runs (RaceSelection or GameOver) | Credits → localStorage |
| 4 | Specializations (Reaper/Ghost) | Level 10 | Free (one-time) |

Rarity weights: Common 55%, Uncommon 28%, Rare 13%, Legendary 4%.

## Weapons (5)
`gauss_rifle` | `minigun` | `rocket_launcher` | `plasma_cannon` | `orbital_laser`
- Type `WeaponId` in `src/types/game.ts`; classes extending `BaseWeapon` in `src/engine/systems/WeaponSystem.ts`
- Add new weapons: class in `WeaponSystem.ts` + add `WeaponId` type + add to shop/requisition pool
- Orbital Laser fires independently alongside the active weapon

## Resource Nodes
- Mineral + gas clusters spawn around player; respawn 60s after depletion
- Directional indicators point to nearest resources via `IndicatorSystem`

## Bosses
- Zergling boss at ~5 min, Mutalisk boss at ~10 min; drop 50 small XP gems

## Meta Progression
- `MetaUpgradeManager` stores data in `localStorage` under key `sector-genesis-meta`
- 7 permanent upgrades defined in `src/upgrades/meta/metaUpgrades.ts`
- Credits earned per run: `kills * 0.5 + level * 5 + time * 0.1`

## Styling
- Tailwind CSS v4 via `@tailwindcss/postcss` plugin (CSS-based config; `tailwind.config.js` still present for `content`/`theme` but v4 resolves from CSS `@tailwind` directives)
- Custom colors: `sci-fi-blue` `#00f2ff`, `sci-fi-red` `#ff003c`, `sci-fi-green` `#00ff41`
- CSS variables in `src/style.css` for surface/line/text colors
- Font: Rajdhani (system-ui fallback)
- VSCode: `Vue.volar` extension recommended in `.vscode/extensions.json`

## Deployment
- Vercel SPA rewrite: `/(.*)` → `/index.html`
- Build output in `dist/`

## Adding Content
- Upgrades → add to `src/upgrades/runes/` (auto-registered by `UpgradeRegistry` via import in `UpgradeRegistry.ts`)
- Evolutions → add to `src/upgrades/evolutions/index.ts`
- Meta-upgrades → add to `src/upgrades/meta/metaUpgrades.ts`
- New weapons → class in `WeaponSystem.ts` + `WeaponId` type + shop entries

## Reference
- `GEMINI.md` has a detailed architecture tree and full upgrade system docs (may drift from code)
- `README.md` has basic setup instructions
