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
const defeatAudio = new Audio("assets/audio/defeat.wav");
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
// 敗北UI
// ========================
const gameOverScreen = document.createElement("div");
gameOverScreen.id = "game-over";
Object.assign(gameOverScreen.style, {
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.7)",
  display: "none",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  zIndex: "10",
  textAlign: "center",
});

const gameOverImg = document.createElement("img");
gameOverImg.src = "assets/images/defeat.gif";
gameOverImg.style.maxWidth = "80%";
gameOverImg.style.maxHeight = "80%";
gameOverImg.style.margin = "0 auto";
gameOverScreen.appendChild(gameOverImg);

const gameOverText = document.createElement("div");
gameOverText.textContent = "捕まってしまった・・・";
Object.assign(gameOverText.style, {
  color: "white",
  fontSize: "24px",
  fontFamily: "monospace",
  marginTop: "16px",
});
gameOverScreen.appendChild(gameOverText);

const retryButton = document.createElement("button");
retryButton.textContent = "再挑戦";
retryButton.classList.add("game-button");
retryButton.id = "retry-button";
retryButton.style.display = "none";
retryButton.addEventListener("touchstart", () => location.reload());
retryButton.addEventListener("click", () => location.reload());
gameOverScreen.appendChild(retryButton);

gameArea.appendChild(gameOverScreen);

// ========================
// 勝利UI
// ========================
const winScreen = document.createElement("div");
winScreen.id = "win-screen";
Object.assign(winScreen.style, {
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.7)",
  display: "none",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  zIndex: "20",
  textAlign: "center",
});

const winVideo = document.createElement("video");
winVideo.src = "assets/videos/win.mp4";
Object.assign(winVideo.style, {
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  objectFit: "cover",
});
winVideo.autoplay = false;
winVideo.controls = false;
winScreen.appendChild(winVideo);

const winText = document.createElement("div");
winText.textContent = "おめでとう！";
Object.assign(winText.style, {
  color: "white",
  fontSize: "36px",
  fontFamily: "monospace",
  position: "absolute",
  top: "40%",
  left: "50%",
  transform: "translateX(-50%)",
  display: "none",
});
winScreen.appendChild(winText);

const replayButton = document.createElement("button");
replayButton.textContent = "もう一度遊ぶ";
replayButton.classList.add("game-button");
replayButton.id = "replay-button";
replayButton.style.display = "none";
replayButton.addEventListener("touchstart", () => window.location.href = "index.html");
replayButton.addEventListener("click", () => window.location.href = "index.html");
winScreen.appendChild(replayButton);

gameArea.appendChild(winScreen);

// ========================
// プレイヤー設定
// ========================
let px = 100, py = 100;
const PLAYER_SPEED = 4;
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let speedFactor = isMobile ? 1 : 1;

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
  
  defeatAudio.currentTime = 0;
  defeatAudio.play().catch(() => {});

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
  winText.style.display = "none";
  replayButton.style.display = "none";

  // スマホでも確実に再生
  const playPromise = winVideo.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // ユーザー操作後に再生
      winScreen.addEventListener("touchstart", () => winVideo.play().catch(() => {}), { once: true });
      winScreen.addEventListener("click", () => winVideo.play().catch(() => {}), { once: true });
    });
  }

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
  Object.assign(joystick.style, {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    touchAction: "none",
  });
  gameArea.appendChild(joystick);

  stick = document.createElement("div");
  Object.assign(stick.style, {
    position: "absolute",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.5)",
    left: "25px",
    top: "25px",
  });
  joystick.appendChild(stick);

  joyCenterX = 50;
  joyCenterY = 50;

  joystick.addEventListener("touchstart", e => { joyActive = true; startGame(); updateStickPosition(e.touches[0]); });
  joystick.addEventListener("touchmove", e => { if (!joyActive) return; e.preventDefault(); updateStickPosition(e.touches[0]); }, { passive: false });
  joystick.addEventListener("touchend", e => { joyActive = false; joyDx = 0; joyDy = 0; stick.style.left = "25px"; stick.style.top = "25px"; });

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


