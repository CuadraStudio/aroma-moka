/* ==========================================================================
   Aroma Moka & Dolce Shop · v7.0
   - El motor de Cuadra pone los reveals y la deriva de los carriles.
   - Todo lo de acá es del sitio: interruptor de modo, cierre que se junta,
     línea central, barra de progreso y pilas de fotos.
   Sin librerías. prefers-reduced-motion: nada se anima y todo queda en su
   estado final.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.CuadraMotion
    ? window.CuadraMotion.reduceMotion()
    : window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Movimiento de la portada (zoom con el scroll, mouse, respiración): se apaga con "reducir movimiento". */
  var heroMotion = !reduce;
  var heroEls = [].slice.call(document.querySelectorAll(".hero--cover"));

  var strips = []; // franjas que se actualizan con el scroll de la página (carruseles de fotos)

  /* ---------- 1. Motor de Cuadra: reveals + parallax declarativo ---------- */
  if (window.CuadraMotion) window.CuadraMotion.init();

  /* ---------- 2. Progreso de scroll → variable --p / --page ---------- */
  var scrubEls = [].slice.call(document.querySelectorAll("[data-scrub]"));

  function clamp01(n) {
    return n < 0 ? 0 : n > 1 ? 1 : n;
  }

  function scrub() {
    if (reduce) return;
    var vh = window.innerHeight;
    for (var i = 0; i < scrubEls.length; i++) {
      var el = scrubEls[i];
      var r = el.getBoundingClientRect();
      if (!r.height) continue; // está en el otro modo (oculto)
      // 0 cuando el borde superior entra por abajo, 1 cuando llegó a 25% del alto
      el.style.setProperty("--p", clamp01((vh - r.top) / (vh * 0.75)).toFixed(3));
    }
    var max = root.scrollHeight - vh;
    root.style.setProperty("--page", max > 0 ? clamp01(window.scrollY / max).toFixed(4) : "0");
    for (var k = 0; k < strips.length; k++) strips[k].update();
    if (heroMotion) {
      // avance del scroll sobre la portada visible: 0 arriba de todo, 1 cuando ya salió
      var hero = heroEls.filter(function (h) { return h.offsetParent !== null; })[0];
      if (hero) root.style.setProperty("--hp", clamp01(window.scrollY / (hero.offsetHeight || 1)).toFixed(3));
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      scrub();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  scrub();

  /* ---------- 3. Carruseles de fotos: cambian solas, estilo historias ---------- */
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  // las fotos avanzan solas, estilo historias: barra de segmentos, toque en los lados y pausa
  function initHistorias(stack, wrap, cards) {
    var n = cards.length, idx = 0, DURATION = 4500;
    var isRight = stack.classList.contains("stack--r");
    var elapsed = reduce ? DURATION : (isRight ? DURATION * 0.45 : 0); // los dos carriles no cambian a la vez
    var paused = false, held = false, hovering = false, finishNow = null;
    var heldFor = 0, downAt = 0, swiped = false, sx = 0, sy = 0, raf = 0, last = 0;
    var caption = wrap.querySelector(".stack__caption"), count = wrap.querySelector(".stack__count");
    var ctrl = wrap.querySelector(".stack__ctrl");
    if (caption) caption.setAttribute("aria-live", "off"); // cambia solo: que no lo lea cada vez

    var segs = document.createElement("div");
    segs.className = "hist__segs";
    segs.setAttribute("aria-hidden", "true");
    var fills = cards.map(function () {
      var s = document.createElement("span"), f = document.createElement("i");
      s.className = "hist__seg";
      s.appendChild(f);
      segs.appendChild(s);
      return f;
    });
    stack.appendChild(segs);

    function zone(cls, label) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "hist__zone " + cls;
      b.setAttribute("aria-label", label);
      stack.appendChild(b);
      return b;
    }
    var prevB = zone("hist__zone--l", "Foto anterior");
    var nextB = zone("hist__zone--r", "Foto siguiente");
    var pauseB = null;
    if (!reduce && ctrl) {
      pauseB = document.createElement("button");
      pauseB.type = "button";
      pauseB.className = "round hist__pause";
      pauseB.setAttribute("aria-label", "Pausar el cambio automático");
      pauseB.textContent = "II";
      ctrl.appendChild(pauseB);
      pauseB.addEventListener("click", function () {
        paused = !paused;
        pauseB.textContent = paused ? "▶" : "II";
        pauseB.setAttribute("aria-label", paused ? "Reanudar el cambio automático" : "Pausar el cambio automático");
      });
    }

    function ui() {
      if (caption) caption.textContent = cards[idx].getAttribute("data-caption");
      if (count) count.textContent = pad2(idx + 1) + " / " + pad2(n);
      fills.forEach(function (f, i) {
        f.style.transform = "scaleX(" + (i < idx ? 1 : i === idx ? Math.min(1, elapsed / DURATION).toFixed(3) : 0) + ")";
      });
    }
    function mark() {
      cards.forEach(function (c, i) {
        c.classList.toggle("is-active", i === idx);
        c.setAttribute("aria-hidden", i === idx ? "false" : "true");
      });
    }

    // la foto nueva se abre como un círculo desde (x, y), medidos sobre la foto
    function go(next, x, y) {
      if (next === idx) return;
      if (finishNow) finishNow();
      var cur = cards[next];
      idx = next;
      elapsed = reduce ? DURATION : 0;
      ui();
      if (reduce || !cur.animate) { mark(); return; }
      var box = stack.getBoundingClientRect();
      x = typeof x === "number" ? Math.max(0, Math.min(box.width, x)) : box.width / 2;
      y = typeof y === "number" ? Math.max(0, Math.min(box.height, y)) : 0;
      var radius = Math.ceil(Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y)));
      cur.classList.add("is-entering");
      cur.setAttribute("aria-hidden", "false");
      var anim = cur.animate(
        { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + radius + "px at " + x + "px " + y + "px)"] },
        { duration: 650, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" }
      );
      var img = cur.querySelector("img");
      if (img && img.animate) img.animate({ transform: ["scale(1.12)", "scale(1)"] }, { duration: 900, easing: "cubic-bezier(0.2, 0.7, 0.1, 1)" });
      var done = false, timer = 0;
      finishNow = function () {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        anim.cancel();
        cur.classList.remove("is-entering");
        finishNow = null;
        mark();
      };
      anim.onfinish = finishNow;
      timer = window.setTimeout(finishNow, 720); // por si la pestaña estaba oculta y no se dispara "onfinish"
    }
    function navTo(next, e) {
      var box = stack.getBoundingClientRect();
      go(next, e ? e.clientX - box.left : undefined, e ? e.clientY - box.top : undefined);
    }

    // avance automático: solo mientras la franja se ve, sin pausa, sin mouse encima ni dedo apoyado
    function tick(ts) {
      raf = window.requestAnimationFrame(tick);
      var dt = Math.max(0, Math.min(100, ts - last)); // tope de 100 ms: al volver a la pestaña no salta de golpe
      last = ts;
      if (paused || held || hovering || document.hidden) return;
      elapsed += dt;
      if (elapsed >= DURATION) {
        var nx = (idx + 1) % n, sb = fills[nx].parentNode.getBoundingClientRect(), box = stack.getBoundingClientRect();
        go(nx, sb.left + sb.width / 2 - box.left, 0); // se abre desde donde terminó la barra
      } else {
        fills[idx].style.transform = "scaleX(" + (elapsed / DURATION).toFixed(3) + ")";
      }
    }
    function update() {
      var r = stack.getBoundingClientRect(), vh = window.innerHeight;
      var shown = r.height ? Math.min(r.bottom, vh) - Math.max(r.top, 0) : 0;
      var visible = !reduce && r.height > 0 && shown >= r.height * 0.4;
      if (visible && !raf) { last = performance.now(); raf = window.requestAnimationFrame(tick); }
      if (!visible && raf) { window.cancelAnimationFrame(raf); raf = 0; }
    }

    // toque en los lados (izquierdo = anterior, derecho = siguiente); apoyado más de 250 ms = pausa sin cambiar
    prevB.addEventListener("click", function (e) {
      if (heldFor >= 250 || swiped) { heldFor = 0; swiped = false; return; }
      navTo((idx - 1 + n) % n, e.detail ? e : null);
    });
    nextB.addEventListener("click", function (e) {
      if (heldFor >= 250 || swiped) { heldFor = 0; swiped = false; return; }
      navTo((idx + 1) % n, e.detail ? e : null);
    });
    stack.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      held = true; downAt = performance.now(); sx = e.clientX; sy = e.clientY; swiped = false; heldFor = 0;
    });
    function release(e) {
      if (!held) return;
      held = false;
      heldFor = performance.now() - downAt;
      if (e.type === "pointerup") {
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped = true; navTo((idx + (dx < 0 ? 1 : -1) + n) % n, e); }
      }
    }
    stack.addEventListener("pointerup", release);
    stack.addEventListener("pointercancel", release);
    stack.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hovering = true; });
    stack.addEventListener("pointerleave", function () { hovering = false; held = false; });

    stack.setAttribute("tabindex", "0");
    stack.setAttribute("role", "group");
    stack.setAttribute("aria-label", "Fotos que cambian solas; tocá los lados o usá las flechas del teclado");
    stack.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go((idx + 1) % n); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go((idx - 1 + n) % n); }
    });

    strips.push({ update: update });
    mark();
    ui();
    update();
  }

  [].forEach.call(document.querySelectorAll("[data-stack]"), function (stack) {
    initHistorias(stack, stack.closest(".stack-wrap"), [].slice.call(stack.querySelectorAll(".stack__card")));
  });

  /* ---------- 4. Interruptor Aroma Moka / Dolce Shop ---------- */
  var curtain = document.querySelector(".curtain");
  var announce = document.getElementById("modeAnnounce");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var switchBtns = [].slice.call(document.querySelectorAll(".switch__btn"));

  var TITLES = {
    aroma: "Aroma Moka & Dolce Shop · Un café y algo dulce",
    dolce: "Dolce Shop · Pastelería artesanal, tortas y galletas decoradas",
  };
  var DESCS = {
    aroma: "Aroma Moka y Dolce Shop: café con dibujo, pastelería artesanal y una mesa donde quedarse. Las Piedras, Canelones.",
    dolce: "Dolce Shop: tortas, cookies y galletas decoradas a medida, con presupuesto por WhatsApp. Las Piedras, Canelones.",
  };
  var descMeta = document.querySelector('meta[name="description"]');
  var FIELD = { aroma: "#7E411A", dolce: "#EFA6BC" };
  var NAMES = { aroma: "Aroma Moka", dolce: "Dolce Shop" };

  var mode = root.getAttribute("data-mode") === "dolce" ? "dolce" : "aroma";

  function apply(next, silent) {
    mode = next;
    root.setAttribute("data-mode", next);
    switchBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-mode") === next));
    });
    document.title = TITLES[next];
    if (descMeta) descMeta.setAttribute("content", DESCS[next]);
    if (themeMeta) themeMeta.setAttribute("content", FIELD[next]);
    try {
      localStorage.setItem("am-mode", next);
      var url = new URL(window.location.href);
      url.searchParams.set("v", next);
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (e) { /* sin storage o file://: no pasa nada */ }
    if (announce && !silent) announce.textContent = "Mostrando la web de " + NAMES[next];
    scrub();
  }

  /* Cambio de web: la nueva se abre como un círculo desde donde se tocó (API de transiciones
     de vista, ~0,65 s) y deja a la persona en el mismo lugar de la otra web. En un navegador
     sin esa API queda una cortina de color. Con "reducir movimiento", un fundido de 150 ms. */
  var busy = false;

  // secciones equivalentes entre las dos webs, en el mismo orden (el cierre es compartido)
  var SECTIONS = {
    aroma: ["inicio", "juntos", "cafe", "visitanos"],
    dolce: ["d-inicio", "d-medida", "d-tortas", "visitanos"],
  };

  function headerH() {
    var h = document.querySelector(".site-header");
    return h ? h.offsetHeight : 0;
  }

  // en qué sección y a qué altura de ella está la persona, para ubicarla igual en la otra web
  function capturePos() {
    var ids = SECTIONS[mode], line = window.scrollY + headerH(), idx = 0, i, r;
    for (i = 0; i < ids.length; i++) {
      r = document.getElementById(ids[i]).getBoundingClientRect();
      if (r.height && r.top + window.scrollY <= line + 1) idx = i;
    }
    var sec = document.getElementById(ids[idx]);
    var top = sec.getBoundingClientRect().top + window.scrollY;
    return {
      idx: idx,
      frac: Math.max(0, Math.min(1, (line - top) / (sec.offsetHeight || 1))),
      bottom: window.scrollY + window.innerHeight >= root.scrollHeight - 4,
    };
  }

  function restorePos(pos, next) {
    var max = Math.max(0, root.scrollHeight - window.innerHeight), y;
    if (pos.bottom) {
      y = max;
    } else {
      var sec = document.getElementById(SECTIONS[next][pos.idx]);
      var top = sec.getBoundingClientRect().top + window.scrollY;
      y = top + pos.frac * sec.offsetHeight - headerH();
    }
    window.scrollTo({ top: Math.max(0, Math.min(max, y)), behavior: "instant" });
  }

  function swapKeepingPlace(next, pos) {
    apply(next);
    restorePos(pos, next);
    scrub(); // que las variables de scroll ya correspondan a la nueva posición en el primer cuadro
  }

  function hasViewTransitions() {
    return typeof document.startViewTransition === "function";
  }

  // respaldo para navegadores sin transiciones de vista: cortina de color (el tono de la portada de destino)
  var CURTAIN = { aroma: "#F4D6BB", dolce: "#F3CCCB" };
  function switchCurtain(next, pos) {
    if (reduce || !curtain) { swapKeepingPlace(next, pos); return; }
    curtain.style.background = CURTAIN[next];
    curtain.className = "curtain";
    void curtain.offsetWidth; // reinicia la transición
    busy = true;
    curtain.classList.add("is-in");
    window.setTimeout(function () {
      swapKeepingPlace(next, pos);
      curtain.classList.remove("is-in");
      curtain.classList.add("is-out");
      window.setTimeout(function () { curtain.className = "curtain"; busy = false; }, 480);
    }, 470);
  }

  // con "reducir movimiento": fundido corto si el navegador lo permite, si no cambio directo
  function fadeSwap(next, pos) {
    if (!hasViewTransitions()) { swapKeepingPlace(next, pos); return; }
    busy = true;
    var vt;
    try {
      vt = document.startViewTransition(function () { swapKeepingPlace(next, pos); });
    } catch (e) { busy = false; swapKeepingPlace(next, pos); return; }
    vt.finished.catch(function () {}).then(function () { busy = false; });
  }

  // la web nueva se abre como un círculo desde donde se tocó
  function switchCircle(next, trigger) {
    var pos = capturePos();
    if (!hasViewTransitions()) { switchCurtain(next, pos); return; }
    if (reduce) { fadeSwap(next, pos); return; }
    var rect = (trigger || switchBtns[0]).getBoundingClientRect();
    var x = Math.round(rect.left + rect.width / 2), y = Math.round(rect.top + rect.height / 2);
    var radius = Math.ceil(Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)));
    root.style.setProperty("--vt-x", x + "px");
    root.style.setProperty("--vt-y", y + "px");
    busy = true;
    var vt;
    try {
      vt = document.startViewTransition(function () { swapKeepingPlace(next, pos); });
    } catch (e) { busy = false; swapKeepingPlace(next, pos); return; }
    vt.ready.then(function () {
      root.animate(
        { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + radius + "px at " + x + "px " + y + "px)"] },
        { duration: 650, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards", pseudoElement: "::view-transition-new(root)" }
      );
    }).catch(function () {});
    vt.finished.catch(function () {}).then(function () { busy = false; });
  }

  function switchTo(next, trigger) {
    if (next === mode || busy) return;
    switchCircle(next, trigger);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-set-mode]");
    if (btn) switchTo(btn.getAttribute("data-set-mode"), btn);
  });

  /* ---------- 5. Movimiento de la portada: pausa fuera de pantalla y parallax con el mouse ---------- */
  if (heroMotion) {
    // la respiración de la foto se pausa cuando la portada no se ve (o está en la otra web)
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.target.classList.toggle("is-paused", !en.isIntersecting); });
      });
      heroEls.forEach(function (h) { io.observe(h); });
    }

    // parallax con el mouse: solo con puntero fino y pantalla de 900 px o más
    if (window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 900px)").matches) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      var follow = function () {
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        root.style.setProperty("--mx", cx.toFixed(3));
        root.style.setProperty("--my", cy.toFixed(3));
        raf = (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) ? window.requestAnimationFrame(follow) : 0;
      };
      var kick = function () { if (!raf) raf = window.requestAnimationFrame(follow); };
      heroEls.forEach(function (h) {
        h.addEventListener("pointermove", function (e) {
          var r = h.getBoundingClientRect();
          tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
          ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
          kick();
        });
        h.addEventListener("pointerleave", function () { tx = 0; ty = 0; kick(); });
      });
    }
  }

  /* ---------- 6. "Abierto ahora" de Aroma Moka: horario habitual, hora de Montevideo ---------- */
  var openEl = document.querySelector("[data-open]");
  if (openEl) {
    var openText = openEl.querySelector("[data-open-text]");
    var OPEN_DAYS = openEl.getAttribute("data-days").split(",").map(Number); // 0 = domingo
    var FROM = Number(openEl.getAttribute("data-from"));
    var TO = Number(openEl.getAttribute("data-to"));
    var DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    var DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var fmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/Montevideo", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" });

    var openStatus = function () {
      var p = {};
      fmt.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      var day = DOW[p.weekday];
      var minutes = (Number(p.hour) % 24) * 60 + Number(p.minute);
      var today = OPEN_DAYS.indexOf(day) !== -1;
      if (today && minutes >= FROM * 60 && minutes < TO * 60) return { open: true, text: "Abierto ahora · hasta las " + TO + " h" };
      if (today && minutes < FROM * 60) return { open: false, text: "Cerrado ahora · abre hoy a las " + FROM + " h" };
      for (var k = 1; k <= 7; k++) {
        var d = (day + k) % 7;
        if (OPEN_DAYS.indexOf(d) !== -1) return { open: false, text: "Cerrado ahora · abre " + (k === 1 ? "mañana" : "el " + DAY_NAMES[d]) + " a las " + FROM + " h" };
      }
      return null;
    };
    var paintOpen = function () {
      var s;
      try { s = openStatus(); } catch (e) { s = null; } // sin Intl o sin zona horaria: queda oculto
      if (!s) return;
      openEl.hidden = false;
      openEl.classList.toggle("is-open", s.open);
      if (openText.textContent !== s.text) openText.textContent = s.text;
    };
    paintOpen();
    window.setInterval(paintOpen, 60000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) paintOpen(); });
  }

  apply(mode, true);
})();
