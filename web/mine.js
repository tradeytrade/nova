/* =========================================================
   Nova · Miner page animations
   - Builds the 3D coin's edge
   - Celebration spin when mining (called by app.js)
   ========================================================= */
(() => {
  const coin = document.querySelector(".coin3d");
  if (!coin) return;

  /* ---------- Coin thickness (edge layers) ---------- */
  const edge = coin.querySelector(".coin-edge");
  const depth = parseFloat(getComputedStyle(coin).getPropertyValue("--coin-depth")) || 10;
  const THICK = depth * 2 - 2, LAYERS = Math.round(depth * 1.5);
  for (let i = 0; i < LAYERS; i++) {
    const s = document.createElement("span");
    s.style.transform = `translateZ(${-THICK / 2 + (i * THICK) / (LAYERS - 1)}px)`;
    edge.appendChild(s);
  }

  /* ---------- Celebration spin ---------- */
  const spin = coin.querySelector(".token-spin");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.novaCelebrate = () => {
    if (reduce || typeof gsap === "undefined") return;
    gsap.timeline()
      .fromTo(spin, { rotationY: 0 }, { rotationY: 720, duration: 1.5, ease: "power3.out" }, 0)
      .to(spin, { scale: 1.08, duration: 0.25, ease: "power2.out" }, 0)
      .to(spin, { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.45)" }, 0.25);
  };
})();
