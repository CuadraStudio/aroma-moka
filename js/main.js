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

  /* Cortina de siempre (es la que se usa sin parámetro). */
  function switchCurtain(next) {
    if (reduce || !curtain) {
      apply(next);
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    curtain.style.background = FIELD[next];
    curtain.className = "curtain";
    void curtain.offsetWidth; // reinicia la transición
    curtain.classList.add("is-in");
    window.setTimeout(function () {
      apply(next);
      window.scrollTo({ top: 0, behavior: "instant" });
      curtain.classList.remove("is-in");
      curtain.classList.add("is-out");
      window.setTimeout(function () { curtain.className = "curtain"; }, 480);
    }, 470);
  }

  /* ---------- Variantes de transición para comparar ----------
     Solo se activan con ?t=circulo o ?t=mitades en la URL. Sin parámetro no cambia nada.
     Las dos dejan a la persona en el mismo lugar de la otra web (en vez de volver al tope),
     son más cortas (~0,7 s) y con "reducir movimiento" hacen un fundido de 150 ms. */
  var T = null;
  try { T = new URLSearchParams(window.location.search).get("t"); } catch (e) { /* sin soporte */ }
  if (T !== "circulo" && T !== "mitades") T = null;
  if (T) root.setAttribute("data-t", T);
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
  }

  function hasViewTransitions() {
    return typeof document.startViewTransition === "function";
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

  // A · la web nueva se abre como un círculo desde donde se tocó (API de transiciones de vista)
  function switchCircle(next, trigger) {
    if (!hasViewTransitions()) { switchCurtain(next); return; } // sin soporte: cortina de siempre
    var pos = capturePos();
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

  // B · dos mitades (marrón y rosa) se juntan en un "&" y se abren sobre la web nueva
  function switchHalves(next) {
    var pos = capturePos();
    if (reduce) { fadeSwap(next, pos); return; }
    var wrap = document.createElement("div");
    wrap.className = "halves";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = '<span class="halves__l"></span><span class="halves__r"></span><span class="halves__amp">&amp;</span>';
    document.body.appendChild(wrap);
    var L = wrap.querySelector(".halves__l"), R = wrap.querySelector(".halves__r"), A = wrap.querySelector(".halves__amp");
    var inEase = "cubic-bezier(0.7, 0, 0.3, 1)", outEase = "cubic-bezier(0.6, 0, 0.2, 1)";
    var C = "translate(-50%, -50%)";
    busy = true;
    L.animate([{ transform: "translateX(-101%)" }, { transform: "translateX(0)" }], { duration: 280, easing: inEase, fill: "forwards" });
    R.animate([{ transform: "translateX(101%)" }, { transform: "translateX(0)" }], { duration: 280, easing: inEase, fill: "forwards" });
    A.animate([{ opacity: 0, transform: C + " scale(0.5)" }, { opacity: 1, transform: C + " scale(1)" }],
      { duration: 240, delay: 130, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", fill: "forwards" });
    window.setTimeout(function () {
      swapKeepingPlace(next, pos);
      L.animate([{ transform: "translateX(0)" }, { transform: "translateX(-101%)" }], { duration: 340, delay: 30, easing: outEase, fill: "forwards" });
      R.animate([{ transform: "translateX(0)" }, { transform: "translateX(101%)" }], { duration: 340, delay: 30, easing: outEase, fill: "forwards" });
      A.animate([{ opacity: 1, transform: C + " scale(1)" }, { opacity: 0, transform: C + " scale(1.3)" }],
        { duration: 220, easing: "ease-out", fill: "forwards" });
      window.setTimeout(function () { wrap.remove(); busy = false; }, 420);
    }, 330);
  }

  function switchTo(next, trigger) {
    if (next === mode) return;
    if (T && busy) return;
    if (T === "circulo") switchCircle(next, trigger);
    else if (T === "mitades") switchHalves(next);
    else switchCurtain(next);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-set-mode]");
    if (btn) switchTo(btn.getAttribute("data-set-mode"), btn);
  });

  apply(mode, true);
})();
