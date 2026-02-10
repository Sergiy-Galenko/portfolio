# Escape the Deadline

Simple 2D RPG-style room crawler.
Defeat enemies in each room to unlock the next door.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Zustand (game state)
- Framer Motion (room transitions and lightweight UI animations)
- Inline SVG sprites (hero + enemies)
- `localStorage` checkpoint persistence (no backend)

## Game Flow

- `Loading Screen` is shown first
- `Character Select` is shown second (`MAG` or `Mechnyk`)
- `Room 0` to `Room 4`: clear all enemies to open next door
- `Room 5`: final portal room
- After each cleared location, a portfolio info card appears

## Player Controls

- Move: `WASD` or arrow keys
- Attack: `F` or `Space`
- Use door: `E` or `Enter`
- Mobile fallback: on-screen buttons

## HUD

Top HUD is shown in all rooms and includes:

- `HP` = energy
- `XP` = enemies defeated / rooms cleared
- `Coins` = battle rewards
- Room indicator: `Room N/5 + Title`

## Run Locally

```bash
npm install
npm run dev
```

If default port is busy:

```bash
npm run dev -- --port 4010
```

Production checks:

```bash
npm run lint
npm run build
```

## Checkpoint Persistence

Checkpoint is auto-saved to `localStorage` on state change:

- `phase`
- `currentRoom`
- `heroClass`
- `defeatedEnemies`
- `clearedRooms`
- `shownPortfolioRooms`
- `soundOn`
- `hudStats` (`hp`, `xp`, `coins`)

## Project Structure

```txt
src/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
    LoadingScreen.tsx
    CharacterSelectScreen.tsx
    GameShell.tsx
    HUD.tsx
    RoomExplorer.tsx
    RoomRenderer.tsx
    sprites/
      HeroSprite.tsx
      EnemySprite.tsx
  data/
    locationPortfolio.json
  state/
    gameStore.ts
  lib/
    storage.ts
    rooms.ts
  types/
    game.ts
```
