// ===================================================
// GAME STATE & CONSTANTS
// ===================================================
const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

let boardState = Array(9).fill('');
let currentPlayer = 'X';
let isGameActive = true;
let currentMode = 'pvp'; // 'pvp' | 'ai-easy' | 'ai-hard'
let isAiThinking = false;
let soundEnabled = true;

let scores = {
  X: 0,
  O: 0,
  ties: 0
};

// Load saved scores if available
const savedScores = localStorage.getItem('xo_scores');
if (savedScores) {
  try {
    scores = JSON.parse(savedScores);
  } catch (e) {}
}

// ===================================================
// DOM ELEMENTS
// ===================================================
const cells = document.querySelectorAll('.cell');
const turnIndicator = document.getElementById('turn-indicator');
const turnText = document.getElementById('turn-text');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreTiesEl = document.getElementById('score-ties');
const cardXEl = document.getElementById('card-x');
const cardOEl = document.getElementById('card-o');
const labelXEl = document.getElementById('label-x');
const labelOEl = document.getElementById('label-o');
const modeButtons = document.querySelectorAll('.mode-btn');
const restartBtn = document.getElementById('restart-btn');
const resetScoresBtn = document.getElementById('reset-scores-btn');
const soundToggleBtn = document.getElementById('sound-toggle');
const themeToggleBtn = document.getElementById('theme-toggle');

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalMsg = document.getElementById('modal-msg');
const modalEmoji = document.getElementById('modal-emoji');
const modalPlayAgainBtn = document.getElementById('modal-play-again-btn');

// ===================================================
// WEB AUDIO API SOUND SYSTEM
// ===================================================
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {}
}

function playMoveSound(player) {
  if (player === 'X') {
    playTone(520, 'sine', 0.12, 0.2);
  } else {
    playTone(400, 'sine', 0.12, 0.2);
  }
}

function playWinSound() {
  if (!soundEnabled) return;
  try {
    initAudio();
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 'triangle', 0.25, 0.25), i * 110);
    });
  } catch (err) {}
}

function playDrawSound() {
  if (!soundEnabled) return;
  try {
    initAudio();
    playTone(280, 'sawtooth', 0.2, 0.15);
    setTimeout(() => playTone(220, 'sawtooth', 0.3, 0.15), 180);
  } catch (err) {}
}

// ===================================================
// CONFETTI CELEBRATION
// ===================================================
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
let confettiParticles = [];
let confettiAnimationId = null;

function resizeConfettiCanvas() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

function launchConfetti() {
  if (!ctx) return;
  cancelAnimationFrame(confettiAnimationId);
  confettiParticles = [];
  const colors = ['#38bdf8', '#f43f5e', '#fbbf24', '#34d399', '#a855f7'];

  for (let i = 0; i < 90; i++) {
    confettiParticles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      life: 1
    });
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    confettiParticles.forEach((p) => {
      if (p.life > 0) {
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.rotation += p.vRot;
        p.life -= 0.015;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive) {
      confettiAnimationId = requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  renderConfetti();
}

// ===================================================
// GAME LOGIC
// ===================================================
function updateScoreboard() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreTiesEl.textContent = scores.ties;
  localStorage.setItem('xo_scores', JSON.stringify(scores));
}

function updateTurnIndicator() {
  turnText.textContent = currentPlayer;
  if (currentPlayer === 'X') {
    turnText.className = 'turn-badge x-turn';
    cardXEl.classList.add('active');
    cardOEl.classList.remove('active');
  } else {
    turnText.className = 'turn-badge o-turn';
    cardOEl.classList.add('active');
    cardXEl.classList.remove('active');
  }
}

function updateModeLabels() {
  if (currentMode === 'pvp') {
    labelXEl.textContent = 'Người chơi X';
    labelOEl.textContent = 'Người chơi O';
  } else {
    labelXEl.textContent = 'Bạn (X)';
    labelOEl.textContent = 'Máy (O)';
  }
}

function checkWinner(state) {
  for (let combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return { winner: state[a], combo };
    }
  }
  if (!state.includes('')) {
    return { winner: 'tie', combo: [] };
  }
  return null;
}

function handleCellClick(index) {
  if (!isGameActive || boardState[index] !== '' || isAiThinking) {
    return;
  }

  makeMove(index, currentPlayer);

  const result = checkWinner(boardState);
  if (result) {
    handleGameOver(result);
    return;
  }

  switchTurn();

  // If playing with AI and it's O's turn
  if (isGameActive && currentMode !== 'pvp' && currentPlayer === 'O') {
    isAiThinking = true;
    setTimeout(() => {
      const aiMove = getAiMove();
      if (aiMove !== null) {
        makeMove(aiMove, 'O');
        const aiResult = checkWinner(boardState);
        if (aiResult) {
          handleGameOver(aiResult);
        } else {
          switchTurn();
        }
      }
      isAiThinking = false;
    }, 400);
  }
}

function makeMove(index, player) {
  boardState[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  cell.disabled = true;
  playMoveSound(player);
}

function switchTurn() {
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateTurnIndicator();
}

function handleGameOver(result) {
  isGameActive = false;

  if (result.winner === 'tie') {
    scores.ties++;
    updateScoreboard();
    playDrawSound();
    showModal('⚖️', 'Hòa Nhau!', 'Trận đấu bất phân thắng bại!');
  } else {
    scores[result.winner]++;
    updateScoreboard();
    playWinSound();

    // Highlight winning combo cells
    result.combo.forEach((idx) => {
      cells[idx].classList.add('win');
    });

    const isWinnerUser = currentMode === 'pvp' || result.winner === 'X';
    if (isWinnerUser) {
      launchConfetti();
    }

    let winnerText = '';
    if (currentMode === 'pvp') {
      winnerText = `Người chơi ${result.winner} đã chiến thắng! 🎉`;
    } else {
      winnerText = result.winner === 'X' ? 'Chúc mừng! Bạn đã thắng máy! 🏆' : 'Máy đã chiến thắng! Hãy thử lại nhé! 🤖';
    }

    showModal(result.winner === 'X' ? '🏆' : '🎉', `Chiến Thắng!`, winnerText);
  }
}

function showModal(emoji, title, msg) {
  modalEmoji.textContent = emoji;
  modalTitle.textContent = title;
  modalMsg.textContent = msg;
  setTimeout(() => {
    modalOverlay.classList.add('show');
  }, 450);
}

function hideModal() {
  modalOverlay.classList.remove('show');
}

function resetBoard() {
  boardState = Array(9).fill('');
  currentPlayer = 'X';
  isGameActive = true;
  isAiThinking = false;

  cells.forEach((cell) => {
    cell.textContent = '';
    cell.className = 'cell';
    cell.disabled = false;
  });

  updateTurnIndicator();
  hideModal();
}

// ===================================================
// AI LOGIC (MINIMAX & HEURISTICS)
// ===================================================
function getEmptyIndices(state) {
  const empty = [];
  state.forEach((val, idx) => {
    if (val === '') empty.push(idx);
  });
  return empty;
}

function getAiMove() {
  const emptyIndices = getEmptyIndices(boardState);
  if (emptyIndices.length === 0) return null;

  if (currentMode === 'ai-easy') {
    // 50% random, 50% basic check for winning or blocking
    if (Math.random() > 0.5) {
      // Check can AI win
      for (let idx of emptyIndices) {
        const copy = [...boardState];
        copy[idx] = 'O';
        const res = checkWinner(copy);
        if (res && res.winner === 'O') return idx;
      }
      // Check block player X
      for (let idx of emptyIndices) {
        const copy = [...boardState];
        copy[idx] = 'X';
        const res = checkWinner(copy);
        if (res && res.winner === 'X') return idx;
      }
    }
    // Random move
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // Hard Mode: Minimax (Unbeatable)
  return getBestMinimaxMove(boardState);
}

function getBestMinimaxMove(state) {
  let bestScore = -Infinity;
  let move = null;
  const emptyIndices = getEmptyIndices(state);

  for (let idx of emptyIndices) {
    state[idx] = 'O';
    let score = minimax(state, 0, false);
    state[idx] = '';
    if (score > bestScore) {
      bestScore = score;
      move = idx;
    }
  }
  return move;
}

function minimax(state, depth, isMaximizing) {
  const result = checkWinner(state);
  if (result) {
    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    if (result.winner === 'tie') return 0;
  }

  const emptyIndices = getEmptyIndices(state);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let idx of emptyIndices) {
      state[idx] = 'O';
      let score = minimax(state, depth + 1, false);
      state[idx] = '';
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let idx of emptyIndices) {
      state[idx] = 'X';
      let score = minimax(state, depth + 1, true);
      state[idx] = '';
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
}

// ===================================================
// EVENT LISTENERS
// ===================================================
cells.forEach((cell) => {
  cell.addEventListener('click', () => {
    const idx = parseInt(cell.getAttribute('data-index'), 10);
    handleCellClick(idx);
  });
});

modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    modeButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.getAttribute('data-mode');
    updateModeLabels();
    resetBoard();
  });
});

restartBtn.addEventListener('click', resetBoard);
modalPlayAgainBtn.addEventListener('click', resetBoard);

resetScoresBtn.addEventListener('click', () => {
  scores = { X: 0, O: 0, ties: 0 };
  updateScoreboard();
  resetBoard();
});

// Sound Toggle
soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
});

// Dark / Light Theme Toggle
const initialTheme = localStorage.getItem('xo_theme') || 'dark';
document.documentElement.setAttribute('data-theme', initialTheme);
themeToggleBtn.textContent = initialTheme === 'light' ? '☀️' : '🌙';

themeToggleBtn.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const newTheme = isLight ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('xo_theme', newTheme);
  themeToggleBtn.textContent = newTheme === 'light' ? '☀️' : '🌙';
});

// Initial Setup
updateScoreboard();
updateTurnIndicator();
updateModeLabels();
