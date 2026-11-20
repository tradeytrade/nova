/* =========================================================
   Nova · Animations
   - Smooth scrolling (Lenis)
   - The 3D coin travels down the page and lands in the mining panel
   - Parallax on the hero strata and on the outro
   - Manifesto text that lights up as you scroll
   If the user prefers reduced motion, or the libraries fail to load,
   the page stays static and keeps working.
   ========================================================= */
(() => {
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("motion");

  /* ---------- Smooth scrolling ---------- */
  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const token = document.getElementById("token");
  const spin = token.querySelector(".token-spin");
  const anchors = ["hero", "manifesto", "rules", "how", "mine"].map((n) =>
    document.querySelector(`[data-anchor="${n}"]`)
  );
  const mineAnchor = anchors[anchors.length - 1];

  /* ---------- In-page links with smooth scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id.length > 1 && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      // For "Mine", scroll exactly to where the coin lands in the panel
      const el = id === "#mine" ? mineAnchor : target;
      const offset = id === "#mine" ? -(window.innerHeight / 2 - mineAnchor.offsetHeight / 2) : -70;
      if (lenis) lenis.scrollTo(el, { offset, duration: 1.6 });
      else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
    });
  });

  /* ---------- Coin thickness (edge layers) ---------- */
  const edge = token.querySelector(".coin-edge");
  // The faces sit at ±--coin-depth (style.css); the edge stays just inside them
  const depth = parseFloat(getComputedStyle(token).getPropertyValue("--coin-depth")) || 16;
  const THICK = depth * 2 - 2, LAYERS = Math.round(depth * 1.5);
  for (let i = 0; i < LAYERS; i++) {
    const s = document.createElement("span");
    s.style.transform = `translateZ(${-THICK / 2 + (i * THICK) / (LAYERS - 1)}px)`;
    edge.appendChild(s);
  }

  /* ---------- Where the coin should be in each section ----------
     The coin is fixed at the centre of the screen. When a section's slot
     (anchor) reaches the centre of the screen, the coin has moved onto it,
     matched its size and made one full turn. After landing in the mining
     panel it scrolls away with it.
     The position is computed directly from the scroll position on every
     frame, so it is always correct (on load, on resize, on any device).
     The coin is drawn at its largest size and only ever scaled DOWN,
     so the browser never stretches a bitmap and it stays sharp. */
  const tilts = [16, -22, 22, -18, 0];
  const last = anchors.length - 1;
  let layout = [];

  function measure() {
    const sy = window.scrollY, iw = window.innerWidth, ih = window.innerHeight;
    const size = token.offsetWidth || 1;
    layout = anchors.map((a, i) => {
      const r = a.getBoundingClientRect();
      const cy = r.top + r.height / 2 + sy; // centre of the slot in page coordinates
      return {
        at: cy - ih / 2, // scroll position where the slot is centred on screen
        x: r.left + r.width / 2 - iw / 2,
        y: i === 0 ? cy - ih / 2 : 0,
        scale: r.width / size,
        rotationY: i * 360 + tilts[i],
        rotationZ: i === last ? 0 : tilts[i] / 3,
      };
    });
    layout[0].at = 0;
  }

  const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2); // power1.inOut
  const lerp = (a, b, p) => a + (b - a) * p;
  const KEYS = ["x", "y", "scale", "rotationY", "rotationZ"];

  function place() {
    if (!layout.length) return;
    const s = window.scrollY;
    let out;
    if (s >= layout[last].at) {
      // Landed: move up together with the mining panel
      out = { ...layout[last], y: -(s - layout[last].at) };
    } else {
      let i = 1;
      while (i < last && s >= layout[i].at) i++;
      const a = layout[i - 1], b = layout[i];
      const p = ease(Math.min(1, Math.max(0, (s - a.at) / Math.max(1, b.at - a.at))));
      out = {};
      KEYS.forEach((k) => (out[k] = lerp(a[k], b[k], p)));
    }
    gsap.set(token, out);
  }

  gsap.set(token, { transformPerspective: 1600, force3D: true });
  measure();
  place();
  window.addEventListener("scroll", place, { passive: true });
  if (lenis) lenis.on("scroll", place);
  ScrollTrigger.addEventListener("refresh", () => { measure(); place(); });

  /* ---------- Hero entrance (a single sequence) ---------- */
  gsap.timeline({ defaults: { ease: "power4.out" } })
    .from(".hero-title .line > span", { yPercent: 115, duration: 1.2, stagger: 0.09 })
    .from(".hero-net, .hero-lead, .hero-actions", { y: 24, opacity: 0, duration: 1, stagger: 0.08, clearProps: "transform" }, 0.35)
    .from(spin, { scale: 0.3, rotationY: -320, opacity: 0, duration: 1.8, ease: "expo.out" }, 0.15)
    .from(".hero-live", { opacity: 0, duration: 1 }, 0.8);

  /* ---------- Hero parallax ---------- */
  const heroST = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".hero-copy", { yPercent: -22, opacity: 0.15, ease: "none", scrollTrigger: heroST });
  gsap.to(".s1", { y: 170, ease: "none", scrollTrigger: heroST });
  gsap.to(".s2", { y: 100, ease: "none", scrollTrigger: heroST });
  gsap.to(".s3", { y: 40, ease: "none", scrollTrigger: heroST });

  /* ---------- Manifesto: words light up as you scroll ---------- */
  const fill = document.querySelector("[data-fill]");
  fill.innerHTML = fill.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
  gsap.to(fill.querySelectorAll(".w"), {
    opacity: 1,
    stagger: 0.1,
    ease: "none",
    scrollTrigger: { trigger: fill, start: "top 78%", end: "bottom 45%", scrub: true },
  });

  /* ---------- Outro: the giant word slides ---------- */
  gsap.fromTo(".outro-word", { xPercent: 4 }, {
    xPercent: -14,
    ease: "none",
    scrollTrigger: { trigger: ".outro", start: "top bottom", end: "bottom top", scrub: true },
  });

  /* ---------- Celebration spin when mining (called by app.js) ---------- */
  window.novaCelebrate = () => {
    gsap.timeline()
      .fromTo(spin, { rotationY: 0 }, { rotationY: 720, duration: 1.5, ease: "power3.out" }, 0)
      .to(spin, { scale: 1.12, duration: 0.25, ease: "power2.out" }, 0)
      .to(spin, { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.45)" }, 0.25);
  };

  // Recalculate positions when fonts load or the page height changes
  // (for example, when blockchain data arrives)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
  let lastH = 0, timer;
  new ResizeObserver(() => {
    const h = document.body.scrollHeight;
    if (Math.abs(h - lastH) < 2) return;
    lastH = h;
    clearTimeout(timer);
    timer = setTimeout(() => ScrollTrigger.refresh(), 150);
  }).observe(document.body);
})();
