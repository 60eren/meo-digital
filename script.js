const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/* ---------- Mobile Navigation ---------- */
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#main-nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("open", !open);
  });
  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("open");
    }),
  );
}

/* ---------- Header beim Scrollen + Fortschrittsbalken + Parallax ---------- */
const header = document.querySelector(".site-header");
const progress = document.querySelector(".scroll-progress");
const heroBg = document.querySelector(".hero-bg");
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (header) header.classList.toggle("scrolled", y > 10);
  if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  if (heroBg && !reduceMotion && y < window.innerHeight)
    heroBg.style.transform = `translateY(${y * 0.3}px)`;
  ticking = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  },
  { passive: true },
);
onScroll();

/* ---------- Elemente beim Scrollen einblenden ---------- */
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Bewegtes Netzwerk im Hero (Canvas) ---------- */
const canvas = document.getElementById("hero-canvas");
if (canvas && canvas.getContext) {
  const ctx = canvas.getContext("2d");
  let w = 0,
    h = 0,
    points = [],
    running = true,
    rafId = null;
  const mouse = { x: -9999, y: -9999 };
  const LINK = 140;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(80, (w * h) / 15000));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.8,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      for (let j = i + 1; j < points.length; j++) {
        const b = points[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(30, 60, 120, ${0.14 * (1 - d / LINK)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 180) {
        ctx.strokeStyle = `rgba(47, 91, 234, ${0.35 * (1 - dm / 180)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(30, 60, 120, 0.35)";
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    draw();
    rafId = running ? requestAnimationFrame(loop) : null;
  }
  function start() {
    if (!rafId && !reduceMotion) {
      running = true;
      loop();
    }
  }
  function stop() {
    running = false;
  }

  resize();
  if (reduceMotion) draw();
  else start();

  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) draw();
  });
  const hero = document.querySelector(".hero");
  hero.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener("pointerleave", () => {
    mouse.x = mouse.y = -9999;
  });

  // Animation pausieren, wenn Hero nicht sichtbar oder Tab im Hintergrund (spart Akku)
  new IntersectionObserver(([entry]) =>
    entry.isIntersecting ? start() : stop(),
  ).observe(hero);
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start(),
  );
}

/* ---------- Aktuelles Jahr im Footer ---------- */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

(function () {
  var root = document.querySelector(".meo-about");
  if (!root) return;

  var items = root.querySelectorAll(".meo-reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    items.forEach(function (el) {
      io.observe(el);
    });
  } else {
    items.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  root.querySelectorAll(".meo-card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });
})();

/* ---------- Referenzen nach Kategorie filtern ---------- */
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card[data-category]");
filterButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;
    filterButtons.forEach((b) =>
      b.setAttribute("aria-pressed", String(b === btn)),
    );
    projectCards.forEach((card) => {
      card.hidden = filter !== "alle" && card.dataset.category !== filter;
      card.classList.add("is-visible");
    });
  }),
);
