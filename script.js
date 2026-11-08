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

/* ---------- Live-Demo: KI-Posteingang, läuft beim Scrollen ab (Beispieldaten, ohne innerHTML) ---------- */
const demoRoot = document.getElementById("demo");
if (demoRoot && document.getElementById("demo-list")) {
  const demoMails = [
    {
      from: "Familie Becker",
      email: "s.becker@beispiel.de",
      time: "08:12",
      subject: "Angebot für Wohnzimmer und Flur",
      text: "Guten Tag,\nwir möchten unser Wohnzimmer (ca. 35 m²) und den Flur neu streichen lassen, die Decke im Wohnzimmer auch. Wäre das noch vor dem 20. Dezember möglich? Wir wohnen in der Lindenstraße 12 in Hamm.\nSie erreichen mich unter 0151 2345678.\nViele Grüße\nSabine Becker",
      highlights: [
        "Wohnzimmer (ca. 35 m²)",
        "Flur",
        "Decke",
        "vor dem 20. Dezember",
        "Lindenstraße 12 in Hamm",
        "0151 2345678",
        "Sabine Becker",
      ],
      category: "Angebotsanfrage",
      priority: "mittel",
      summary:
        "Neue Kundin möchte Wohnzimmer inkl. Decke und Flur streichen lassen, Wunschtermin vor dem 20. Dezember.",
      data: [
        ["Kunde", "Sabine Becker"],
        ["Telefon", "0151 2345678"],
        ["Ort", "Lindenstraße 12, Hamm"],
        ["Fläche", "ca. 35 m² + Flur"],
        ["Wunschtermin", "vor dem 20.12."],
      ],
      draft:
        "Guten Tag Frau Becker,\nvielen Dank für Ihre Anfrage. Gern streichen wir Ihr Wohnzimmer samt Decke und den Flur. Für ein genaues Angebot würden wir uns die Räume kurz ansehen. Passt Ihnen Donnerstag um 16 Uhr?\nViele Grüße\nMalerbetrieb Schneider",
      done: [
        "Neue Kundin im Kundenverzeichnis angelegt",
        "Besichtigungstermin vorgeschlagen: Do., 16:00 Uhr",
        "Angebotsvorlage „Innenanstrich“ vorbereitet (Modul 06)",
      ],
    },
    {
      from: "Farbenhandel Krüger",
      email: "rechnung@farben-krueger.de",
      time: "09:47",
      subject: "Rechnung Nr. 2026-4471",
      text: "Sehr geehrte Damen und Herren,\nanbei erhalten Sie unsere Rechnung Nr. 2026-4471 über 1.284,60 € für Wandfarbe und Abdeckmaterial. Zahlbar bis zum 28.11. ohne Abzug.\nMit freundlichen Grüßen\nFarbenhandel Krüger",
      highlights: ["2026-4471", "1.284,60 €", "28.11."],
      category: "Rechnung",
      priority: "niedrig",
      summary:
        "Lieferantenrechnung über 1.284,60 € für Material, fällig am 28.11.",
      data: [
        ["Lieferant", "Farbenhandel Krüger"],
        ["Rechnungsnr.", "2026-4471"],
        ["Betrag", "1.284,60 €"],
        ["Fällig am", "28.11."],
      ],
      draft: "",
      done: [
        "Beleg ausgelesen und in der Buchhaltung erfasst (Modul 03)",
        "Fälligkeit 28.11. als offener Posten eingetragen",
        "Erinnerung 3 Tage vor Fälligkeit angelegt",
      ],
    },
    {
      from: "Thomas Wagner",
      email: "t.wagner@beispiel.de",
      time: "10:31",
      subject: "Farbe blättert ab – bitte dringend melden",
      text: "Hallo,\nim Treppenhaus, das Sie vor drei Wochen gestrichen haben, blättert an zwei Stellen die Farbe ab. Ich bin ehrlich gesagt enttäuscht. Bitte melden Sie sich zeitnah, ich bin heute ab 14 Uhr erreichbar: 0176 9876543.\nThomas Wagner",
      highlights: [
        "Treppenhaus",
        "blättert an zwei Stellen die Farbe ab",
        "heute ab 14 Uhr",
        "0176 9876543",
      ],
      category: "Beschwerde",
      priority: "hoch",
      summary:
        "Bestandskunde meldet abblätternde Farbe im Treppenhaus (Auftrag vor 3 Wochen), wünscht schnellen Rückruf ab 14 Uhr.",
      data: [
        ["Kunde", "Thomas Wagner"],
        ["Telefon", "0176 9876543"],
        ["Anliegen", "Nachbesserung Treppenhaus"],
        ["Rückruf", "heute ab 14 Uhr"],
      ],
      draft:
        "Hallo Herr Wagner,\ndas tut uns leid, danke für Ihre schnelle Rückmeldung. Selbstverständlich bessern wir das kostenlos nach. Ich rufe Sie heute ab 14 Uhr an, damit wir einen Termin finden.\nViele Grüße\nMalerbetrieb Schneider",
      done: [
        "Als dringend markiert und oben angeheftet",
        "Rückruf-Aufgabe für heute 14:00 Uhr erstellt",
        "Mit dem ursprünglichen Auftrag in der Kundenakte verknüpft",
      ],
    },
    {
      from: "Super-Leads GmbH",
      email: "news@super-leads.example",
      time: "11:05",
      subject: "🔥 1000 neue Kunden in 30 Tagen – garantiert!",
      text: "Hallo Unternehmer,\nmit unserem exklusiven Paket bekommen Sie garantiert 1000 neue Kunden. Nur heute 70 % Rabatt! Jetzt klicken und durchstarten.",
      highlights: ["garantiert 1000 neue Kunden", "70 % Rabatt"],
      category: "Werbung",
      priority: "niedrig",
      summary:
        "Werbe-Newsletter ohne Bezug zu einem Auftrag. Keine Aktion nötig.",
      data: [
        ["Absender", "Super-Leads GmbH"],
        ["Typ", "Newsletter / Werbung"],
      ],
      draft: "",
      done: [
        "In den Ordner „Werbung“ verschoben",
        "Keine Benachrichtigung ausgelöst",
      ],
    },
  ];

  const $id = (id) => document.getElementById(id);
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lin = (p, a, b) => clamp((p - a) / (b - a));

  const list = $id("demo-list");
  const panel = $id("demo-panel");
  const content = $id("demo-content");
  const blocks = {
    orig: $id("demo-b-orig"),
    ai: $id("demo-b-ai"),
    draft: $id("demo-b-draft"),
    done: $id("demo-b-done"),
  };
  const sendBtn = $id("demo-send");
  const status = $id("demo-status");
  const draftEl = $id("demo-draft");
  const scan = $id("demo-scan");
  const steps = [...$id("demo-steps").children];
  const nowEl = $id("demo-now");
  const bar = $id("demo-bar");

  // Posteingang aufbauen
  const items = demoMails.map((mail, index) => {
    const li = make("li");
    const btn = make("button", "demo-mail");
    btn.type = "button";
    btn.setAttribute("aria-pressed", "false");
    const tag = make(
      "span",
      `demo-mail-tag prio-${mail.priority}`,
      mail.category,
    );
    btn.append(
      make("span", "demo-from", mail.from),
      make("span", "demo-time", mail.time),
      make("span", "demo-preview", mail.subject),
      tag,
    );
    btn.addEventListener("click", () => pick(index));
    li.append(btn);
    list.append(li);
    return { li, btn, tag };
  });

  // Inhalt einer Nachricht vorbereiten
  let cur = null;
  function setMail(index) {
    const mail = demoMails[index];
    items.forEach((it, i) =>
      it.btn.setAttribute("aria-pressed", String(i === index)),
    );
    $id("demo-meta").textContent =
      `Von: ${mail.from} <${mail.email}> · heute, ${mail.time} Uhr`;
    $id("demo-subject").textContent = mail.subject;

    // Text mit markierbaren Stellen (ohne innerHTML)
    const ranges = [];
    mail.highlights.forEach((h) => {
      const at = mail.text.indexOf(h);
      if (at > -1) ranges.push([at, at + h.length]);
    });
    ranges.sort((a, b) => a[0] - b[0]);
    const textEl = $id("demo-text");
    const parts = [];
    const hls = [];
    let pos = 0;
    ranges.forEach(([a, b]) => {
      if (a < pos) return;
      if (a > pos) parts.push(document.createTextNode(mail.text.slice(pos, a)));
      const mark = make("span", "demo-hl", mail.text.slice(a, b));
      hls.push(mark);
      parts.push(mark);
      pos = b;
    });
    parts.push(document.createTextNode(mail.text.slice(pos)));
    textEl.replaceChildren(...parts);

    const rows = mail.data.map(([label, value]) => {
      const row = make("div");
      row.append(make("dt", "", label), make("dd", "", value));
      return row;
    });
    $id("demo-data").replaceChildren(...rows);
    const done = mail.done.map((t) => make("li", "", t));
    $id("demo-done").replaceChildren(...done);
    $id("demo-chips").replaceChildren();
    $id("demo-summary").textContent = "";
    draftEl.textContent = "";
    status.textContent = "";
    sendBtn.hidden = !mail.draft;
    sendBtn.disabled = false;
    sendBtn.classList.remove("is-pressed");

    cur = { index, mail, hls, rows, done, last: {} };
  }

  // Zustand anzeigen (wird nur bei Änderungen neu gesetzt)
  function show(st) {
    const { mail, hls, rows, done, last } = cur;
    const changed = (k, v) => {
      if (last[k] === v) return false;
      last[k] = v;
      return true;
    };
    if (changed("arrived", st.arrived))
      items.forEach((it, i) => it.li.classList.toggle("is-in", i < st.arrived));
    if (changed("open", st.open))
      blocks.orig.classList.toggle("is-on", st.open);
    if (changed("scan", st.scan)) {
      scan.classList.toggle("is-on", st.scan > 0 && st.scan < 1);
      const h = scan.parentElement.offsetHeight;
      scan.style.transform = `translateY(${st.scan * h}px)`;
    }
    if (changed("hl", st.hl))
      hls.forEach((m, i) => m.classList.toggle("is-on", i < st.hl));
    if (changed("ai", st.ai)) blocks.ai.classList.toggle("is-on", st.ai);
    if (changed("chips", st.chips)) {
      $id("demo-chips").replaceChildren(
        ...(st.chips
          ? [
              make("span", "demo-chip", `Kategorie: ${mail.category}`),
              make(
                "span",
                `demo-chip prio-${mail.priority}`,
                `Priorität: ${mail.priority}`,
              ),
            ]
          : []),
      );
    }
    if (changed("summary", st.summary))
      $id("demo-summary").textContent = st.summary ? mail.summary : "";
    if (changed("data", st.data))
      rows.forEach((r, i) => r.classList.toggle("is-on", i < st.data));
    if (changed("draftOn", st.draftOn))
      blocks.draft.classList.toggle("is-on", st.draftOn);
    if (changed("chars", st.chars)) {
      if (mail.draft) {
        draftEl.textContent = mail.draft.slice(0, st.chars);
        draftEl.classList.toggle(
          "is-typing",
          st.chars > 0 && st.chars < mail.draft.length,
        );
      } else {
        draftEl.textContent =
          "Keine Antwort nötig – die KI hat die Nachricht direkt verarbeitet.";
      }
    }
    if (changed("approved", st.approved) && mail.draft) {
      sendBtn.classList.toggle("is-pressed", st.approved);
      sendBtn.disabled = st.approved;
      status.textContent = st.approved
        ? "✓ Freigegeben – in der Demo wird nichts versendet."
        : "";
    }
    if (changed("doneOn", st.doneOn))
      blocks.done.classList.toggle("is-on", st.doneOn);
    if (changed("doneN", st.doneN))
      done.forEach((li, i) => li.classList.toggle("is-on", i < st.doneN));
    if (changed("sorted", st.sorted))
      items.forEach((it, i) => {
        it.tag.classList.toggle("is-on", st.sorted || i === cur.index);
        it.btn.classList.toggle(
          "is-spam",
          st.sorted && demoMails[i].category === "Werbung",
        );
      });
    if (changed("step", st.step)) {
      steps.forEach((li, i) => {
        li.classList.toggle("is-active", i === st.step);
        li.classList.toggle("is-done", i < st.step);
      });
      nowEl.textContent = steps[st.step].querySelector("strong").textContent;
    }
    bar.style.width = `${Math.round(st.progress * 100)}%`;

    // Detailbereich zum aktuellen Abschnitt mitführen
    if (changed("focus", st.focus)) {
      const block = blocks[st.focus];
      const max = Math.max(0, content.scrollHeight - panel.clientHeight);
      const y = st.focus === "orig" ? 0 : Math.min(max, block.offsetTop - 12);
      content.style.transform = `translateY(${-y}px)`;
    }
  }

  const full = (mail) => ({
    arrived: 4,
    open: true,
    scan: 1,
    hl: 99,
    ai: true,
    chips: true,
    summary: true,
    data: 99,
    draftOn: true,
    chars: mail.draft.length,
    approved: false,
    doneOn: true,
    doneN: 99,
    sorted: true,
    step: 4,
    progress: 1,
    focus: "orig",
  });

  function stateAt(p) {
    const mail = demoMails[0];
    return {
      arrived: Math.ceil(lin(p, 0.01, 0.11) * 4),
      open: p >= 0.12,
      scan: p < 0.14 ? 0 : lin(p, 0.14, 0.32),
      hl: Math.round(lin(p, 0.15, 0.32) * cur.hls.length),
      ai: p >= 0.34,
      chips: p >= 0.36,
      summary: p >= 0.39,
      data: Math.round(lin(p, 0.4, 0.48) * mail.data.length),
      draftOn: p >= 0.5,
      chars: Math.round(lin(p, 0.53, 0.72) * mail.draft.length),
      approved: p >= 0.76,
      doneOn: p >= 0.78,
      doneN: Math.round(lin(p, 0.79, 0.87) * mail.done.length),
      sorted: p >= 0.89,
      step: p < 0.12 ? 0 : p < 0.34 ? 1 : p < 0.5 ? 2 : p < 0.75 ? 3 : 4,
      progress: lin(p, 0, 0.92),
      focus: p < 0.34 ? "orig" : p < 0.5 ? "ai" : p < 0.77 ? "draft" : "done",
    };
  }

  // Selbst ausprobieren
  let manual = null;
  let pending = null;
  const finishAt = 0.92;
  function progressNow() {
    const total = demoRoot.offsetHeight - window.innerHeight;
    return total > 0 ? clamp(-demoRoot.getBoundingClientRect().top / total) : 1;
  }
  function openManual(index) {
    manual = index;
    setMail(index);
    show(full(demoMails[index]));
    content.style.transform = "";
    panel.scrollTop = 0;
  }
  function pick(index) {
    if (isStatic || progressNow() >= finishAt - 0.02) return openManual(index);
    pending = index;
    const total = demoRoot.offsetHeight - window.innerHeight;
    const top = demoRoot.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + total * (finishAt + 0.03),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }
  sendBtn.addEventListener("click", () => {
    if (manual === null && !isStatic) return;
    sendBtn.disabled = true;
    sendBtn.classList.add("is-pressed");
    status.textContent = "✓ Freigegeben – in der Demo wird nichts versendet.";
  });

  // Ohne Bewegung: alles direkt zeigen und frei bedienbar machen
  const isStatic = reduceMotion || !("IntersectionObserver" in window);
  setMail(0);
  if (isStatic) {
    demoRoot.classList.add("is-static", "is-finished");
    openManual(0);
  } else {
    let queued = false;
    let wasFinished = false;
    const update = () => {
      queued = false;
      const p = progressNow();
      const finished = p >= finishAt;
      if (finished !== wasFinished) {
        wasFinished = finished;
        demoRoot.classList.toggle("is-finished", finished);
        if (manual === null) {
          if (finished) {
            panel.scrollTop = Math.max(0, blocks.done.offsetTop - 12);
          } else {
            panel.scrollTop = 0;
            cur.last.focus = null;
          }
        }
      }
      if (finished && pending !== null) {
        openManual(pending);
        pending = null;
        return;
      }
      if (manual !== null) {
        if (p >= finishAt - 0.06) return;
        manual = null;
        setMail(0);
      }
      show(stateAt(p));
    };
    const onScrollDemo = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScrollDemo, { passive: true });
    window.addEventListener("resize", () => {
      if (cur) cur.last.focus = null;
      onScrollDemo();
    });
    update();
  }
}

/* ---------- Seitenweite Effekte ---------- */
const finePointer = window.matchMedia("(pointer: fine)").matches;

// Hero-Überschrift Wort für Wort einblenden
const heroTitle = document.querySelector(".hero h1");
if (heroTitle && !reduceMotion) {
  let wordIndex = 0;
  const wrap = (node) => {
    const mask = document.createElement("span");
    mask.className = "wm";
    const word = document.createElement("span");
    word.className = "w";
    word.style.setProperty("--i", wordIndex++);
    word.append(node);
    mask.append(word);
    return mask;
  };
  [...heroTitle.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.append(document.createTextNode(" "));
        else frag.append(wrap(document.createTextNode(part)));
      });
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "BR") {
      const placeholder = document.createComment("");
      node.replaceWith(placeholder);
      placeholder.replaceWith(wrap(node));
    }
  });
  document.documentElement.classList.add("split-ready");
}

// Icons zeichnen sich beim Einblenden selbst
if (!reduceMotion && "IntersectionObserver" in window) {
  document
    .querySelectorAll(".service.reveal .service-icon svg *")
    .forEach((shape) => shape.setAttribute("pathLength", "1"));
  document.documentElement.classList.add("draw-ready");
}

// Licht folgt der Maus auf Karten
if (finePointer) {
  document
    .querySelectorAll(".service, .price-card, .project-card")
    .forEach((card) =>
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }),
    );
}

// Buttons ziehen sich leicht zum Mauszeiger
if (finePointer && !reduceMotion) {
  document
    .querySelectorAll(".btn:not(.btn-block):not(.btn-small)")
    .forEach((btn) => {
      btn.classList.add("magnetic");
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.translate = `${clamp2(x)}px ${clamp2(y)}px`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.translate = "";
      });
    });
}
function clamp2(v) {
  return Math.max(-8, Math.min(8, v));
}

/* =========================================================
   Startseite – Bewegung (nur body.home)
   ========================================================= */
if (document.body.classList.contains("home")) {
  const motion = !reduceMotion;
  const lim = (v, a, b) => Math.min(b, Math.max(a, v));

  // Wörter in Masken legen (für Überschriften)
  function splitWords(el, cls) {
    let i = 0;
    const wrap = (node) => {
      const mask = document.createElement("span");
      mask.className = `${cls}-mask`;
      const word = document.createElement("span");
      word.className = cls;
      word.style.setProperty("--i", i++);
      word.append(node);
      mask.append(word);
      return mask;
    };
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.append(document.createTextNode(" "));
          else frag.append(wrap(document.createTextNode(part)));
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "BR") {
        const mark = document.createComment("");
        node.replaceWith(mark);
        mark.replaceWith(wrap(node));
      }
    });
  }

  if (motion) {
    document
      .querySelectorAll(
        ".home .section-head h2, .home .meo-head h2, .home .contact-text h2",
      )
      .forEach((h) => splitWords(h, "sw"));
  }

  // Problem-Text Wort für Wort einfärben
  const scrub = document.querySelector(".scrub-text");
  let scrubWords = [];
  if (scrub && motion) {
    const words = scrub.textContent.trim().split(/\s+/);
    scrub.replaceChildren(
      ...words.flatMap((w, i) => {
        const span = document.createElement("span");
        span.className = "sc";
        span.textContent = w;
        return i < words.length - 1
          ? [span, document.createTextNode(" ")]
          : [span];
      }),
    );
    scrubWords = [...scrub.querySelectorAll(".sc")];
  }

  // Footer-Schriftzug Buchstabe für Buchstabe
  const giant = document.querySelector(".footer-giant");
  if (giant && motion) {
    const letters = [...giant.textContent];
    giant.replaceChildren(
      ...letters.map((c, i) => {
        const span = document.createElement("span");
        span.className = "ch";
        span.style.setProperty("--i", i);
        span.textContent = c;
        return span;
      }),
    );
    new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          giant.classList.add("is-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    ).observe(giant);
  }

  // Aktiven Abschnitt in der Navigation markieren
  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const linkFor = new Map(
    navLinks.map((a) => [a.getAttribute("href").slice(1), a]),
  );
  if ("IntersectionObserver" in window) {
    const navIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          navLinks.forEach((a) => a.classList.remove("is-active"));
          const link = linkFor.get(e.target.id);
          if (link && !link.classList.contains("btn"))
            link.classList.add("is-active");
        }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    linkFor.forEach((_, id) => {
      const sec = document.getElementById(id);
      if (sec) navIO.observe(sec);
    });
  }

  // Scroll-Effekte: Header, Hero, Laufband, Text, Bilder
  const headerEl = document.querySelector(".site-header");
  const heroText = document.querySelector(".hero-text");
  const marqueeLists = [...document.querySelectorAll(".marquee ul")];
  const projectImgs = [...document.querySelectorAll(".project-img img")];
  let lastY = window.scrollY;
  let skew = 0;
  let scrollQueued = false;

  function onHomeScroll() {
    scrollQueued = false;
    const y = window.scrollY;
    const dy = y - lastY;
    const vh = window.innerHeight;

    // Header aus-/einblenden
    const menuOpen = document
      .querySelector("#main-nav")
      ?.classList.contains("open");
    if (headerEl && !menuOpen) {
      if (y > 500 && dy > 6) headerEl.classList.add("is-hidden");
      else if (dy < -4 || y < 200) headerEl.classList.remove("is-hidden");
    }

    if (motion) {
      // Hero-Text löst sich beim Scrollen
      if (heroText && y < vh) {
        const p = y / vh;
        heroText.style.transform = `translateY(${p * -80}px)`;
        heroText.style.opacity = String(1 - p * 1.1);
      }
      // Laufband neigt sich mit der Scroll-Geschwindigkeit
      skew = lim(dy * 0.35, -10, 10);
      marqueeLists.forEach((ul) =>
        ul.style.setProperty("--skew", `${-skew}deg`),
      );
      // Problem-Text einfärben
      if (scrubWords.length) {
        const r = scrub.getBoundingClientRect();
        const p = lim((vh * 0.85 - r.top) / (vh * 0.5), 0, 1);
        const n = Math.round(p * scrubWords.length);
        scrubWords.forEach((w, i) => w.classList.toggle("on", i < n));
      }
      // Projektbilder: Parallax
      projectImgs.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.setProperty("--py", `${(p * -24).toFixed(1)}px`);
      });
    }
    lastY = y;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollQueued) {
        scrollQueued = true;
        requestAnimationFrame(onHomeScroll);
      }
    },
    { passive: true },
  );
  onHomeScroll();
  // Laufband nach dem Scrollen wieder aufrichten
  let settle;
  window.addEventListener(
    "scroll",
    () => {
      clearTimeout(settle);
      settle = setTimeout(
        () =>
          marqueeLists.forEach((ul) => ul.style.setProperty("--skew", "0deg")),
        120,
      );
    },
    { passive: true },
  );

  if (motion && finePointer) {
    // Hero-Mockup kippt in 3D mit der Maus
    const heroSec = document.querySelector(".hero");
    const tilt = document.querySelector(".hero-tilt");
    if (heroSec && tilt) {
      heroSec.addEventListener("pointermove", (e) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        tilt.style.setProperty("--ty", `${(x * 14).toFixed(2)}deg`);
        tilt.style.setProperty("--tx", `${(y * -10).toFixed(2)}deg`);
      });
      heroSec.addEventListener("pointerleave", () => {
        tilt.style.setProperty("--ty", "0deg");
        tilt.style.setProperty("--tx", "0deg");
      });
    }

    // Karten neigen sich zur Maus (erst nach dem Einblenden)
    const tiltCards = document.querySelectorAll(
      ".home .service.reveal, .home .price-card.reveal, .home .project-card.reveal",
    );
    const readyIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          readyIO.unobserve(e.target);
          setTimeout(() => e.target.classList.add("tilt-ready"), 1300);
        }),
      { threshold: 0.2 },
    );
    tiltCards.forEach((card) => {
      readyIO.observe(card);
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--ry", `${(x * 7).toFixed(2)}deg`);
        card.style.setProperty("--rx", `${(y * -7).toFixed(2)}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--rx", "0deg");
      });
    });
  }

  // FAQ weich auf- und zuklappen
  if (motion) {
    document.querySelectorAll(".home .faq details").forEach((d) => {
      const summary = d.querySelector("summary");
      summary.addEventListener("click", (e) => {
        e.preventDefault();
        if (d.dataset.anim) return;
        const start = d.offsetHeight;
        const closing = d.open;
        if (!closing) d.open = true;
        const border = d.offsetHeight - d.clientHeight;
        const end = closing
          ? summary.offsetHeight + border
          : d.scrollHeight + border;
        d.dataset.anim = "1";
        const anim = d.animate(
          { height: [`${start}px`, `${end}px`] },
          { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
        anim.onfinish = () => {
          if (closing) d.open = false;
          delete d.dataset.anim;
        };
      });
    });
  }
}
