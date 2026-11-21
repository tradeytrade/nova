/* =========================================================
   Nova · Landing page animations
   - Smooth scrolling (Lenis)
   - The 3D coin travels down the page and lands in the mining panel
   - Parallax on the hero strata and on the outro
   - Manifesto text that lights up as you scroll
   - Sections that rise in, lines that draw themselves, scroll progress
   (The coin's edge, mouse interaction and celebration live in fx.js.)
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

  /* ---------- Where the coin should be in each section ----------
     The coin is fixed at the centre of the screen. When a section's slot
     (anchor) reaches the centre of the screen, the coin has moved onto it,
     matched its size and made one full turn. After landing in the mining
     panel it scrolls away with it.
     The position is computed directly from the scroll position on every
     frame, so it is always correct (on load, on resize, on any device).
     The coin is drawn at its largest size and only ever scaled DOWN,
     so the browser never stretches a bitmap and it stays sharp.
     Never animate a transform on an ELEMENT THAT CONTAINS an anchor:
     the coin would land in the wrong place. */
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
    .from(".hero-live", { opacity: 0, duration: 0.6 }, 0.8)
    .from(".hero-live p", { y: 18, opacity: 0, duration: 0.9, stagger: 0.08, clearProps: "transform" }, 0.85);

  /* ---------- Hero parallax ---------- */
  const heroST = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".hero-copy", { yPercent: -22, opacity: 0.15, ease: "none", scrollTrigger: heroST });
  gsap.to(".s1", { y: 170, ease: "none", scrollTrigger: heroST });
  gsap.to(".s2", { y: 100, ease: "none", scrollTrigger: heroST });
  gsap.to(".s3", { y: 40, ease: "none", scrollTrigger: heroST });

  /* ---------- Scroll progress bar ---------- */
  gsap.to(".scroll-progress", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });

  /* ---------- Manifesto: words light up as you scroll ----------
     Rebuilt when the language changes (i18n.js replaces the text). */
  const fill = document.querySelector("[data-fill]");
  const escapeHtml = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  let fillTween = null;
  function buildFill() {
    fillTween?.scrollTrigger?.kill();
    fillTween?.kill();
    fill.innerHTML = fill.textContent.trim().split(/\s+/).map((w) => `<span class="w">${escapeHtml(w)}</span>`).join(" ");
    fillTween = gsap.to(fill.querySelectorAll(".w"), {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
      scrollTrigger: { trigger: fill, start: "top 78%", end: "bottom 45%", scrub: true },
    });
  }
  buildFill();
  document.addEventListener("nova:lang", () => {
    buildFill();
    ScrollTrigger.refresh();
  });

  /* ---------- Sections rise in as they enter the screen ---------- */
  function rise(targets, { y = 44, stagger = 0.08, start = "top 88%", lines = false } = {}) {
    const els = gsap.utils.toArray(targets);
    if (!els.length) return;
    gsap.set(els, { y, opacity: 0 });
    ScrollTrigger.batch(els, {
      start,
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, ease: "power3.out", stagger, overwrite: true, clearProps: "transform" });
        if (lines) batch.forEach((el, i) => setTimeout(() => el.classList.add("in"), i * stagger * 1000));
      },
    });
  }
  rise("[data-reveal]", { stagger: 0.1 });
  rise(".rules-list li", { lines: true, stagger: 0.12 });
  rise(".steps li", { lines: true, stagger: 0.12 });
  rise(".faq-list details", { y: 28, stagger: 0.07 });
  rise(".mine-card > :not(.token-anchor)", { y: 24, stagger: 0.06, start: "top 92%" });

  // Step numbers pop in after their row
  ScrollTrigger.batch(".step-n", {
    start: "top 85%",
    once: true,
    onEnter: (batch) => gsap.from(batch, { scale: 0.3, rotation: -25, opacity: 0, duration: 0.9, ease: "back.out(2.2)", stagger: 0.12, delay: 0.15 }),
  });

  /* ---------- Outro: the giant word slides ---------- */
  gsap.fromTo(".outro-word", { xPercent: 4 }, {
    xPercent: -14,
    ease: "none",
    scrollTrigger: { trigger: ".outro", start: "top bottom", end: "bottom top", scrub: true },
  });

  // Recalculate positions when fonts load or the page height changes
  // (for example, when blockchain data arrives or the language changes)
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
