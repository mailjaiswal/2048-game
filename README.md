# 🎮 2048 Classic Puzzle Game

A modern, responsive, and feature-packed web & mobile replica of the classic **2048 Number Puzzle Game** inspired by **Androbros 2048** (`com.androbros.puzzle2048eng`).

Built with pure **HTML5, CSS3, and modern Vanilla JavaScript**, featuring procedural Web Audio sound synthesis, smooth animations, touch gestures, multiple themes, grid sizes, and full offline PWA support.

---

## ✨ Features

### 🧩 1. Multiple Grid Sizes
- **3 × 3 (Quick):** Fast-paced, compact puzzle challenge.
- **4 × 4 (Classic):** The authentic, world-famous 2048 experience.
- **5 × 5 (Big):** Expanded strategy space for higher numbers.
- **6 × 6 (Giant):** For long-form puzzle enthusiasts.
- **8 × 8 (Extreme):** Massive board size for reaching super tiles (up to 131,072+).

### 🕹️ 2. Game Modes
- **Classic Mode:** Merge numbers to reach 2048, with option to "Keep Going" for 4096, 8192, and beyond.
- **Time Rush (60s):** Race against a 60-second countdown timer to achieve the highest score possible.
- **Practice Mode:** Explore strategies with unlimited multi-step **Undo**.

### 🎨 3. Beautiful Themes & Quick Light/Dark Switcher
Switch themes anytime with live preview:
- ☀️ / 🌙 **Quick Light / Dark Profile Switcher:** One-tap header icon to switch between Light profiles (Forest Fresh, Pastel Dream, Classic Warm) and Dark profiles (Dark Logic, Cyberpunk).
- 🌿 **Forest Fresh:** Calming organic greens and earth tones (from the design mock).
- 🌸 **Pastel Dream:** Soft, modern pastel aesthetics with peach and sky blue tiles.
- 🌙 **Dark Logic (OLED):** High-contrast AMOLED-friendly dark mode.
- 🎨 **Classic Warm:** Authentic 2048 color palette.
- ⚡ **Cyberpunk:** Vibrant neon and synthwave colors.

### 🔊 4. Web Audio & Haptics Engine
- **Procedural Audio:** Synthesized in real-time via Web Audio API (zero heavy audio files to load).
- **Pitch-scaling merges:** Higher tile merges play higher harmonious chords.
- **Victory Fanfare & Melancholic Game Over:** Custom musical cues for game events.
- **Haptic Feedback:** Vibration API integration for tactile mobile response.
- **Mute Toggle:** Quickly enable or disable sound effects.

### 📱 5. Mobile & PWA Ready
- **Gesture Controls:** High-precision touch swipe detection (Up, Down, Left, Right).
- **On-Screen D-Pad:** Optional on-screen directional buttons for one-handed play or accessibility.
- **Progressive Web App (PWA):** Installable on Android & iOS ("Add to Home Screen").
- **100% Offline Support:** Service worker caches all assets for continuous play without an internet connection.

### 📊 6. Analytics & Auto-Save
- **Auto-Save:** Saves board state automatically after each move; never lose progress on refresh or tab close.
- **High Scores:** Tracks best scores independently for each grid size and mode.
- **Stats Dashboard:** Tracks total games played, win rate percentage, and highest tile reached.
- **Reset Protection:** Confirmation modal prevents accidental game resets.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v16 or newer recommended) or any static file server.

### 2. Run the Local Server
From the project folder, start the lightweight built-in server:

```bash
node server.js
```

### 3. Open in Browser
- **On Desktop:** [http://localhost:3000](http://localhost:3000)
- **On Mobile (Same Wi-Fi):** Open your phone's browser and go to `http://<your-local-ip>:3000` (e.g., `http://192.168.1.6:3000`).

---

## 🕹️ Controls Guide

| Control | Action |
| :--- | :--- |
| **Swipe (Up / Down / Left / Right)** | Slide tiles in swipe direction (Mobile/Touch) |
| **Arrow Keys (`↑`, `↓`, `←`, `→`)** | Slide tiles (Desktop) |
| **`W`, `A`, `S`, `D` Keys** | Slide tiles (Alternative desktop controls) |
| **`Ctrl + Z` / Undo Button** | Step backwards to previous state |
| **On-Screen D-Pad** | Tap directional buttons |

---

## 📂 Project Structure

```
.
├── index.html        # Main HTML layout, modal dialogs, header & HUD
├── style.css         # Responsive styling, color themes, tile animations
├── game.js           # Core 2048 engine, swipe handlers, state persistence
├── audio.js          # Procedural Web Audio API sound & haptic engine
├── icon.svg          # High-resolution vector app icon
├── manifest.json     # PWA manifest for mobile installation
├── sw.js             # Service Worker for offline playback
├── server.js         # Lightweight local Node.js static HTTP server
└── README.md         # Documentation & guide
```

---

## 🛠️ Built With

- **HTML5** (Semantic layout, Canvas confetti, PWA integration)
- **CSS3** (CSS Grid, Flexbox, Custom Variables, Cubic-bezier keyframes)
- **Vanilla JavaScript ES6+** (Matrix transformation algorithms, Event listeners)
- **Web Audio API** (Oscillator & GainNode sound synthesis)
- **Service Worker API** (Cache Storage for full offline availability)

---

## 📄 License
MIT License. Free to use, modify, and distribute.
