/**
 * 2048 Tactile Game Engine
 * Implements Modern-Tactile Hybrid UI Design & Full Gameplay Mechanics
 */

class GameManager {
  constructor() {
    this.size = 4;
    this.mode = 'classic'; // 'classic', 'timerush', 'practice'
    this.theme = 'forest';
    this.grid = [];
    this.score = 0;
    this.moves = 0;
    this.bestScores = {};
    this.history = [];
    this.won = false;
    this.over = false;
    this.keepPlaying = false;
    this.tileCounter = 0;
    this.timerSeconds = 60;
    this.timerInterval = null;

    // DOM Elements
    this.gridContainer = document.getElementById('gridContainer');
    this.tileContainer = document.getElementById('tileContainer');
    this.scoreDisplay = document.getElementById('scoreDisplay');
    this.bestScoreDisplay = document.getElementById('bestScoreDisplay');
    this.movesDisplay = document.getElementById('movesDisplay');
    this.timerDisplay = document.getElementById('timerDisplay');
    this.timerBadge = document.getElementById('timerBadge');
    this.gridSizeLabel = document.getElementById('gridSizeLabel');
    this.overlay = document.getElementById('gameOverlay');
    this.overlayTitle = document.getElementById('overlayTitle');
    this.overlayMsg = document.getElementById('overlayMsg');
    this.btnKeepGoing = document.getElementById('btnKeepGoing');
    this.undoBtn = document.getElementById('btnUndo');

    this.loadSettingsAndStats();
    this.setupEventListeners();
    this.initGame();
  }

  // Load persistent stats and high scores
  loadSettingsAndStats() {
    try {
      const savedScores = localStorage.getItem('2048_best_scores');
      if (savedScores) {
        this.bestScores = JSON.parse(savedScores);
      }

      let savedTheme = localStorage.getItem('2048_theme') || 'forest';
      if (savedTheme !== 'forest' && savedTheme !== 'dark') {
        savedTheme = 'forest';
      }
      this.setTheme(savedTheme);

      const savedSize = localStorage.getItem('2048_size');
      if (savedSize) {
        const parsed = parseInt(savedSize, 10);
        this.size = [3, 4, 5, 6, 8].includes(parsed) ? parsed : 4;
      } else {
        this.size = 4;
      }

      const savedMode = localStorage.getItem('2048_mode');
      if (savedMode) {
        this.mode = savedMode;
      }
    } catch (e) {
      console.warn("Storage load error:", e);
    }
  }

  isDarkTheme(themeName = this.theme) {
    return themeName === 'dark';
  }

  setTheme(themeName) {
    // Retain only forest (light) and dark (dark)
    const activeTheme = themeName === 'dark' ? 'dark' : 'forest';
    this.theme = activeTheme;
    document.body.setAttribute('data-theme', activeTheme);
    localStorage.setItem('2048_theme', activeTheme);

    // Update active state on theme chips
    document.querySelectorAll('#themeOptions .theme-card-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-theme') === activeTheme);
    });

    // Update Light / Dark toggle icon & label in bottom nav
    const themeModeIcon = document.getElementById('themeModeIcon');
    const themeModeLabel = document.getElementById('themeModeLabel');
    if (themeModeIcon) {
      themeModeIcon.textContent = activeTheme === 'dark' ? 'light_mode' : 'dark_mode';
    }
    if (themeModeLabel) {
      themeModeLabel.textContent = activeTheme === 'dark' ? 'Light' : 'Dark';
    }
  }

  toggleThemeMode() {
    const nextTheme = this.theme === 'dark' ? 'forest' : 'dark';
    this.setTheme(nextTheme);
    if (window.soundEngine) {
      window.soundEngine.playClick();
    }
  }

  getBestScoreKey() {
    return `${this.size}x${this.size}_${this.mode}`;
  }

  getBestScore() {
    return this.bestScores[this.getBestScoreKey()] || 0;
  }

  updateBestScoreDisplay() {
    const best = this.getBestScore();
    this.bestScoreDisplay.textContent = best.toLocaleString();
  }

  saveBestScore() {
    const key = this.getBestScoreKey();
    if (!this.bestScores[key] || this.score > this.bestScores[key]) {
      this.bestScores[key] = this.score;
      localStorage.setItem('2048_best_scores', JSON.stringify(this.bestScores));
      this.updateBestScoreDisplay();
    }
  }

  // Auto-Save active state
  saveState() {
    if (this.over) {
      localStorage.removeItem(`2048_state_${this.size}_${this.mode}`);
      return;
    }
    const state = {
      size: this.size,
      mode: this.mode,
      grid: this.grid.map(row => row.map(cell => cell ? { id: cell.id, value: cell.value } : null)),
      score: this.score,
      moves: this.moves,
      won: this.won,
      keepPlaying: this.keepPlaying,
      timerSeconds: this.timerSeconds
    };
    localStorage.setItem(`2048_state_${this.size}_${this.mode}`, JSON.stringify(state));
  }

  loadSavedState() {
    try {
      const saved = localStorage.getItem(`2048_state_${this.size}_${this.mode}`);
      if (!saved) return false;
      const state = JSON.parse(saved);
      if (state.size !== this.size || state.mode !== this.mode) return false;

      this.score = state.score;
      this.moves = state.moves;
      this.won = state.won;
      this.keepPlaying = state.keepPlaying;
      this.timerSeconds = state.timerSeconds || 60;
      this.history = [];

      this.grid = this.emptyGrid();
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (state.grid[r] && state.grid[r][c]) {
            this.tileCounter++;
            this.grid[r][c] = {
              id: this.tileCounter,
              value: state.grid[r][c].value,
              row: r,
              col: c
            };
          }
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // Initialize Game Board
  initGame() {
    this.clearIntervals();
    this.over = false;
    this.won = false;
    this.keepPlaying = false;
    this.history = [];
    this.hideOverlay();

    // Adjust grid CSS size
    this.boardWrapper = document.getElementById('boardWrapper');
    this.boardWrapper.className = `board-container grid-size-${this.size}`;
    this.gridContainer.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
    this.gridContainer.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;

    if (this.gridSizeLabel) {
      this.gridSizeLabel.textContent = `${this.size} × ${this.size}`;
    }

    // Update modal chips selection
    document.querySelectorAll('#gridSizeOptions .chip-btn').forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.getAttribute('data-size'), 10) === this.size);
    });
    document.querySelectorAll('#gameModeOptions .chip-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-mode') === this.mode);
    });

    // Render background grid slots
    this.gridContainer.innerHTML = '';
    for (let i = 0; i < this.size * this.size; i++) {
      const slot = document.createElement('div');
      slot.className = 'grid-slot';
      this.gridContainer.appendChild(slot);
    }

    // Try loading saved game or start fresh
    const loaded = this.loadSavedState();
    if (!loaded) {
      this.grid = this.emptyGrid();
      this.score = 0;
      this.moves = 0;
      this.timerSeconds = this.mode === 'timerush' ? 60 : 0;
      this.addRandomTile();
      this.addRandomTile();
    }

    this.updateStatsDisplay();
    this.updateBestScoreDisplay();
    this.renderTiles();
    this.saveState();

    if (this.mode === 'timerush') {
      this.timerBadge.style.display = 'flex';
      this.startTimer();
    } else {
      this.timerBadge.style.display = 'none';
    }

    this.updateUndoButton();
  }

  emptyGrid() {
    const grid = [];
    for (let r = 0; r < this.size; r++) {
      grid[r] = [];
      for (let c = 0; c < this.size; c++) {
        grid[r][c] = null;
      }
    }
    return grid;
  }

  getEmptyCells() {
    const cells = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (!this.grid[r][c]) {
          cells.push({ row: r, col: c });
        }
      }
    }
    return cells;
  }

  addRandomTile() {
    const emptyCells = this.getEmptyCells();
    if (emptyCells.length === 0) return;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    this.tileCounter++;

    this.grid[randomCell.row][randomCell.col] = {
      id: this.tileCounter,
      value: value,
      row: randomCell.row,
      col: randomCell.col,
      isNew: true
    };
  }

  // Render Tiles
  renderTiles() {
    this.tileContainer.innerHTML = '';
    const cellSizePercent = 100 / this.size;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const tile = this.grid[r][c];
        if (tile) {
          const tileElem = document.createElement('div');
          let classes = `tile tile-${tile.value}`;
          if (tile.isNew) classes += ' tile-appear';
          if (tile.isMerged) classes += ' tile-pop';

          tileElem.className = classes;
          tileElem.style.width = `calc(${cellSizePercent}% - 10px)`;
          tileElem.style.height = `calc(${cellSizePercent}% - 10px)`;
          tileElem.style.left = `calc(${c * cellSizePercent}% + 5px)`;
          tileElem.style.top = `calc(${r * cellSizePercent}% + 5px)`;

          const inner = document.createElement('div');
          inner.className = 'tile-inner';
          inner.textContent = tile.value;
          tileElem.appendChild(inner);

          this.tileContainer.appendChild(tileElem);

          // Clear transient flags
          tile.isNew = false;
          tile.isMerged = false;
        }
      }
    }
  }

  // Push snapshot to history stack for Undo
  pushHistory() {
    const snapshot = {
      grid: this.grid.map(row => row.map(c => c ? { id: c.id, value: c.value, row: c.row, col: c.col } : null)),
      score: this.score,
      moves: this.moves,
      won: this.won,
      keepPlaying: this.keepPlaying,
      timerSeconds: this.timerSeconds
    };
    this.history.push(snapshot);
    if (this.history.length > 25) {
      this.history.shift();
    }
    this.updateUndoButton();
  }

  undo() {
    if (this.history.length === 0 || this.over) return;
    const previous = this.history.pop();
    if (!previous) return;

    this.grid = previous.grid.map(row => row.map(c => c ? { id: c.id, value: c.value, row: c.row, col: c.col } : null));
    this.score = previous.score;
    this.moves = previous.moves;
    this.won = previous.won;
    this.keepPlaying = previous.keepPlaying;
    this.timerSeconds = previous.timerSeconds;

    if (window.soundEngine) {
      window.soundEngine.playUndo();
      window.soundEngine.vibrate(20);
    }

    this.hideOverlay();
    this.updateStatsDisplay();
    this.renderTiles();
    this.saveState();
    this.updateUndoButton();
  }

  updateUndoButton() {
    if (this.undoBtn) {
      this.undoBtn.disabled = this.history.length === 0 || this.over;
    }
  }

  // Move Logic (0: up, 1: right, 2: down, 3: left)
  move(direction) {
    if (this.over) return;

    const vectors = {
      0: { x: 0, y: -1 }, // Up
      1: { x: 1, y: 0 },  // Right
      2: { x: 0, y: 1 },  // Down
      3: { x: -1, y: 0 }  // Left
    };

    const vector = vectors[direction];
    const traversals = this.buildTraversals(vector);
    let moved = false;
    let turnScore = 0;
    let highestMerged = 0;

    // Snapshot before modifying
    const preMoveGrid = this.grid.map(r => r.map(c => c ? { ...c } : null));
    const preMoveScore = this.score;
    const preMoveMoves = this.moves;

    // Clear merged status
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c]) {
          this.grid[r][c].mergedFrom = null;
        }
      }
    }

    traversals.x.forEach(c => {
      traversals.y.forEach(r => {
        const cell = this.grid[r][c];
        if (cell) {
          const positions = this.findFarthestPosition({ row: r, col: c }, vector);
          const next = positions.next;

          // Check if can merge
          if (
            next &&
            this.grid[next.row][next.col] &&
            this.grid[next.row][next.col].value === cell.value &&
            !this.grid[next.row][next.col].mergedFrom
          ) {
            const mergedValue = cell.value * 2;
            this.tileCounter++;
            const mergedTile = {
              id: this.tileCounter,
              value: mergedValue,
              row: next.row,
              col: next.col,
              isMerged: true,
              mergedFrom: [cell, this.grid[next.row][next.col]]
            };

            this.grid[next.row][next.col] = mergedTile;
            this.grid[r][c] = null;

            turnScore += mergedValue;
            if (mergedValue > highestMerged) {
              highestMerged = mergedValue;
            }

            if (mergedValue === 2048 && !this.won && !this.keepPlaying) {
              this.won = true;
            }

            moved = true;
          } else if (positions.farthest.row !== r || positions.farthest.col !== c) {
            // Normal slide to farthest empty slot
            this.grid[positions.farthest.row][positions.farthest.col] = cell;
            cell.row = positions.farthest.row;
            cell.col = positions.farthest.col;
            this.grid[r][c] = null;
            moved = true;
          }
        }
      });
    });

    if (moved) {
      // Save prior state to history for undo
      this.history.push({
        grid: preMoveGrid,
        score: preMoveScore,
        moves: preMoveMoves,
        won: this.won,
        keepPlaying: this.keepPlaying,
        timerSeconds: this.timerSeconds
      });
      if (this.history.length > 25) this.history.shift();

      this.moves++;
      if (turnScore > 0) {
        this.score += turnScore;
        this.showScoreAddition(turnScore);
        this.saveBestScore();
        if (window.soundEngine) {
          window.soundEngine.playMerge(highestMerged);
          window.soundEngine.vibrate(35);
        }
      } else {
        if (window.soundEngine) {
          window.soundEngine.playSlide();
          window.soundEngine.vibrate(12);
        }
      }

      this.addRandomTile();
      this.updateStatsDisplay();
      this.renderTiles();
      this.saveState();
      this.updateUndoButton();

      // Check win condition
      if (this.won && !this.keepPlaying) {
        this.handleWin();
      } else if (!this.movesAvailable()) {
        this.handleGameOver();
      }
    }
  }

  buildTraversals(vector) {
    const traversals = { x: [], y: [] };
    for (let pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();
    return traversals;
  }

  findFarthestPosition(cell, vector) {
    let previous;
    let current = { row: cell.row, col: cell.col };

    do {
      previous = current;
      current = {
        row: previous.row + vector.y,
        col: previous.col + vector.x
      };
    } while (this.withinBounds(current) && !this.grid[current.row][current.col]);

    return {
      farthest: previous,
      next: this.withinBounds(current) ? current : null
    };
  }

  withinBounds(position) {
    return (
      position.row >= 0 &&
      position.row < this.size &&
      position.col >= 0 &&
      position.col < this.size
    );
  }

  movesAvailable() {
    if (this.getEmptyCells().length > 0) return true;

    // Check adjacent matches
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const tile = this.grid[r][c];
        if (tile) {
          const dirs = [
            { r: 0, c: 1 },
            { r: 1, c: 0 }
          ];
          for (const d of dirs) {
            const nr = r + d.r;
            const nc = c + d.c;
            if (this.withinBounds({ row: nr, col: nc })) {
              const other = this.grid[nr][nc];
              if (other && other.value === tile.value) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  handleWin() {
    if (window.soundEngine) {
      window.soundEngine.playWin();
    }
    this.triggerConfetti();
    this.overlayTitle.textContent = "You Win!";
    this.overlayMsg.textContent = `Brilliant! You reached the 2048 tile in ${this.moves} moves!`;
    this.btnKeepGoing.style.display = 'inline-flex';
    this.overlay.classList.add('active');
    this.recordGameStats(true);
  }

  handleGameOver() {
    this.over = true;
    this.clearIntervals();
    if (window.soundEngine) {
      window.soundEngine.playGameOver();
    }
    this.overlayTitle.textContent = "Game Over!";
    this.overlayMsg.textContent = `No moves remaining! Final Score: ${this.score.toLocaleString()}`;
    this.btnKeepGoing.style.display = 'none';
    this.overlay.classList.add('active');
    this.recordGameStats(false);
    this.updateUndoButton();
  }

  hideOverlay() {
    this.overlay.classList.remove('active');
  }

  showScoreAddition(amount) {
    const addition = document.createElement('div');
    addition.className = 'score-addition';
    addition.textContent = `+${amount}`;
    this.scoreDisplay.parentElement.appendChild(addition);
    setTimeout(() => addition.remove(), 750);
  }

  updateStatsDisplay() {
    this.scoreDisplay.textContent = this.score.toLocaleString();
    if (this.movesDisplay) {
      this.movesDisplay.textContent = this.moves;
    }
    if (this.timerDisplay && this.mode === 'timerush') {
      this.timerDisplay.textContent = `${this.timerSeconds}s`;
    }
  }

  startTimer() {
    this.clearIntervals();
    this.timerInterval = setInterval(() => {
      if (this.over) return;
      this.timerSeconds--;
      if (this.timerDisplay) {
        this.timerDisplay.textContent = `${this.timerSeconds}s`;
      }
      if (this.timerSeconds <= 0) {
        this.handleGameOver();
      }
    }, 1000);
  }

  clearIntervals() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Record stats into local storage
  recordGameStats(won) {
    try {
      let stats = JSON.parse(localStorage.getItem('2048_analytics') || '{}');
      stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
      if (won) stats.wins = (stats.wins || 0) + 1;
      stats.totalScore = (stats.totalScore || 0) + this.score;
      stats.totalMoves = (stats.totalMoves || 0) + this.moves;

      let maxTile = 0;
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.grid[r][c] && this.grid[r][c].value > maxTile) {
            maxTile = this.grid[r][c].value;
          }
        }
      }
      stats.bestTile = Math.max(stats.bestTile || 0, maxTile);
      localStorage.setItem('2048_analytics', JSON.stringify(stats));
    } catch (e) {}
  }

  triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#cfbcff', '#4A5D45', '#E6B022', '#e7c365', '#00f0ff', '#ff007f'];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.life -= 0.015;
        if (p.life > 0) {
          alive = true;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      });
      if (alive) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  }

  // Setup Event Listeners
  setupEventListeners() {
    // Keyboard Controls
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        this.move(0);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        this.move(1);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        this.move(2);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        this.move(3);
      } else if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.undo();
      }
    });

    // Touch Swipe Controls
    let touchStartX = 0;
    let touchStartY = 0;
    const board = document.getElementById('boardWrapper');

    board.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      e.preventDefault();
    }, { passive: false });

    board.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    board.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 0) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const threshold = 25;

      if (Math.max(absDx, absDy) > threshold) {
        if (absDx > absDy) {
          this.move(dx > 0 ? 1 : 3);
        } else {
          this.move(dy > 0 ? 2 : 0);
        }
      }
    }, { passive: false });

    // Grid Size Options in Modal
    document.querySelectorAll('#gridSizeOptions .chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const newSize = parseInt(btn.getAttribute('data-size'), 10);
        if (this.size !== newSize) {
          this.size = newSize;
          localStorage.setItem('2048_size', this.size.toString());
          this.initGame();
        }
      });
    });

    // Game Mode Options in Modal
    document.querySelectorAll('#gameModeOptions .chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const newMode = btn.getAttribute('data-mode');
        if (this.mode !== newMode) {
          this.mode = newMode;
          localStorage.setItem('2048_mode', this.mode);
          this.initGame();
        }
      });
    });

    // Theme Selection in Modal
    document.querySelectorAll('#themeOptions .theme-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        this.setTheme(theme);
      });
    });

    // Bottom Navigation Bar Buttons
    document.getElementById('btnUndo')?.addEventListener('click', () => this.undo());

    document.getElementById('btnNewGame')?.addEventListener('click', () => {
      if (this.score > 0 && !this.over) {
        this.openModal('confirmModal');
      } else {
        this.initGame();
      }
    });

    document.getElementById('btnThemes')?.addEventListener('click', () => {
      this.openModal('themesModal');
    });

    document.getElementById('btnStats')?.addEventListener('click', () => {
      this.populateStatsModal();
      this.openModal('statsModal');
    });

    // Top Bar Buttons
    document.getElementById('btnGridMenu')?.addEventListener('click', () => {
      this.openModal('gridModal');
    });

    document.getElementById('btnThemeToggle')?.addEventListener('click', () => {
      this.toggleThemeMode();
    });

    document.getElementById('btnSettings')?.addEventListener('click', () => {
      this.openModal('settingsModal');
    });

    // Sound toggle
    const btnSound = document.getElementById('btnSound');
    const soundIcon = document.getElementById('soundIcon');
    if (btnSound) {
      const updateSoundUI = () => {
        const on = window.soundEngine && window.soundEngine.enabled;
        if (soundIcon) soundIcon.textContent = on ? 'volume_up' : 'volume_off';
      };
      updateSoundUI();
      btnSound.addEventListener('click', () => {
        window.soundEngine.toggle();
        updateSoundUI();
      });
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-layer');
        if (modal) modal.classList.remove('active');
      });
    });

    // First-Time Onboarding Overlay Actions
    const hasSeenOnboarding = localStorage.getItem('2048_has_seen_onboarding');
    if (!hasSeenOnboarding) {
      setTimeout(() => {
        this.openModal('onboardingOverlay');
      }, 400);
    }

    document.getElementById('btnGotItOnboarding')?.addEventListener('click', () => {
      localStorage.setItem('2048_has_seen_onboarding', 'true');
      this.closeModal('onboardingOverlay');
      if (window.soundEngine) window.soundEngine.playClick();
    });

    document.getElementById('btnShowInstallGuide')?.addEventListener('click', () => {
      this.closeModal('settingsModal');
      this.openModal('onboardingOverlay');
    });

    // Confirmation Modal Action
    document.getElementById('btnConfirmRestart')?.addEventListener('click', () => {
      this.closeModal('confirmModal');
      this.initGame();
    });

    // Overlay Actions
    this.btnKeepGoing?.addEventListener('click', () => {
      this.keepPlaying = true;
      this.hideOverlay();
    });

    document.getElementById('btnRetry')?.addEventListener('click', () => {
      this.initGame();
    });
  }

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  populateStatsModal() {
    try {
      const stats = JSON.parse(localStorage.getItem('2048_analytics') || '{}');
      document.getElementById('statGamesPlayed').textContent = stats.gamesPlayed || 0;
      const winRate = stats.gamesPlayed ? Math.round(((stats.wins || 0) / stats.gamesPlayed) * 100) : 0;
      document.getElementById('statWinRate').textContent = `${winRate}%`;
      document.getElementById('statBestTile').textContent = stats.bestTile || 0;
      document.getElementById('statBestScore').textContent = this.getBestScore().toLocaleString();
    } catch (e) {}
  }
}

// Instantiate game on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.game = new GameManager();

  // Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('SW registration note:', err);
    });
  }
});
