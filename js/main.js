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

  /* Prueba de movimiento "vivo" en la portada: solo con ?m=vivo en la URL. Sin parámetro no cambia nada. */
  var VIVO = false;
  try { VIVO = new URLSearchParams(window.location.search).get("m") === "vivo"; } catch (e) { /* sin soporte */ }
  VIVO = VIVO && !reduce;
  if (VIVO) root.setAttribute("data-m", "vivo");
  var heroEls = [].slice.call(document.querySelectorAll(".hero--cover"));

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
    if (VIVO) {
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

  /* ---------- 3. Pilas de fotos (tarjetas apiladas) ---------- */
  [].forEach.call(document.querySelectorAll("[data-stack]"), function (stack) {
    var wrap = stack.closest(".stack-wrap");
    var cards = [].slice.call(stack.querySelectorAll(".stack__card"));
    var caption = wrap.querySelector(".stack__caption");
    var count = wrap.querySelector(".stack__count");
    var n = cards.length;
    var idx = 0;

    function render() {
      cards.forEach(function (card, i) {
        var pos = (i - idx + n) % n;
        card.setAttribute("data-pos", String(pos));
        card.setAttribute("aria-hidden", pos === 0 ? "false" : "true");
      });
      caption.textContent = cards[idx].getAttribute("data-caption");
      count.textContent = idx + 1 + " / " + n;
    }

    function go(dir) {
      idx = (idx + dir + n) % n;
      render();
    }

    [].forEach.call(wrap.querySelectorAll("[data-dir]"), function (btn) {
      btn.addEventListener("click", function () {
        go(parseInt(btn.getAttribute("data-dir"), 10));
      });
    });

    // deslizar con el dedo o el mouse
    var x0 = null;
    stack.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    stack.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    });
    stack.addEventListener("pointercancel", function () { x0 = null; });

    // teclado: flechas con la pila enfocada
    stack.setAttribute("tabindex", "0");
    stack.setAttribute("role", "group");
    stack.setAttribute("aria-label", "Fotos, usá las flechas para cambiar");
    stack.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });

    render();
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

  /* ---------- 5. Movimiento "vivo" de la portada (solo con ?m=vivo) ---------- */
  if (VIVO) {
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

  apply(mode, true);
})();
