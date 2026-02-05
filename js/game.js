// ========================
// 要素取得
// ========================
const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");
player.classList.add("debug");

// ========================
// タイマー設定
// ========================
const TIME_LIMIT = 30;
let timeLeft = TIME_LIMIT;
let lastTimeStamp = performance.now();

// BGM
const gameAudio = new Audio("assets/audio/game.wav");
gameAudio.loop = true;
gameAudio.volume = 0.6;

// ========================
// 敵生成
// ========================
const enemy = document.createElement("div");
enemy.id = "enemy";
enemy.classList.add("enemy", "debug");
enemy.style.width = "40px";
enemy.style.height = "40px";
enemy.style.position = "absolute";
gameArea.appendChild(enemy);

// ========================
// タイマー表示
// ========================
const timer = document.createElement("div");
timer.id = "timer";
timer.style.position = "absolute";
timer.style.top = "10px";
timer.style.left = "50%";
timer.style.transform = "translateX(-50%)";
timer.style.color = "white";
timer.style.fontSize = "24px";
timer.style.fontFamily = "monospace";
timer.textContent = `TIME: ${timeLeft}`;
gameArea.appendChild(timer);

// ========================
// 敗北／勝利UI
// ========================
const gameOverScreen = document.createElement("div");
gameOverScreen.id = "game-over";
gameOverScreen.style.position = "absolute";
gameOverScreen.style.top = "0";
gameOverScreen.style.left = "0";
gameOverScreen.style.width = "100%";
gameOverScreen.style.height = "100%";
gameOverScreen.style.background = "rgba(0,0,0,0.7)";
gameOverScreen.style.display = "none";
gameOverScreen.style.justifyContent = "center";
gameOverScreen.style.alignItems = "center";
gameOverScreen.style.flexDirection = "column";
gameOverScreen.style.zIndex = "10";
gameOverScreen.style.textAlign = "center";

const gameOverImg = document.createElement("img");
gameOverImg.src = "assets/images/defeat.gif";
gameOverImg.style.maxWidth = "80%";
gameOverImg.style.maxHeight = "80%";
gameOverImg.style.margin = "0 auto";
gameOverScreen.appendChild(gameOverImg);

gameArea.appendChild(gameOverScreen);

// ========================
// プレイヤー設定
// ========================
let px = 100;
let py = 100;
const PLAYER_SPEED = 4;

// 速度係数
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let speedFactor = isMobile ? 0.25 : 1;

// ========================
// 敵設定
// ========================
let ex = Math.random() * (gameArea.clientWidth - 40);
let ey = Math.random() * (gameArea.clientHeight - 40);
const ENEMY_SPEED = 3;

let randX = 0;
let randY = 0;
let randTimer = 0;

enemy.style.left = ex + "px";
enemy.style.top  = ey + "px";

// ========================
// 入力管理
// ========================
const keys = {};

// ========================
// ゲーム開始待機フラグ
// ========================
let gameStarted = false;

window.addEventListener("keydown", e => {
  if (!gameStarted) gameStarted = true;
  if (gameAudio.paused) gameAudio.play().catch(() => {});
  keys[e.code] = true;
});

window.addEventListener("keyup", e => {
  keys[e.code] = false;
});

// ========================
// スマホタッチ入力
// ========================
let touchStartX = 0;
let touchStartY = 0;

gameArea.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  if (!gameStarted) gameStarted = true;
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  if (gameAudio.paused) gameAudio.play().catch(() => {});
  e.preventDefault();
}, { passive: false });

gameArea.addEventListener("touchmove", e => {
  const touch = e.touches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  const threshold = 20;

  keys["KeyW"] = dy < -threshold;
  keys["KeyS"] = dy > threshold;
  keys["KeyA"] = dx < -threshold;
  keys["KeyD"] = dx > threshold;

  e.preventDefault();
}, { passive: false });

gameArea.addEventListener("touchend", e => {
  keys["KeyW"] = false;
  keys["KeyS"] = false;
  keys["KeyA"] = false;
  keys["KeyD"] = false;
  e.preventDefault();
}, { passive: false });

// ========================
// プレイヤー更新
// ========================
function updatePlayer() {
  if (!gameStarted) return;

  let vx = 0;
  let vy = 0;

  if (keys["KeyW"]) vy -= 1;
  if (keys["KeyS"]) vy += 1;
  if (keys["KeyA"]) vx -= 1;
  if (keys["KeyD"]) vx += 1;

  const len = Math.hypot(vx, vy);
  if (len !== 0) {
    vx /= len;
    vy /= len;
  }

  px += vx * PLAYER_SPEED * speedFactor;
  py += vy * PLAYER_SPEED * speedFactor;

  px = Math.max(0, Math.min(px, gameArea.clientWidth  - player.offsetWidth));
  py = Math.max(0, Math.min(py, gameArea.clientHeight - player.offsetHeight));

  player.style.left = px + "px";
  player.style.top  = py + "px";
}

// ========================
// 敵更新
// ========================
function updateEnemy() {
  if (!gameStarted) return;

  let dx = px - ex;
  let dy = py - ey;
  const dist = Math.hypot(dx, dy);

  if (dist !== 0) {
    dx /= dist;
    dy /= dist;
  }

  randTimer--;
  if (randTimer <= 0) {
    randX = (Math.random() - 0.5) * 0.8;
    randY = (Math.random() - 0.5) * 0.8;
    randTimer = 60;
  }

  ex += (dx + randX) * ENEMY_SPEED;
  ey += (dy + randY) * ENEMY_SPEED;

  ex = Math.max(0, Math.min(ex, gameArea.clientWidth  - enemy.offsetWidth));
  ey = Math.max(0, Math.min(ey, gameArea.clientHeight - enemy.offsetHeight));

  enemy.style.left = ex + "px";
  enemy.style.top  = ey + "px";
}

// ========================
// 当たり判定
// ========================
function checkCollision() {
  const pr = player.getBoundingClientRect();
  const er = enemy.getBoundingClientRect();

  return !(
    pr.right  < er.left ||
    pr.left   > er.right ||
    pr.bottom < er.top ||
    pr.top    > er.bottom
  );
}

// ========================
// ゲーム終了処理
// ========================
function gameOver() {
  running = false;
  gameAudio.pause();
  gameAudio.currentTime = 0;
  gameOverScreen.style.display = "flex";
  retryButton.style.display = "block";
}

function gameClear() {
  running = false;
  gameAudio.pause();
  gameAudio.currentTime = 0;
  gameOverScreen.style.display = "flex";
  replayButton.style.display = "block";
}

// ========================
// ゲームリセット
// ========================
function resetGame() {
  gameOverScreen.style.display = "none";
  retryButton.style.display = "none";
  replayButton.style.display = "none";

  px = 100;
  py = 100;
  ex = Math.random() * (gameArea.clientWidth - 40);
  ey = Math.random() * (gameArea.clientHeight - 40);
  timeLeft = TIME_LIMIT;
  lastTimeStamp = performance.now();
  gameStarted = false;
  running = true;

  player.style.left = px + "px";
  player.style.top  = py + "px";
  enemy.style.left = ex + "px";
  enemy.style.top  = ey + "px";

  loop();
}

// ========================
// ボタン作成
// ========================
const retryButton = document.createElement("button");
retryButton.textContent = "再挑戦";
retryButton.style.display = "none";
retryButton.onclick = resetGame;
gameOverScreen.appendChild(retryButton);

const replayButton = document.createElement("button");
replayButton.textContent = "もう一度遊ぶ";
replayButton.style.display = "none";
replayButton.onclick = resetGame;
gameOverScreen.appendChild(replayButton);

// ========================
// ゲームループ
// ========================
let running = true;

function loop(now = performance.now()) {
  if (!running) return;

  const delta = (now - lastTimeStamp) / 1000;
  lastTimeStamp = now;
  if (gameStarted) timeLeft -= delta;

  if (timeLeft < 0) timeLeft = 0;
  timer.textContent = `TIME: ${Math.ceil(timeLeft)}`;

  updatePlayer();
  updateEnemy();

  if (timeLeft <= 0 && gameStarted) {
    gameClear();
    return;
  }

  if (checkCollision() && gameStarted) {
    gameOver();
    return;
  }

  requestAnimationFrame(loop);
}

loop();
