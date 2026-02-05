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

// 速度調整用
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

window.addEventListener("keydown", e => {
  keys[e.code] = true;
});

window.addEventListener("keyup", e => {
  keys[e.code] = false;
});

// ========================
// スマホ操作（タッチ入力）
// ========================
let touchStartX = 0;
let touchStartY = 0;

gameArea.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
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
// ゲーム終了
// ========================
function gameClear() {
  running = false;
  gameAudio.pause();
  gameAudio.currentTime = 0;
  showStartButtons(); // もう一度遊ぶボタン表示
}

function gameOver() {
  running = false;
  gameAudio.pause();
  gameAudio.currentTime = 0;
  gameOverScreen.style.display = "flex";
  showStartButtons(); // 再挑戦ボタン表示
}

// ========================
// ゲームループ
// ========================
let running = false;

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
// スタートボタン作成（勝利/敗北後に再表示）
function showStartButtons() {
  const existing = document.getElementById("start-button");
  if (existing) existing.remove();

  const btn = document.createElement("button");
  btn.id = "start-button";
  btn.textContent = "ゲームスタート";
  btn.style.position = "absolute";
  btn.style.bottom = "20px";
  btn.style.left = "50%";
  btn.style.transform = "translateX(-50%)";
  btn.style.padding = "12px 24px";
  btn.style.fontSize = "18px";
  btn.style.zIndex = "30";
  gameArea.appendChild(btn);

  btn.addEventListener("click", () => {
    timeLeft = TIME_LIMIT;
    px = 100;
    py = 100;
    ex = Math.random() * (gameArea.clientWidth - 40);
    ey = Math.random() * (gameArea.clientHeight - 40);
    randX = 0;
    randY = 0;
    randTimer = 0;
    player.style.left = px + "px";
    player.style.top  = py + "px";
    enemy.style.left = ex + "px";
    enemy.style.top  = ey + "px";
    gameOverScreen.style.display = "none";
    running = true;
    lastTimeStamp = performance.now();
    loop();
  });
}

// ========================
// 初回スタートボタン表示
showStartButtons();

// ========================
// ジョイスティック常時表示（スマホ用）
let joystick, stick, joyActive = false;
let joyCenterX = 0, joyCenterY = 0, joyDx = 0, joyDy = 0;

if (isMobile) {
  joystick = document.createElement("div");
  joystick.style.position = "absolute";
  joystick.style.bottom = "100px";
  joystick.style.left = "50%";
  joystick.style.transform = "translateX(-50%)";
  joystick.style.width = "100px";
  joystick.style.height = "100px";
  joystick.style.borderRadius = "50%";
  joystick.style.background = "rgba(255,255,255,0.2)";
  joystick.style.touchAction = "none";
  joystick.style.zIndex = "25";
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
  }

  // スマホ用 updatePlayer にジョイスティック反映
  const originalUpdatePlayer = updatePlayer;
  updatePlayer = function() {
    originalUpdatePlayer();
    if (joyActive) {
      let vx = joyDx / 50;
      let vy = joyDy / 50;
      const len = Math.hypot(vx, vy);
      if (len > 1) {
        vx /= len;
        vy /= len;
      }
      px += vx * PLAYER_SPEED * speedFactor;
      py += vy * PLAYER_SPEED * speedFactor;

      px = Math.max(0, Math.min(px, gameArea.clientWidth - player.offsetWidth));
      py = Math.max(0, Math.min(py, gameArea.clientHeight - player.offsetHeight));

      player.style.left = px + "px";
      player.style.top = py + "px";
    }
  };
}
