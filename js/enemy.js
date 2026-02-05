let enemy;
let player;
let gameArea;

// 敵の座標
let enemyX = 0;
let enemyY = 0;

// 速度（プレイヤーよりやや速い）
const ENEMY_SPEED = 2.5;

// ランダム要素
let randomOffsetX = 0;
let randomOffsetY = 0;
let randomTimer = 0;

function initEnemy() {
  enemy = document.getElementById("enemy");
  player = document.getElementById("player");
  gameArea = document.getElementById("game-area");

  // 初期位置
  enemyX = Math.random() * (gameArea.clientWidth - enemy.offsetWidth);
  enemyY = Math.random() * (gameArea.clientHeight - enemy.offsetHeight);

  enemy.style.left = enemyX + "px";
  enemy.style.top  = enemyY + "px";
}

function updateEnemy() {
  if (!enemy || !player) return;

  const playerRect = player.getBoundingClientRect();
  const enemyRect  = enemy.getBoundingClientRect();

  // プレイヤー方向ベクトル
  let dx = playerRect.left - enemyRect.left;
  let dy = playerRect.top  - enemyRect.top;

  const distance = Math.hypot(dx, dy);
  if (distance !== 0) {
    dx /= distance;
    dy /= distance;
  }

  // ランダム成分（約1秒ごと）
  randomTimer++;
  if (randomTimer > 60) {
    randomOffsetX = (Math.random() - 0.5) * 0.6;
    randomOffsetY = (Math.random() - 0.5) * 0.6;
    randomTimer = 0;
  }

  enemyX += (dx + randomOffsetX) * ENEMY_SPEED;
  enemyY += (dy + randomOffsetY) * ENEMY_SPEED;

  // 画面外制御
  const maxX = gameArea.clientWidth  - enemyRect.width;
  const maxY = gameArea.clientHeight - enemyRect.height;

  enemyX = Math.max(0, Math.min(enemyX, maxX));
  enemyY = Math.max(0, Math.min(enemyY, maxY));

  enemy.style.left = enemyX + "px";
  enemy.style.top  = enemyY + "px";
}

// グローバル公開
window.updateEnemy = updateEnemy;

// DOMロード後に初期化
window.addEventListener("load", initEnemy);
