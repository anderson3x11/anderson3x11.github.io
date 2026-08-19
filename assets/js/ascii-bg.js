// Animated ASCII background: a monospace character grid whose density is
// driven by a few slowly drifting blobs.
(function () {
  const canvas = document.getElementById("ascii-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  const CHARS = " .·:+×#";
  const ALPHAS = [0, 0.04, 0.055, 0.07, 0.085, 0.1, 0.12];
  const FPS = 24;
  const DITHER = 0.9; // keeps blob cores speckled instead of solid

  // Lissajous drift so blobs never wrap or pop.
  const BLOBS = [
    { ax: 0.42, ay: 0.36, sx: 0.061, sy: 0.043, px: 0.0, py: 1.7, r: 0.4 },
    { ax: 0.38, ay: 0.44, sx: 0.037, sy: 0.055, px: 2.3, py: 0.6, r: 0.34 },
    { ax: 0.46, ay: 0.3, sx: 0.049, sy: 0.031, px: 4.1, py: 3.4, r: 0.44 },
    { ax: 0.3, ay: 0.42, sx: 0.072, sy: 0.026, px: 1.2, py: 5.0, r: 0.3 },
  ];

  let cell, cols, rows, levels, w, h;

  function hash01(x, y) {
    let n = (x * 374761393 + y * 668265263) | 0;
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) >>> 0) / 4294967296;
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    cell = w < 640 ? 14 : 12;
    cols = Math.ceil(w / cell) + 1;
    rows = Math.ceil(h / cell) + 1;
    levels = new Uint8Array(cols * rows);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = cell + 'px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = "top";
  }

  function draw(t) {
    const rad = Math.min(w, h);
    const bx = [];
    const by = [];
    const br2 = [];
    for (let i = 0; i < BLOBS.length; i++) {
      const b = BLOBS[i];
      bx.push(w * (0.5 + b.ax * Math.sin(t * b.sx + b.px)));
      by.push(h * (0.5 + b.ay * Math.cos(t * b.sy + b.py)));
      const r = rad * b.r;
      br2.push(r * r);
    }

    for (let cy = 0; cy < rows; cy++) {
      const py = cy * cell;
      for (let cx = 0; cx < cols; cx++) {
        const px = cx * cell;
        let f = 0;
        for (let i = 0; i < bx.length; i++) {
          const dx = px - bx[i];
          const dy = py - by[i];
          const k = 1 - (dx * dx + dy * dy) / br2[i];
          if (k > 0) f += k * k;
        }
        f = (f / (1 + f)) * 2; // soft saturation, no flat plateau in the core
        if (f > 1) f = 1;
        const v = f - 0.1 + (hash01(cx, cy) - 0.5) * DITHER;
        let l = Math.floor(v * CHARS.length);
        if (l < 0) l = 0;
        else if (l > CHARS.length - 1) l = CHARS.length - 1;
        levels[cy * cols + cx] = l;
      }
    }

    ctx.clearRect(0, 0, w, h);
    for (let l = 1; l < CHARS.length; l++) {
      ctx.fillStyle = "rgba(242, 236, 225, " + ALPHAS[l] + ")";
      const ch = CHARS[l];
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          if (levels[cy * cols + cx] === l) ctx.fillText(ch, cx * cell, cy * cell);
        }
      }
    }
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let raf = null;
  let last = 0;

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < 1000 / FPS) return;
    last = now;
    draw(now / 1000);
  }

  function start() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    if (reduced.matches) draw(0);
    else raf = requestAnimationFrame(loop);
  }

  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      start();
    }, 150);
  });
  reduced.addEventListener("change", start);

  resize();
  start();
})();
