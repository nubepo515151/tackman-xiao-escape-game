let lastTime = 0;
let gameRunning = true;

function gameLoop(time) {
  if (!gameRunning) return;

  // 敵を動かす
  if (window.updateEnemy) {
    window.updateEnemy();
  }

  requestAnimationFrame(gameLoop);
}

// DOMが読み込まれてから開始
window.addEventListener("load", () => {
  requestAnimationFrame(gameLoop);
});
