const enemy = document.getElementById("enemy");
const player = document.getElementById("player");
const gameArea = document.getElementById("game-area");

// 敵の初期設定
let enemyX = Math.random() * (window.innerWidth - 64);
let enemyY = Math.random() * (window.innerHeight - 64);

enemy.style.left = enemyX + "px";
enemy.style.top  = enemyY + "px";

// 速度設定（プレイヤーよりやや速い想定）
const ENEMY_SPEED = 2.5;

// ランダム要素用
let randomOffsetX = 0;
let randomOffsetY = 0;
let randomTimer = 0;

function updateEnemy() {
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

  // 一定時間ごとにランダム成分を変更
  randomTimer++;
  if (randomTimer > 60) { // 約1秒ごと（60fps想定）
    randomOffsetX = (Math.random() - 0.5) * 0.6;
    randomOffsetY = (Math.random() - 0.5) * 0.6;
    randomTimer = 0;
  }

  // 追尾 + ランダム
  enemyX += (dx + randomOffsetX) * ENEMY_SPEED;
  enemyY += (dy + randomOffsetY) * ENEMY_SPEED;

  // 画面外に出ない制御
  const maxX = gameArea.clientWidth  - enemyRect.width;
  const maxY = gameArea.clientHeight - enemyRect.height;

  enemyX = Math.max(0, Math.min(enemyX, maxX));
  enemyY = Math.max(0, Math.min(enemyY, maxY));

  enemy.style.left = enemyX + "px";
  enemy.style.top  = enemyY + "px";
}

// game.js から呼ばれる想定
// enemy.js の末尾に追加
window.updateEnemy = updateEnemy;
