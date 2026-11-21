/* =========================================================
   Nova · Miner page entrance
   (The coin's edge, mouse interaction and celebration live in fx.js.)
   ========================================================= */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof gsap === "undefined" || !document.querySelector(".coin3d")) return;

  gsap.timeline({ defaults: { ease: "power4.out" } })
    .from(".stage", { y: 36, opacity: 0, duration: 1.1, clearProps: "transform,opacity" })
    .from(".miner-side .panel", { y: 36, opacity: 0, duration: 1.1, stagger: 0.1, clearProps: "transform,opacity" }, 0.1)
    .from(".coin3d .token-spin", { scale: 0.35, rotationY: -400, opacity: 0, duration: 1.8, ease: "expo.out" }, 0.15)
    .from(".ring", { scale: 0.8, opacity: 0, duration: 1.3 }, 0.25)
    .from(".stage > :not(.stage-coin)", { y: 16, opacity: 0, duration: 0.9, stagger: 0.06, clearProps: "transform,opacity" }, 0.45);
})();
