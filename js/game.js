// ========================
// 要素取得
// ========================
const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");
player.classList.add("debug");

// ========================
// タイマー設定（先に定義）
// ========================
const TIME_LIMIT = 30;
let timeLeft = TIME_LIMIT;
let lastTimeStamp = performance.now();

// BGM
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
// 敗北演出UI（GIF対応）
// ========================
const gameOverScreen = document.createElement("div");
gameOverScreen.id = "game-over";
gameOverScreen.style.position = "absolute";
gameOverScreen.style.top = "0";
gameOverScreen.style.left = "0";
gameOverScreen.style.width = "100%";
gameOverScreen.style.height = "100%";
gameOverScreen.style.background = "rgba(0,0,0,0.7)";
gameOverScreen.style.display = "none"; // ← 初期は非表示
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

window.addEventListener("keydown", e => {
  if (gameAudio.paused) {
    gameAudio.play().catch(() => {});
  }
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

  if (gameAudio.paused) {
    gameAudio.play().catch(() => {});
  }

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
  gameOverScreen.style.display = "flex"; // ← GIF表示
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

// ========================
// スマホ操作対応（ジョイスティック＋縦画面チェック）
// ========================

// 画面サイズ判定
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// 縦画面チェック用
let portraitRequired = true; // 縦画面じゃない場合にゲーム停止
let portraitTextTimer = 0;
let portraitTextInterval = 1; // 秒単位で点滅間隔（変更可能）

// ジョイスティック要素
let joystick, stick, joyActive = false;
let joyCenterX = 0, joyCenterY = 0, joyDx = 0, joyDy = 0;

if (isMobile) {
  // ========================
  // ジョイスティックUI作成
  // ========================
  joystick = document.createElement("div");
  joystick.style.position = "absolute";
  joystick.style.bottom = "20px";
  joystick.style.left = "50%";
  joystick.style.transform = "translateX(-50%)";
  joystick.style.width = "100px";
  joystick.style.height = "100px";
  joystick.style.borderRadius = "50%";
  joystick.style.background = "rgba(255,255,255,0.2)";
  joystick.style.touchAction = "none"; // ジェスチャー防止
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

  // タッチイベント
  joystick.addEventListener("touchstart", e => {
    joyActive = true;
    if (gameAudio.paused) gameAudio.play().catch(() => {});
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

    // 最大半径50px
    const dist = Math.hypot(joyDx, joyDy);
    const maxDist = 50;
    if (dist > maxDist) {
      joyDx = (joyDx / dist) * maxDist;
      joyDy = (joyDy / dist) * maxDist;
    }

    stick.style.left = (joyCenterX + joyDx - 25) + "px";
    stick.style.top = (joyCenterY + joyDy - 25) + "px";
  }

  // ========================
  // 縦画面強制処理
  // ========================
  const portraitNotice = document.createElement("div");
  portraitNotice.style.position = "absolute";
  portraitNotice.style.inset = "0";
  portraitNotice.style.background = "rgba(0,0,0,0.7)";
  portraitNotice.style.color = "white";
  portraitNotice.style.fontSize = "32px";
  portraitNotice.style.display = "none";
  portraitNotice.style.alignItems = "center";
  portraitNotice.style.justifyContent = "center";
  portraitNotice.style.zIndex = "20";
  portraitNotice.style.fontFamily = "monospace";
  portraitNotice.textContent = "縦画面にしてください";
  gameArea.appendChild(portraitNotice);

  function checkOrientation() {
    if (window.innerHeight < window.innerWidth) {
      // 横画面
      portraitRequired = true;
      running = false;
      portraitNotice.style.display = "flex";
    } else {
      // 縦画面
      if (portraitRequired) {
        portraitRequired = false;
        running = true;
        portraitNotice.style.display = "none";
        lastTimeStamp = performance.now();
        loop();
      }
    }
  }
  window.addEventListener("resize", checkOrientation);
  checkOrientation(); // 初回チェック
}

// ========================
// updatePlayerに追加：スマホジョイスティック対応
// ========================
const originalUpdatePlayer = updatePlayer;
updatePlayer = function() {
  originalUpdatePlayer();

  if (isMobile && joyActive) {
    let vx = joyDx / 50; // 正規化
    let vy = joyDy / 50;

    const len = Math.hypot(vx, vy);
    if (len > 1) {
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
};
