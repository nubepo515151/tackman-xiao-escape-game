// ========================
// 要素取得
// ========================
const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");
player.classList.add("debug");

// ========================
// タイマー設定
// ========================
const TIME_LIMIT = 30; // 秒数変更可能
let timeLeft = TIME_LIMIT;
let lastTimeStamp = performance.now();

// ========================
// BGM
// ========================
const gameAudio = new Audio("assets/audio/game.wav");
gameAudio.loop = true;
gameAudio.volume = 0.6;

// ========================
// 敵を生成
// ========================
const enemy = document.createElement("div");
enemy.id = "enemy";
enemy.classList.add("enemy");
enemy.classList.add("debug");
enemy.style.width = "40px";
enemy.style.height = "40px";
enemy.style.position = "absolute";
gameArea.appendChild(enemy);

// ========================
// タイマー表示
// ========================
const timer = document.createElement("div");

// ========================
// 敗北演出UI
// ========================
const gameOverScreen = document.createElement("div");
gameOverScreen.id = "game-over";
gameOverScreen.style.position = "absolute";
gameOverScreen.style.inset = "0";
gameOverScreen.style.background = "rgba(0,0,0,0.7)";
gameOverScreen.style.display = "none";
gameOverScreen.style.alignItems = "center";
gameOverScreen.style.justifyContent = "center";
gameOverScreen.style.color = "white";
gameOverScreen.style.fontSize = "48px";
gameOverScreen.style.fontFamily = "monospace";
gameOverScreen.style.zIndex = "10";
gameOverScreen.textContent = "GAME OVER";

gameArea.appendChild(gameOverScreen);

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
// プレイヤー設定
// ========================
let px = 100;
let py = 100;
const PLAYER_SPEED = 4;

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
// 入力管理（WASD）
// ========================
const keys = {};

function startAudio() {
  if (gameAudio.paused) {
    gameAudio.play().catch(() => {});
  }
}

window.addEventListener("keydown", e => {
  startAudio();
  keys[e.code] = true;
});

window.addEventListener("keyup", e => {
  keys[e.code] = false;
});

// ========================
// スマホ操作（タッチ）
// ========================
let touchStartX = 0;
let touchStartY = 0;

gameArea.addEventListener("touchstart", e => {
  startAudio();
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  e.preventDefault();
}, { passive: false });

gameArea.addEventListener("touchmove", e => {
  const touch = e.touches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  const threshold = 20; // ピクセル
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

  px += vx * PLAYER_SPEED;
  py += vy * PLAYER_SPEED;

  px = Math.max(0, Math.min(px, gameArea.clientWidth  - player.offsetWidth));
  py = Math.max(0, Math.min(py, gameArea.clientHeight - player.offsetHeight));

  player.style.left = px + "px";
  player.style.top  = py + "px";
}

// ========================
// 敵更新（追尾＋ランダム）
// ========================
function updateEnemy() {
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
function gameClear() {
  running = false;
  gameAudio.pause();
  gameAudio.currentTime = 0;
  alert("CLEAR!");
}

function gameOver() {
  running = false;
  gameAudio.pause();
  gameAudio.currentTime = 0;
  gameOverScreen.style.display = "flex";
}

// ========================
// ゲームループ
// ========================
let running = true;

function loop(now = performance.now()) {
  if (!running) return;

  const delta = (now - lastTimeStamp) / 1000;
  lastTimeStamp = now;
  timeLeft -= delta;

  if (timeLeft < 0) timeLeft = 0;
  timer.textContent = `TIME: ${Math.ceil(timeLeft)}`;

  updatePlayer();
  updateEnemy();

  if (timeLeft <= 0) {
    gameClear();
    return;
  }

  if (checkCollision()) {
    gameOver();
    return;
  }

  requestAnimationFrame(loop);
}

loop();
