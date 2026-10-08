/* ==========================================================================
   Aroma Moka & Dolce Shop · v7.0
   - El motor de Cuadra pone los reveals y la deriva de los carriles.
   - Todo lo de acá es del sitio: interruptor de modo, "foto que crece",
     cierre que se junta, línea central, barra de progreso y pilas de fotos.
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
        card.setAttribute("data-pos", String((i - idx + n) % n));
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

  function switchTo(next) {
    if (next === mode) return;
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

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-set-mode]");
    if (btn) switchTo(btn.getAttribute("data-set-mode"));
  });

  apply(mode, true);
})();
