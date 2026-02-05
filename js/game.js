// ========================
// 要素取得
// ========================
const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");
player.classList.add("debug");

// ========================
// タイマー設定（← 先に定義！！）
// ========================
const TIME_LIMIT = 30; // ここを変えれば秒数変更できる
let timeLeft = TIME_LIMIT;
let lastTimeStamp = performance.now();

// ========================
// 敵をJSで生成（HTMLは触らない）
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
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

// ========================
// プレイヤー更新
// ========================
function updatePlayer() {
  let vx = 0;
  let vy = 0;

  if (keys["w"]) vy -= 1;
  if (keys["s"]) vy += 1;
  if (keys["a"]) vx -= 1;
  if (keys["d"]) vx += 1;

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
    running = false;
    alert("CLEAR!");
    return;
  }

  if (checkCollision()) {
    running = false;
    alert("GAME OVER");
    return;
  }

  requestAnimationFrame(loop);
}

loop();
