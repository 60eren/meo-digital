/* Sorella Kosmetik – gemeinsames Script für alle Seiten */
(function () {
  "use strict";

  // Echtes Versenden der Terminanfragen: z. B. bei formspree.io ein Formular anlegen
  // und die URL hier eintragen ("https://formspree.io/f/xxxxxxx"). Leer = nur Bestätigung im Browser.
  var FORM_ENDPOINT = "";

  // Öffnungszeiten: Index 0 = Sonntag … 6 = Samstag. null = geschlossen.
  var HOURS = [
    null, // So
    null, // Mo
    ["09:00", "19:00"], // Di
    ["09:00", "19:00"], // Mi
    ["09:00", "19:00"], // Do
    ["09:00", "19:00"], // Fr
    ["09:00", "15:00"], // Sa
  ];
  var DAY_NAMES = [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
  ];

  // Behandlungen: Kategorie, Name, Beschreibung, Dauer (Minuten), Preis (Euro)
  var TREATMENTS = [
    {
      id: "klassik",
      cat: "Gesicht",
      name: "Klassische Gesichtsbehandlung",
      desc: "Reinigung, Peeling, Ausreinigung, Maske und Massage. Abgestimmt auf Ihren Hauttyp.",
      min: 75,
      price: 79,
    },
    {
      id: "hydra",
      cat: "Gesicht",
      name: "Hydra-Facial",
      desc: "Tiefenreinigung mit Feuchtigkeitsinfusion. Sichtbar frischer Teint ohne Ausfallzeit.",
      min: 60,
      price: 119,
    },
    {
      id: "anti-age",
      cat: "Gesicht",
      name: "Anti-Aging Intensiv",
      desc: "Wirkstoffbehandlung mit Hyaluron und Peptiden, Lifting-Massage und Ampullenkur.",
      min: 90,
      price: 129,
    },
    {
      id: "akne",
      cat: "Gesicht",
      name: "Behandlung bei unreiner Haut",
      desc: "Gründliche Ausreinigung, beruhigende Maske und Pflegeplan für zu Hause.",
      min: 60,
      price: 69,
    },
    {
      id: "lash-lift",
      cat: "Wimpern & Brauen",
      name: "Wimpernlifting inkl. Färben",
      desc: "Natürlicher Schwung, der sechs bis acht Wochen hält.",
      min: 60,
      price: 65,
    },
    {
      id: "brow",
      cat: "Wimpern & Brauen",
      name: "Augenbrauen-Styling",
      desc: "Formen, Zupfen und Färben passend zu Ihrer Gesichtsform.",
      min: 30,
      price: 29,
    },
    {
      id: "lamination",
      cat: "Wimpern & Brauen",
      name: "Brow Lamination",
      desc: "Voll und gekämmt wirkende Brauen für mehrere Wochen.",
      min: 45,
      price: 55,
    },
    {
      id: "mani",
      cat: "Hände & Füße",
      name: "Maniküre mit Shellac",
      desc: "Nagelpflege, Nagelhautbehandlung und langhaltender Farblack.",
      min: 60,
      price: 45,
    },
    {
      id: "pedi",
      cat: "Hände & Füße",
      name: "Kosmetische Fußpflege",
      desc: "Fußbad, Hornhautentfernung, Nagelpflege und Fußmassage.",
      min: 60,
      price: 49,
    },
    {
      id: "massage",
      cat: "Körper",
      name: "Entspannungsmassage",
      desc: "Ganzkörpermassage mit warmem Öl zur tiefen Entspannung.",
      min: 60,
      price: 65,
    },
    {
      id: "wax",
      cat: "Körper",
      name: "Haarentfernung mit Warmwachs",
      desc: "Schonend und gründlich. Preis für Beine komplett.",
      min: 45,
      price: 42,
    },
  ];

  /* ======================================================
     Hilfsfunktionen
     ====================================================== */
  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function toMin(hhmm) {
    var p = hhmm.split(":");
    return +p[0] * 60 + +p[1];
  }
  function toHHMM(m) {
    return (
      String(Math.floor(m / 60)).padStart(2, "0") +
      ":" +
      String(m % 60).padStart(2, "0")
    );
  }
  function euro(n) {
    return n.toLocaleString("de-DE") + " €";
  }
  function store(key, val) {
    try {
      if (val === undefined) return sessionStorage.getItem(key);
      if (val === null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, val);
    } catch (e) {
      return null;
    }
  }
  function toast(msg) {
    var t = $(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () {
      t.classList.remove("is-visible");
    }, 2600);
  }
  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  /* ======================================================
     Navigation
     ====================================================== */
  var header = $(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var menuBtn = $(".menu-btn"),
    links = $(".nav-links");
  function closeMenu() {
    if (!menuBtn) return;
    menuBtn.setAttribute("aria-expanded", "false");
    links.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  if (menuBtn && links) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") !== "true";
      menuBtn.setAttribute("aria-expanded", String(open));
      links.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$("a", links).forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  // aktuelle Seite markieren
  var page = document.body.getAttribute("data-page");
  $$(".nav-links a[data-nav]").forEach(function (a) {
    if (a.getAttribute("data-nav") === page)
      a.setAttribute("aria-current", "page");
  });

  $$("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ======================================================
     Öffnungsstatus und Öffnungszeiten-Tabelle
     ====================================================== */
  function openState(now) {
    var d = now.getDay(),
      h = HOURS[d],
      m = now.getHours() * 60 + now.getMinutes();
    if (h && m >= toMin(h[0]) && m < toMin(h[1]))
      return { open: true, text: "Jetzt geöffnet · bis " + h[1] + " Uhr" };
    // nächste Öffnung suchen
    for (var i = 0; i < 8; i++) {
      var dd = (d + i) % 7,
        hh = HOURS[dd];
      if (!hh) continue;
      if (i === 0 && m >= toMin(hh[0])) continue;
      var when = i === 0 ? "heute" : i === 1 ? "morgen" : DAY_NAMES[dd];
      return {
        open: false,
        text: "Geschlossen · öffnet " + when + " um " + hh[0] + " Uhr",
      };
    }
    return { open: false, text: "Geschlossen" };
  }
  function renderOpenStatus() {
    var s = openState(new Date());
    $$("[data-open-status]").forEach(function (el) {
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
      el.innerHTML = '<i aria-hidden="true"></i>' + s.text;
    });
  }
  renderOpenStatus();
  setInterval(renderOpenStatus, 60000);

  $$("[data-hours]").forEach(function (table) {
    var order = [1, 2, 3, 4, 5, 6, 0],
      today = new Date().getDay();
    table.innerHTML = order
      .map(function (d) {
        var h = HOURS[d];
        return (
          "<tr" +
          (d === today ? ' class="is-today"' : "") +
          "><td>" +
          DAY_NAMES[d] +
          "</td><td>" +
          (h ? h[0] + " – " + h[1] : "geschlossen") +
          "</td></tr>"
        );
      })
      .join("");
  });

  /* ======================================================
     Kopieren (Telefon, E-Mail)
     ====================================================== */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        toast("Kopiert: " + text);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {
          fallbackCopy(text);
          done();
        });
      } else {
        fallbackCopy(text);
        done();
      }
    });
  });
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ======================================================
     Startseite: Bewertungs-Slider
     ====================================================== */
  var stage = $("[data-reviews]");
  if (stage) {
    var slides = $$(".review", stage),
      dotsWrap = $("[data-review-dots]"),
      idx = 0,
      timer;
    slides.forEach(function (s, i) {
      s.hidden = i !== 0;
      var b = document.createElement("button");
      b.className = "dot-btn";
      b.type = "button";
      b.setAttribute("aria-label", "Bewertung " + (i + 1));
      b.addEventListener("click", function () {
        show(i);
        restart();
      });
      dotsWrap.appendChild(b);
    });
    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        s.hidden = n !== idx;
        s.classList.toggle("is-entering", n === idx);
      });
      $$(".dot-btn", dotsWrap).forEach(function (d, n) {
        d.setAttribute("aria-current", String(n === idx));
      });
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(idx + 1);
      }, 7000);
    }
    $("[data-review-prev]").addEventListener("click", function () {
      show(idx - 1);
      restart();
    });
    $("[data-review-next]").addEventListener("click", function () {
      show(idx + 1);
      restart();
    });
    stage.addEventListener("mouseenter", function () {
      clearInterval(timer);
    });
    stage.addEventListener("mouseleave", restart);
    show(0);
    restart();
  }

  // "Buchen"-Links auf der Startseite merken die Behandlung
  $$("[data-book]").forEach(function (a) {
    a.addEventListener("click", function () {
      store("sorella-treatment", a.getAttribute("data-book"));
    });
  });

  /* ======================================================
     Behandlungen: Filter und Suche
     ====================================================== */
  var list = $("[data-treatment-list]");
  if (list) {
    var cats = ["Alle"].concat(
      TREATMENTS.map(function (t) {
        return t.cat;
      }).filter(function (c, i, a) {
        return a.indexOf(c) === i;
      }),
    );
    var chipWrap = $("[data-chips]"),
      search = $("#treatment-search"),
      active = "Alle";
    try {
      active = localStorage.getItem("sorella-cat") || "Alle";
    } catch (e) {}
    if (cats.indexOf(active) === -1) active = "Alle";

    chipWrap.innerHTML = cats
      .map(function (c) {
        return (
          '<button type="button" class="chip" data-cat="' +
          c +
          '" aria-pressed="' +
          (c === active) +
          '">' +
          c +
          "</button>"
        );
      })
      .join("");
    $$(".chip", chipWrap).forEach(function (chip) {
      chip.addEventListener("click", function () {
        active = chip.getAttribute("data-cat");
        try {
          localStorage.setItem("sorella-cat", active);
        } catch (e) {}
        $$(".chip", chipWrap).forEach(function (c) {
          c.setAttribute("aria-pressed", String(c === chip));
        });
        render();
      });
    });
    search.addEventListener("input", render);

    function render() {
      var q = search.value.trim().toLowerCase();
      var items = TREATMENTS.filter(function (t) {
        return (
          (active === "Alle" || t.cat === active) &&
          (!q ||
            (t.name + " " + t.desc + " " + t.cat).toLowerCase().indexOf(q) !==
              -1)
        );
      });
      $("[data-count]").textContent =
        items.length + (items.length === 1 ? " Behandlung" : " Behandlungen");
      if (!items.length) {
        list.innerHTML =
          '<p class="empty">Keine Behandlung gefunden. Versuchen Sie einen anderen Suchbegriff.</p>';
        return;
      }
      list.innerHTML = items
        .map(function (t, i) {
          return (
            '<article class="menu-item" style="animation-delay:' +
            i * 0.04 +
            's">' +
            '<div><span class="tag">' +
            t.cat +
            "</span><h3>" +
            t.name +
            "</h3><p>" +
            t.desc +
            "</p></div>" +
            '<div class="menu-price"><strong>' +
            euro(t.price) +
            "</strong><span>" +
            t.min +
            " Min.</span></div>" +
            '<a class="btn btn--ghost btn--small" href="kontakt.html" data-pick="' +
            t.id +
            '">Termin buchen</a>' +
            "</article>"
          );
        })
        .join("");
      $$("[data-pick]", list).forEach(function (a) {
        a.addEventListener("click", function () {
          store("sorella-treatment", a.getAttribute("data-pick"));
        });
      });
    }
    render();
  }

  /* ======================================================
     Kontakt: Terminbuchung in 3 Schritten
     ====================================================== */
  var form = $("#booking-form");
  if (form) {
    var stepEls = $$("[data-step]", form),
      stepIdx = 0,
      chosenSlot = "";
    var selTreat = $("#b-treatment"),
      inDate = $("#b-date"),
      slotWrap = $("[data-slots]"),
      slotHint = $("[data-slots-hint]");

    selTreat.innerHTML =
      '<option value="">Bitte wählen …</option>' +
      TREATMENTS.map(function (t) {
        return (
          '<option value="' +
          t.id +
          '">' +
          t.name +
          " · " +
          t.min +
          " Min. · " +
          euro(t.price) +
          "</option>"
        );
      }).join("");
    var pre = store("sorella-treatment");
    if (
      pre &&
      TREATMENTS.some(function (t) {
        return t.id === pre;
      })
    )
      selTreat.value = pre;

    var today = new Date();
    inDate.min = isoDate(today);
    var max = new Date();
    max.setDate(max.getDate() + 90);
    inDate.max = isoDate(max);

    function isoDate(d) {
      return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0")
      );
    }
    function parseDate(v) {
      var p = v.split("-");
      return new Date(+p[0], +p[1] - 1, +p[2]);
    }
    function treatment() {
      return TREATMENTS.filter(function (t) {
        return t.id === selTreat.value;
      })[0];
    }

    // Demo: einige Zeiten sind "schon belegt" (für jedes Datum gleich bleibend)
    function isTaken(dateStr, minutes) {
      var seed = 0,
        s = dateStr + minutes;
      for (var i = 0; i < s.length; i++)
        seed = (seed * 31 + s.charCodeAt(i)) % 997;
      return seed % 4 === 0;
    }

    function renderSlots() {
      chosenSlot = "";
      slotWrap.innerHTML = "";
      var t = treatment();
      if (!inDate.value || !t) {
        slotHint.textContent = "Wählen Sie zuerst Behandlung und Datum.";
        return;
      }
      var d = parseDate(inDate.value),
        h = HOURS[d.getDay()];
      if (!h) {
        slotHint.textContent =
          "Am " +
          DAY_NAMES[d.getDay()] +
          " ist das Studio geschlossen. Bitte wählen Sie einen anderen Tag.";
        return;
      }
      var start = toMin(h[0]),
        end = toMin(h[1]) - t.min,
        nowMin = -1;
      if (isoDate(new Date()) === inDate.value) {
        var n = new Date();
        nowMin = n.getHours() * 60 + n.getMinutes() + 60;
      }
      var html = "",
        free = 0;
      for (var m = start; m <= end; m += 30) {
        var dis = m < nowMin || isTaken(inDate.value, m);
        if (!dis) free++;
        html +=
          '<button type="button" class="slot" data-time="' +
          toHHMM(m) +
          '" aria-pressed="false"' +
          (dis ? " disabled" : "") +
          ">" +
          toHHMM(m) +
          "</button>";
      }
      slotWrap.innerHTML = html;
      slotHint.textContent = free
        ? free +
          " freie Zeiten am " +
          d.toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }) +
          "."
        : "An diesem Tag ist leider nichts mehr frei.";
      $$(".slot", slotWrap).forEach(function (b) {
        b.addEventListener("click", function () {
          chosenSlot = b.getAttribute("data-time");
          $$(".slot", slotWrap).forEach(function (x) {
            x.setAttribute("aria-pressed", String(x === b));
          });
          setError("slot", "");
        });
      });
    }
    selTreat.addEventListener("change", function () {
      setError("b-treatment", "");
      renderSlots();
    });
    inDate.addEventListener("change", function () {
      setError("b-date", "");
      renderSlots();
    });
    renderSlots();

    function setError(id, msg) {
      var field =
        id === "slot"
          ? slotWrap.closest(".field")
          : $("#" + id).closest(".field");
      field.classList.toggle("has-error", !!msg);
      var e = $(".err", field);
      if (e) e.textContent = msg;
      return !msg;
    }

    function validate(step) {
      var ok = true;
      if (step === 0) {
        ok =
          setError(
            "b-treatment",
            selTreat.value ? "" : "Bitte wählen Sie eine Behandlung.",
          ) && ok;
        var dv = inDate.value,
          msg = "";
        if (!dv) msg = "Bitte wählen Sie ein Datum.";
        else if (dv < inDate.min || dv > inDate.max)
          msg = "Bitte wählen Sie ein Datum in den nächsten 90 Tagen.";
        else if (!HOURS[parseDate(dv).getDay()])
          msg = "An diesem Tag ist das Studio geschlossen.";
        ok = setError("b-date", msg) && ok;
        ok =
          setError(
            "slot",
            chosenSlot || msg ? "" : "Bitte wählen Sie eine Uhrzeit.",
          ) && ok;
      }
      if (step === 1) {
        var name = $("#b-name").value.trim(),
          mail = $("#b-email").value.trim(),
          tel = $("#b-phone").value.trim();
        ok =
          setError(
            "b-name",
            name.length >= 2 ? "" : "Bitte geben Sie Ihren Namen ein.",
          ) && ok;
        ok =
          setError(
            "b-email",
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)
              ? ""
              : "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
          ) && ok;
        ok =
          setError(
            "b-phone",
            !tel || /^[+0-9][0-9 ()\/-]{5,}$/.test(tel)
              ? ""
              : "Bitte prüfen Sie die Telefonnummer.",
          ) && ok;
        ok =
          setError(
            "b-consent",
            $("#b-consent").checked
              ? ""
              : "Bitte stimmen Sie der Datenverarbeitung zu.",
          ) && ok;
      }
      if (!ok) {
        var first = $(
          ".has-error input, .has-error select, .has-error .slot:not(:disabled)",
          stepEls[step],
        );
        if (first) first.focus();
      }
      return ok;
    }

    function goTo(i) {
      stepIdx = i;
      stepEls.forEach(function (s, n) {
        s.hidden = n !== i;
      });
      $$(".steps li").forEach(function (li, n) {
        li.classList.toggle("is-active", n === i);
        li.classList.toggle("is-done", n < i);
      });
      if (i === 2) renderSummary();
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function renderSummary() {
      var t = treatment(),
        d = parseDate(inDate.value);
      var rows = [
        ["Behandlung", t.name],
        [
          "Termin",
          d.toLocaleDateString("de-DE", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }) +
            ", " +
            chosenSlot +
            " Uhr",
        ],
        ["Dauer", t.min + " Minuten"],
        ["Preis", euro(t.price)],
        ["Name", $("#b-name").value.trim()],
        ["E-Mail", $("#b-email").value.trim()],
      ];
      if ($("#b-phone").value.trim())
        rows.push(["Telefon", $("#b-phone").value.trim()]);
      $("[data-summary]").innerHTML = rows
        .map(function (r) {
          return (
            "<div><span>" +
            r[0] +
            "</span><strong>" +
            escapeHTML(r[1]) +
            "</strong></div>"
          );
        })
        .join("");
    }

    $$("[data-next]", form).forEach(function (b) {
      b.addEventListener("click", function () {
        if (validate(stepIdx)) goTo(stepIdx + 1);
      });
    });
    $$("[data-back]", form).forEach(function (b) {
      b.addEventListener("click", function () {
        goTo(stepIdx - 1);
      });
    });
    $$("#b-name, #b-email, #b-phone").forEach(function (el) {
      el.addEventListener("input", function () {
        setError(el.id, "");
      });
    });
    $("#b-consent").addEventListener("change", function () {
      setError("b-consent", "");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if ($("#b-website").value) return; // Spam-Schutz (Honeypot)
      if (!validate(0) || !validate(1)) return;
      var t = treatment();
      var data = {
        behandlung: t.name,
        datum: inDate.value,
        uhrzeit: chosenSlot,
        name: $("#b-name").value.trim(),
        email: $("#b-email").value.trim(),
        telefon: $("#b-phone").value.trim(),
        nachricht: $("#b-notes").value.trim(),
      };
      var btn = $("[type=submit]", form);
      btn.disabled = true;
      btn.textContent = "Wird gesendet …";

      var finish = function () {
        store("sorella-treatment", null);
        var d = parseDate(data.datum);
        $("[data-booking-card]").innerHTML =
          '<div class="success" role="status"><div class="success-icon"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
          "<h2>Vielen Dank, " +
          escapeHTML(data.name.split(" ")[0]) +
          ".</h2>" +
          "<p>Ihre Anfrage für <strong>" +
          escapeHTML(data.behandlung) +
          "</strong> am " +
          d.toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }) +
          " um " +
          data.uhrzeit +
          " Uhr ist eingegangen. Wir bestätigen den Termin innerhalb von 24 Stunden per E-Mail.</p>" +
          '<a class="btn btn--ghost" href="index.html">Zur Startseite</a></div>';
      };

      if (!FORM_ENDPOINT) {
        setTimeout(finish, 700);
        return;
      }
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(function (r) {
          if (!r.ok) throw new Error();
          finish();
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = "Termin anfragen";
          toast(
            "Senden fehlgeschlagen. Bitte versuchen Sie es erneut oder rufen Sie uns an.",
          );
        });
    });

    goTo(0);
    // nicht direkt zum Formular scrollen beim ersten Laden
    window.scrollTo(0, 0);
  }

  /* ======================================================
     Kontaktformular (allgemeine Nachricht)
     ====================================================== */
  var msgForm = $("#message-form");
  if (msgForm) {
    msgForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#m-name"),
        mail = $("#m-email"),
        text = $("#m-text"),
        ok = true;
      [
        [
          name,
          name.value.trim().length >= 2,
          "Bitte geben Sie Ihren Namen ein.",
        ],
        [
          mail,
          /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim()),
          "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        ],
        [
          text,
          text.value.trim().length >= 10,
          "Bitte schreiben Sie mindestens 10 Zeichen.",
        ],
      ].forEach(function (r) {
        var f = r[0].closest(".field");
        f.classList.toggle("has-error", !r[1]);
        $(".err", f).textContent = r[1] ? "" : r[2];
        if (!r[1]) ok = false;
      });
      if (!ok) return;
      msgForm.reset();
      toast("Danke! Ihre Nachricht ist eingegangen.");
    });
  }
})();
