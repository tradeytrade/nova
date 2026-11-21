/* =========================================================
   Nova · Shared effects (index.html and mine.html)
   - Builds the 3D coin's edge
   - Coin you can play with: it leans towards the mouse, you can
     drag it to spin it, and click (or tap) it to flip it
   - Celebration spin when mining (called by app.js)
   - Magnetic buttons and a soft spotlight that follows the mouse on cards
   Respects "reduce motion": the coin then stays still.
   ========================================================= */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a = -1, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- Coin thickness (edge layers) ---------- */
  // The faces sit at ±--coin-depth (style.css); the edge stays just inside them
  document.querySelectorAll(".coin-edge").forEach((edge) => {
    if (edge.childElementCount) return;
    const host = edge.closest(".token, .coin3d") || edge;
    const depth = parseFloat(getComputedStyle(host).getPropertyValue("--coin-depth")) || 12;
    const THICK = depth * 2 - 2, LAYERS = Math.round(depth * 1.5);
    for (let i = 0; i < LAYERS; i++) {
      const s = document.createElement("span");
      s.style.transform = `translateZ(${-THICK / 2 + (i * THICK) / (LAYERS - 1)}px)`;
      edge.appendChild(s);
    }
  });

  /* ---------- Spotlight on cards ---------- */
  if (finePointer) {
    document.querySelectorAll(".mine-card, .stage, .panel").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  if (reduce || typeof gsap === "undefined") return;

  /* ---------- Magnetic buttons ---------- */
  if (finePointer) {
    document.querySelectorAll("[data-magnetic], .btn-mine").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        if (el.disabled) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      });
      el.addEventListener("pointerleave", () => (el.style.translate = ""));
    });
  }

  /* ---------- The coin you can play with ---------- */
  // Landing: the flying coin (only when motion.js turned animations on).
  // Miner page: the coin inside the ring.
  const host = document.querySelector(".coin3d") ||
    (root.classList.contains("motion") ? document.getElementById("token") : null);
  if (!host) return;
  const tilt = host.querySelector(".token-tilt");
  const spin = host.querySelector(".token-spin");

  // Things the coin must never steal a click from (text stays selectable)
  const BLOCK = "a, button, input, select, textarea, summary, label, p, h1, h2, h3, li, dt, dd, [data-lang-switch]";
  const snap = (deg) => Math.round(deg / 180) * 180; // rest on a face, never edge-on
  const rotY = () => gsap.getProperty(spin, "rotationY");
  const touched = () => root.classList.add("coin-touched");

  function overCoin(e) {
    const r = host.getBoundingClientRect();
    if (!r.height || r.bottom < 0 || r.top > window.innerHeight) return false;
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const rad = r.height / 2; // height is not shortened by the coin's turn
    if (dx * dx + dy * dy > rad * rad) return false;
    return !(e.target instanceof Element && e.target.closest(BLOCK));
  }

  // Lean towards the mouse
  const leanX = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3" });
  const leanY = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3" });
  const grow = gsap.quickTo(tilt, "scale", { duration: 0.5, ease: "power3" });
  let hovering = false;
  function setHover(v) {
    if (v === hovering) return;
    hovering = v;
    root.classList.toggle("coin-hover", v);
    grow(v ? 1.05 : 1);
  }

  // Flip: whole turns, with a little squash
  function flip(turns = 1) {
    touched();
    gsap.killTweensOf(spin, "rotationY,scale");
    gsap.to(spin, { rotationY: snap(rotY()) + 360 * turns, duration: 0.9 + 0.3 * turns, ease: "power3.out" });
    gsap.timeline()
      .to(spin, { scale: 0.9, duration: 0.12, ease: "power2.out" })
      .to(spin, { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.4)" });
  }

  let drag = null, tap = null;

  window.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return; // on phones a finger scrolls the page
    if (drag) {
      const t = performance.now();
      const dx = e.clientX - drag.x0;
      if (Math.abs(dx) > 3) drag.moved = true;
      gsap.set(spin, { rotationY: drag.r0 + dx * 0.9 });
      const v = (e.clientX - drag.lx) / Math.max(1, t - drag.t); // px per ms
      drag.v = drag.v * 0.6 + v * 0.4;
      drag.lx = e.clientX;
      drag.t = t;
      return;
    }
    const r = host.getBoundingClientRect();
    const nx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2));
    const ny = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2));
    leanY(nx * 26);
    leanX(-ny * 22);
    setHover(overCoin(e));
  }, { passive: true });

  root.addEventListener("mouseleave", () => {
    leanX(0);
    leanY(0);
    setHover(false);
  });

  window.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !overCoin(e)) return;
    touched();
    if (e.pointerType === "touch") {
      tap = { x: e.clientX, y: e.clientY, t: performance.now() };
      return;
    }
    e.preventDefault();
    gsap.killTweensOf(spin, "rotationY");
    drag = { x0: e.clientX, lx: e.clientX, t: performance.now(), r0: rotY(), v: 0, moved: false };
    root.classList.add("coin-dragging");
  });

  function release() {
    const d = drag;
    drag = null;
    root.classList.remove("coin-dragging");
    if (!d.moved) return flip(1);
    // Keep spinning with the speed of the throw, then settle on a face
    const speed = performance.now() - d.t > 90 ? 0 : d.v * 0.9 * 1000; // degrees per second
    const from = rotY();
    const to = snap(from + speed * 0.5);
    gsap.to(spin, { rotationY: to, duration: clamp(Math.abs(to - from) / 420, 0.5, 2.6), ease: "power3.out" });
  }

  window.addEventListener("pointerup", (e) => {
    if (drag) return release();
    if (tap && e.pointerType === "touch") {
      const t = tap;
      tap = null;
      if (Math.hypot(e.clientX - t.x, e.clientY - t.y) < 10 && performance.now() - t.t < 450) flip(1);
    }
  });
  window.addEventListener("pointercancel", () => {
    tap = null;
    if (drag) release();
  });

  /* ---------- Celebration when mining (called by app.js) ---------- */
  window.novaCelebrate = () => {
    gsap.killTweensOf(spin, "rotationY,scale");
    gsap.timeline()
      .to(spin, { rotationY: snap(rotY()) + 720, duration: 1.5, ease: "power3.out" }, 0)
      .to(spin, { scale: 1.12, duration: 0.25, ease: "power2.out" }, 0)
      .to(spin, { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.45)" }, 0.25);
  };
})();
