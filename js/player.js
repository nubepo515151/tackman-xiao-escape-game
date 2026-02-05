const player = document.getElementById("player");
const gameArea = document.getElementById("game-area");

let playerX = window.innerWidth / 2 - 32;
let playerY = window.innerHeight / 2 - 32;

player.style.left = playerX + "px";
player.style.top  = playerY + "px";

// 敵よりわずかに遅い速度
const PLAYER_SPEED = 2.0;

function updatePlayer() {
  let dx = 0;
  let dy = 0;

  if (inputState.up) dy -= 1;
  if (inputState.down) dy += 1;
  if (inputState.left) dx -= 1;
  if (inputState.right) dx += 1;

  // 斜め移動の正規化
  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
  }

  playerX += dx * PLAYER_SPEED;
  playerY += dy * PLAYER_SPEED;

  // 画面外に出ない制御
  const rect = player.getBoundingClientRect();
  const maxX = gameArea.clientWidth  - rect.width;
  const maxY = gameArea.clientHeight - rect.height;

  playerX = Math.max(0, Math.min(playerX, maxX));
  playerY = Math.max(0, Math.min(playerY, maxY));

  player.style.left = playerX + "px";
  player.style.top  = playerY + "px";
}

// game.js から呼べるように公開
window.updatePlayer = updatePlayer;
