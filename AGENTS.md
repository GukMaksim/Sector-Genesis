# Sector Genesis Agent Guide

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Type check then build for production (`vue-tsc -b && vite build`)
- `npm run preview` - Preview production build locally

## Project Structure
- `src/` - Main source code
  - `components/` - Vue components
  - `stores/` - Pinia state stores
  - `entities/` - Game entity definitions
  - `engine/` - Core game engine logic (Pixi.js rendering)
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions
  - `assets/` - Static assets
  - `App.vue` - Root component
  - `main.ts` - Application entry point

## Tech Stack
- Vue 3 with `<script setup>` SFCs
- TypeScript
- Vite build tool
- Pinia for state management
- Pixi.js for rendering
- Tailwind CSS for styling (custom colors: sci-fi-blue, sci-fi-red, sci-fi-green)

## Important Notes
- Type checking is run as part of the build process via `vue-tsc -b`
- The project uses Vue 3 Composition API with `<script setup>`
- Tailwind configuration includes custom sci-fi colors and noise background
- No separate test configuration found in standard locations
- No linting/formatting configuration found in standard locations