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
// 敵をJSで生成
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
// 敗北演出UI
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
gameOverScreen.style.flexDirection = "column";
gameOverScreen.style.justifyContent = "center";
gameOverScreen.style.alignItems = "center";
gameOverScreen.style.zIndex = "10";
gameOverScreen.style.textAlign = "center";

// GIF
const gameOverImg = document.createElement("img");
gameOverImg.src = "assets/images/defeat.gif";
gameOverImg.style.maxWidth = "80%";
gameOverImg.style.maxHeight = "80%";
gameOverImg.style.margin = "0 auto";
gameOverScreen.appendChild(gameOverImg);

// テキスト
const gameOverText = document.createElement("div");
gameOverText.textContent = "捕まってしまった・・・";
gameOverText.style.color = "white";
gameOverText.style.fontSize = "24px";
gameOverText.style.fontFamily = "monospace";
gameOverText.style.marginTop = "16px";
gameOverScreen.appendChild(gameOverText);

// 再挑戦ボタン
const retryButton = document.createElement("button");
retryButton.textContent = "再挑戦";
retryButton.classList.add("game-button");
retryButton.id = "retry-button";
retryButton.style.display = "none";
retryButton.onclick = () => location.reload();
retryButton.addEventListener("touchstart", e => e.stopPropagation(), { passive: true });
gameOverScreen.appendChild(retryButton);

gameArea.appendChild(gameOverScreen);

// ========================
// 勝利演出UI
// ========================
const winScreen = document.createElement("div");
winScreen.id = "win-screen";
winScreen.style.position = "absolute";
winScreen.style.top = "0";
winScreen.style.left = "0";
winScreen.style.width = "100%";
winScreen.style.height = "100%";
winScreen.style.background = "rgba(0,0,0,0.7)";
winScreen.style.display = "none";
winScreen.style.flexDirection = "column";
winScreen.style.justifyContent = "center";
winScreen.style.alignItems = "center";
winScreen.style.zIndex = "20";
winScreen.style.textAlign = "center";

// 動画（全画面）
const winVideo = document.createElement("video");
winVideo.src = "assets/videos/win.mp4";
winVideo.style.position = "absolute";
winVideo.style.top = "0";
winVideo.style.left = "0";
winVideo.style.width = "100%";
winVideo.style.height = "100%";
winVideo.style.objectFit = "cover";
winVideo.autoplay = false;
winVideo.controls = false;
winVideo.muted = false;
winScreen.appendChild(winVideo);

// テキスト
const winText = document.createElement("div");
winText.textContent = "おめでとう！";
winText.style.color = "white";
winText.style.fontSize = "36px";
winText.style.fontFamily = "monospace";
winText.style.position = "absolute";
winText.style.top = "40%";
winText.style.left = "50%";
winText.style.transform = "translateX(-50%)";
winText.style.display = "none"; // 初期非表示
winScreen.appendChild(winText);

// もう一度遊ぶボタン
const replayButton = document.createElement("button");
replayButton.textContent = "もう一度遊ぶ";
replayButton.classList.add("game-button");
replayButton.id = "replay-button";
replayButton.style.display = "none";
replayButton.onclick = () => window.location.href = "index.html";
replayButton.addEventListener("touchstart", e => e.stopPropagation(), { passive: true });
winScreen.appendChild(replayButton);

gameArea.appendChild(winScreen);

// ========================
// プレイヤー設定
// ========================
let px = 100;
let py = 100;
const PLAYER_SPEED = 4;
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let speedFactor = isMobile ? 1 : 1;

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
let running = false;
let gameStarted = false;

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

let touchStartX = 0, touchStartY = 0;

gameArea.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  startGame();
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

  ex = Math.max(0, Math.min(ex, gameArea.clientWidth - enemy.offsetWidth));
  ey = Math.max(0, Math.min(ey, gameArea.clientHeight - enemy.offsetHeight));

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
  gameOverScreen.style.display = "flex";
  retryButton.style.display = "block";
}

function gameClear() {
  running = false;
  gameAudio.pause();
  gameAudio.currentTime = 0;
  winScreen.style.display = "flex";
  winVideo.currentTime = 0;
  winVideo.style.display = "block";
  winVideo.play().catch(() => {});
  winVideo.onended = () => {
    winVideo.style.display = "none";
    winText.style.display = "block";
    replayButton.style.display = "block";
  };
}

// ========================
// ゲームループ
// ========================
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

// ========================
// スマホジョイスティック
// ========================
let joystick, stick, joyActive = false;
let joyCenterX = 0, joyCenterY = 0, joyDx = 0, joyDy = 0;

if (isMobile) {
  joystick = document.createElement("div");
  joystick.style.position = "absolute";
  joystick.style.bottom = "20px";
  joystick.style.left = "50%";
  joystick.style.transform = "translateX(-50%)";
  joystick.style.width = "100px";
  joystick.style.height = "100px";
  joystick.style.borderRadius = "50%";
  joystick.style.background = "rgba(255,255,255,0.2)";
  joystick.style.touchAction = "none";
  gameArea.appendChild(joystick);

  stick = document.createElement("div");
  stick.style.position = "absolute";
  stick.style.width = "50px";
  stick.style.height = "50px";
  stick.style.borderRadius = "50%";
  stick.style.background = "rgba(255,255,255,0.5)";
  stick.style.left = "25px";
  stick.style.top = "25px";
  joystick.appendChild(stick);

  joyCenterX = 50;
  joyCenterY = 50;

  joystick.addEventListener("touchstart", e => {
    joyActive = true;
    startGame();
    updateStickPosition(e.touches[0]);
  });
  joystick.addEventListener("touchmove", e => {
    if (!joyActive) return;
    e.preventDefault();
    updateStickPosition(e.touches[0]);
  }, { passive: false });
  joystick.addEventListener("touchend", e => {
    joyActive = false;
    joyDx = 0;
    joyDy = 0;
    stick.style.left = "25px";
    stick.style.top = "25px";
  });

  function updateStickPosition(touch) {
    const rect = joystick.getBoundingClientRect();
    let x = touch.clientX - rect.left;
    let y = touch.clientY - rect.top;

    joyDx = x - joyCenterX;
    joyDy = y - joyCenterY;

    const dist = Math.hypot(joyDx, joyDy);
    const maxDist = 50;
    if (dist > maxDist) {
      joyDx = (joyDx / dist) * maxDist;
      joyDy = (joyDy / dist) * maxDist;
    }

    stick.style.left = (joyCenterX + joyDx - 25) + "px";
    stick.style.top = (joyCenterY + joyDy - 25) + "px";

    keys["KeyW"] = joyDy < -5;
    keys["KeyS"] = joyDy > 5;
    keys["KeyA"] = joyDx < -5;
    keys["KeyD"] = joyDx > 5;
  }
}
