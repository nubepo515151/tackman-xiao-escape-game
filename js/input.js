const inputState = {
  up: false,
  down: false,
  left: false,
  right: false
};

// ===== PC（WASD）=====
window.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "w": inputState.up = true; break;
    case "a": inputState.left = true; break;
    case "s": inputState.down = true; break;
    case "d": inputState.right = true; break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key.toLowerCase()) {
    case "w": inputState.up = false; break;
    case "a": inputState.left = false; break;
    case "s": inputState.down = false; break;
    case "d": inputState.right = false; break;
  }
});

// ===== スマホ（スワイプ）=====
let startX = 0;
let startY = 0;

window.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
});

window.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  const dx = t.clientX - startX;
  const dy = t.clientY - startY;

  // 一旦リセット
  inputState.up = inputState.down = inputState.left = inputState.right = false;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 10) inputState.right = true;
    if (dx < -10) inputState.left = true;
  } else {
    if (dy > 10) inputState.down = true;
    if (dy < -10) inputState.up = true;
  }
});
