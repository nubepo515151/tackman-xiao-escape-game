// ========================
// 要素取得
// ========================
const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");
player.classList.add("debug");

// ========================
// タイマー設定
// ========================
const TIME_LIMIT = 3;
let timeLeft = TIME_LIMIT;
let lastTimeStamp = performance.now();

// ========================
// BGM
// ========================
const gameAudio = new Audio("assets/audio/game.wav");
gameAudio.loop = true;
gameAudio.volume = 0.6;

// ========================
// 敗北SE
// ========================
const defeatAudio = new Audio("assets/audio/gameover.wav");
defeatAudio.volume = 0.8;

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
Object.assign(timer.style, {
  position: "absolute",
  top: "10px",
  left: "50%",
  transform: "translateX(-50%)",
  color: "white",
  fontSize: "24px",
  fontFamily: "monospace"
});
timer.textContent = `TIME: ${timeLeft}`;
gameArea.appendChild(timer);

// ========================
// 敗北UI
// ========================
const gameOverScreen = document.createElement("div");
Object.assign(gameOverScreen.style, {
  position: "absolute",
  inset: "0",
  background: "rgba(0,0,0,0.7)",
  display: "none",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  zIndex: "9999",
  textAlign: "center",
  pointerEvents: "auto"
});

const gameOverImg = document.createElement("img");
gameOverImg.src = "assets/images/defeat.gif";
gameOverImg.style.maxWidth = "80%";
gameOverScreen.appendChild(gameOverImg);

const gameOverText = document.createElement("div");
gameOverText.textContent = "捕まってしまった・・・";
Object.assign(gameOverText.style, {
  color: "white",
  fontSize: "24px",
  marginTop: "16px"
});
gameOverScreen.appendChild(gameOverText);

const retryButton = document.createElement("button");
retryButton.textContent = "再挑戦";
Object.assign(retryButton.style, {
  marginTop: "20px",
  padding: "14px 28px",
  fontSize: "20px",
  zIndex: "10000",
  position: "relative",
  pointerEvents: "auto"
});
retryButton.addEventListener("touchstart", e => {
  e.stopPropagation();
  location.reload();
});
retryButton.addEventListener("click", e => {
  e.stopPropagation();
  location.reload();
});
gameOverScreen.appendChild(retryButton);
gameArea.appendChild(gameOverScreen);

// ========================
// 勝利UI
// ========================
const winScreen = document.createElement("div");
Object.assign(winScreen.style, {
  position: "absolute",
  inset: "0",
  background: "black",
  display: "none",
  zIndex: "10000",
  pointerEvents: "auto"
});

const winVideo = document.createElement("video");
winVideo.src = "assets/videos/win.mp4";
Object.assign(winVideo.style, {
  position: "absolute",
  inset: "0",
  width: "100%",
  height: "100%",
  objectFit: "cover"
});
winVideo.playsInline = true;
winVideo.controls = false;
winScreen.appendChild(winVideo);

const winText = document.createElement("div");
winText.textContent = "おめでとう！";
Object.assign(winText.style, {
  position: "absolute",
  top: "40%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  color: "white",
  fontSize: "36px",
  display: "none"
});
winScreen.appendChild(winText);

const replayButton = document.createElement("button");
replayButton.textContent = "もう一度遊ぶ";
Object.assign(replayButton.style, {
  position: "absolute",
  top: "55%",
  left: "50%",
  transform: "translateX(-50%)",
  padding: "14px 28px",
  fontSize: "20px",
  display: "none"
});
replayButton.addEventListener("touchstart", e => {
  e.stopPropagation();
  window.location.href = "index.html";
});
replayButton.addEventListener("click", e => {
  e.stopPropagation();
  window.location.href = "index.html";
});
winScreen.appendChild(replayButton);
gameArea.appendChild(winScreen);

// ========================
// プレイヤー設定
// ========================
let px = 100, py = 100;
const PLAYER_SPEED = 4;
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let speedFactor = 1;

// ========================
// 敵設定
// ========================
let ex = Math.random() * (gameArea.clientWidth - 40);
let ey = Math.random() * (gameArea.clientHeight - 40);
const ENEMY_SPEED = 3;
let randX = 0, randY = 0, randTimer = 0;

enemy.style.left = ex + "px";
enemy.style.top = ey + "px";

// ========================
// 入力管理
// ========================
const keys = {};
let running = false, gameStarted = false;

function startGame() {
  if (!gameStarted) {
    running = true;
    gameStarted = true;
    lastTimeStamp = performance.now();
    gameAudio.play().catch(() => {});
    loop();
  }
}

window.addEventListener("keydown", e => { keys[e.code] = true; startGame(); });
window.addEventListener("keyup", e => keys[e.code] = false);

// ========================
// プレイヤー更新
// ========================
function updatePlayer() {
  let vx = 0, vy = 0;
  if (keys["KeyW"]) vy -= 1;
  if (keys["KeyS"]) vy += 1;
  if (keys["KeyA"]) vx -= 1;
  if (keys["KeyD"]) vx += 1;

  const len = Math.hypot(vx, vy);
  if (len !== 0) { vx /= len; vy /= len; }

  px += vx * PLAYER_SPEED * speedFactor;
  py += vy * PLAYER_SPEED * speedFactor;

  px = Math.max(0, Math.min(px, gameArea.clientWidth - player.offsetWidth));
  py = Math.max(0, Math.min(py, gameArea.clientHeight - player.offsetHeight));

  player.style.left = px + "px";
  player.style.top = py + "px";
}

// ========================
// 敵更新
// ========================
function updateEnemy() {
  let dx = px - ex;
  let dy = py - ey;
  const dist = Math.hypot(dx, dy);
  if (dist !== 0) { dx /= dist; dy /= dist; }

  randTimer--;
  if (randTimer <= 0) {
    randX = (Math.random() - 0.5) * 0.8;
    randY = (Math.random() - 0.5) * 0.8;
    randTimer = 60;
  }

  ex += (dx + randX) * ENEMY_SPEED;
  ey += (dy + randY) * ENEMY_SPEED;

  enemy.style.left = ex + "px";
  enemy.style.top = ey + "px";
}

// ========================
// 当たり判定
// ========================
function checkCollision() {
  const pr = player.getBoundingClientRect();
  const er = enemy.getBoundingClientRect();
  return !(pr.right < er.left || pr.left > er.right || pr.bottom < er.top || pr.top > er.bottom);
}

// ========================
// ゲーム終了処理
// ========================
function gameOver() {
  running = false;

  gameAudio.pause();
  gameAudio.currentTime = 0;

  defeatAudio.currentTime = 0;
  defeatAudio.play().catch(() => {});

  gameOverScreen.style.display = "flex";
}

function gameClear() {
  running = false;

  gameAudio.pause();
  gameAudio.currentTime = 0;

  winScreen.style.display = "block";
  winVideo.currentTime = 0;

  winVideo.play().catch(() => {});

  winVideo.onended = () => {
    winVideo.style.display = "none";
    winText.style.display = "block";
    replayButton.style.display = "block";
  };
}

// ========================
// ループ
// ========================
function loop(now = performance.now()) {
  if (!running) return;

  const delta = (now - lastTimeStamp) / 1000;
  lastTimeStamp = now;
  timeLeft -= delta;

  timer.textContent = `TIME: ${Math.ceil(timeLeft)}`;

  updatePlayer();
  updateEnemy();

  if (timeLeft <= 0) return gameClear();
  if (checkCollision()) return gameOver();

  requestAnimationFrame(loop);
}
