/* meoform – Startseite (Redesign Editorial). Unterseiten nutzen weiterhin script.js */
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/* ---------- Navigation: Mobil-Panel ---------- */
const toggle = document.querySelector(".nav-toggle");
const panel = document.getElementById("nav-panel");
if (toggle && panel) {
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".visually-hidden").textContent = open
      ? "Menü schließen"
      : "Menü öffnen";
    document.body.classList.toggle("nav-open", open);
    panel.inert = !open;
    document
      .querySelectorAll("main, .site-footer, .skip-link")
      .forEach((el) => (el.inert = open));
  };
  panel.inert = true;
  toggle.addEventListener("click", () =>
    setOpen(toggle.getAttribute("aria-expanded") !== "true"),
  );
  panel
    .querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  matchMedia("(min-width: 960px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
}

/* ---------- Header: Zustand nach dem ersten Scrollen ---------- */
const header = document.querySelector(".site-header");
if (header && "IntersectionObserver" in window) {
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:0;height:8px;width:1px";
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) =>
    header.classList.toggle("is-scrolled", !e.isIntersecting),
  ).observe(sentinel);
}

/* ---------- Aktueller Abschnitt in der Navigation ---------- */
const navLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
if (navLinks.length && "IntersectionObserver" in window) {
  const map = new Map(
    navLinks.map((a) => [document.querySelector(a.getAttribute("href")), a]),
  );
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.removeAttribute("aria-current"));
        map.get(e.target)?.setAttribute("aria-current", "true");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  map.forEach((_, sec) => sec && spy.observe(sec));
}

/* ---------- Abschnitte beim Scrollen einblenden (einmalig) ---------- */
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
    { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Tagline: Wörter werden nacheinander dunkel ---------- */
const tagline = document.querySelector("[data-tagline]");
if (tagline && !reduceMotion && "IntersectionObserver" in window) {
  const words = [];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.append(part);
          } else {
            const w = document.createElement("span");
            w.className = "tw";
            w.textContent = part;
            words.push(w);
            frag.append(w);
          }
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== "BR") walk(child);
    });
  };
  walk(tagline);
  tagline.classList.add("is-split");
  const wio = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-on");
          wio.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -38% 0px" },
  );
  words.forEach((w) => wio.observe(w));
}

/* ---------- Formular: Prüfung beim Absenden, Fehler am Feld ---------- */
const form = document.querySelector(".contact-form");
if (form) {
  form.setAttribute("novalidate", "");
  const msgs = {
    name: "Bitte geben Sie Ihren Namen ein.",
    email: "Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@firma.de.",
    nachricht: "Bitte schreiben Sie kurz, worum es geht.",
  };
  const check = (field) => {
    const err = document.getElementById(`${field.id}-err`);
    const ok = field.checkValidity();
    if (ok) field.removeAttribute("aria-invalid");
    else field.setAttribute("aria-invalid", "true");
    if (err) err.textContent = ok ? "" : msgs[field.id] || "";
    return ok;
  };
  form.querySelectorAll("[required]").forEach((f) =>
    f.addEventListener("blur", () => {
      if (f.value) check(f);
    }),
  );
  form.addEventListener("submit", (e) => {
    const fields = [...form.querySelectorAll("[required]")];
    const bad = fields.filter((f) => !check(f));
    if (bad.length) {
      e.preventDefault();
      bad[0].focus();
      return;
    }
    const btn = form.querySelector("[type=submit]");
    btn.setAttribute("aria-busy", "true");
    btn.textContent = "Wird gesendet …";
  });
}

/* ---------- Aktuelles Jahr im Footer ---------- */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

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


/* ---------- Illustrationen nur abspielen, wenn sichtbar ---------- */
const anims = document.querySelectorAll(".anim");
if (anims.length && !reduceMotion && "IntersectionObserver" in window) {
  const aio = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) =>
        e.target.classList.toggle("is-playing", e.isIntersecting),
      ),
    { threshold: 0.25 },
  );
  anims.forEach((el) => aio.observe(el));
}

/* ---------- Mini-Demo: Rechnung erfassen (Beispieldaten, ohne innerHTML) ---------- */
const mini = document.getElementById("mini-demo");
if (mini) {
  const runBtn = document.getElementById("mini-run");
  const status = document.getElementById("mini-status");
  const row = document.getElementById("mini-new");
  const fields = [...mini.querySelectorAll(".mf")].sort(
    (a, b) => a.dataset.f - b.dataset.f,
  );
  const cells = [...row.querySelectorAll("[data-c]")];
  const values = ["Farbenhandel Krüger", "4471", "428,58 €", "17.11."];
  let timers = [];
  let ran = false;

  const reset = () => {
    timers.forEach(clearTimeout);
    timers = [];
    fields.forEach((f) => f.classList.remove("is-hl", "is-done"));
    cells.forEach((c) => {
      c.classList.remove("is-in");
      c.textContent = "";
    });
    row.classList.remove("is-filled");
    status.textContent = "";
  };

  const finish = () => {
    status.textContent =
      "In offene Posten eingetragen. Erinnerung am 15.11. geplant.";
    runBtn.textContent = "Erneut abspielen";
    runBtn.removeAttribute("aria-disabled");
  };

  const run = () => {
    ran = true;
    reset();
    runBtn.setAttribute("aria-disabled", "true");
    if (reduceMotion) {
      fields.forEach((f) => f.classList.add("is-done"));
      cells.forEach((c, i) => {
        c.textContent = values[i];
        c.classList.add("is-in");
      });
      row.classList.add("is-filled");
      finish();
      return;
    }
    status.textContent = "Rechnung wird gelesen …";
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    fields.forEach((f, i) => {
      const t = 500 + i * 700;
      at(t, () => f.classList.add("is-hl"));
      at(t + 450, () => {
        f.classList.replace("is-hl", "is-done");
        cells[i].textContent = values[i];
        cells[i].classList.add("is-in");
        if (i === 0) row.classList.add("is-filled");
      });
    });
    at(500 + fields.length * 700 + 300, finish);
  };

  runBtn.addEventListener("click", () => {
    if (runBtn.getAttribute("aria-disabled") !== "true") run();
  });

  /* Einmal automatisch abspielen, wenn die Demo ins Bild kommt */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const mio = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !ran) {
          run();
          mio.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    mio.observe(mini);
  }
}

/* ---------- Illustrationen: erneut abspielen bei Hover/Tippen ---------- */
document.querySelectorAll(".offer").forEach((card) => {
  const ill = card.querySelector(".anim");
  if (!ill || reduceMotion) return;
  let last = 0;
  const replay = () => {
    if (Date.now() - last < 5000) return; // nicht während eines Durchlaufs
    last = Date.now();
    ill.classList.remove("is-playing");
    ill.querySelectorAll("*").forEach((el) => {
      el.style.animation = "none";
      void el.getBoundingClientRect();
      el.style.animation = "";
    });
    ill.classList.add("is-playing");
  };
  card.addEventListener("pointerenter", replay);
  ill.addEventListener("click", replay);
});

/* ---------- Ablauf: Sequenz einmal starten ---------- */
const stepsEl = document.getElementById("steps");
if (stepsEl) {
  if (!reduceMotion && "IntersectionObserver" in window) {
    const sio = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          stepsEl.classList.add("is-run");
          sio.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    sio.observe(stepsEl);
  } else stepsEl.classList.add("is-run");
}

/* ---------- Arbeiten: Filter nach Branche ---------- */
const workBtns = [...document.querySelectorAll(".work-filter .chip")];
const works = [...document.querySelectorAll(".work[data-category]")];
if (workBtns.length && works.length) {
  const workStatus = document.getElementById("work-status");
  const labelOf = (b) => b.firstChild.textContent.trim();
  workBtns.forEach((b) => {
    const f = b.dataset.filter;
    const n =
      f === "alle"
        ? works.length
        : works.filter((w) => w.dataset.category === f).length;
    b.querySelector(".chip-count").textContent = n;
    if (n === 0) b.hidden = true;
  });
  const layout = () =>
    works
      .filter((w) => !w.hidden)
      .forEach((w, i) => w.classList.toggle("is-offset", i % 2 === 1));
  layout();
  workBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      workBtns.forEach((b) =>
        b.setAttribute("aria-pressed", String(b === btn)),
      );
      let shown = 0;
      works.forEach((w) => {
        const show = f === "alle" || w.dataset.category === f;
        w.hidden = !show;
        w.classList.remove("is-entering");
        if (show) {
          w.classList.add("is-visible");
          w.style.setProperty("--n", shown++);
          void w.offsetWidth;
          w.classList.add("is-entering");
        }
      });
      layout();
      workStatus.textContent = `${shown} ${shown === 1 ? "Projekt" : "Projekte"}: ${labelOf(btn)}`;
    }),
  );
}
