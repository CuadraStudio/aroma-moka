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

  /* Prueba de carruseles: ?c=carta o ?c=tira en la URL. Sin parámetro quedan las tarjetas apiladas de siempre. */
  var CAROUSEL = null;
  try { CAROUSEL = new URLSearchParams(window.location.search).get("c"); } catch (e) { /* sin soporte */ }
  if (CAROUSEL !== "carta" && CAROUSEL !== "tira") CAROUSEL = null;
  if (CAROUSEL) root.setAttribute("data-c", CAROUSEL);

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

  /* ---------- 3a. Variantes de carrusel para comparar (solo con ?c=carta o ?c=tira) ---------- */
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  // A · selector tipográfico: los nombres van en grande, como una carta; la foto nueva se abre en círculo
  function initCarta(stack, wrap, cards) {
    var n = cards.length, idx = 0, finishNow = null;
    var list = document.createElement("ol");
    list.className = "carta__list";
    cards.forEach(function (card, i) {
      card.removeAttribute("data-pos");
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "carta__item";
      b.innerHTML = '<span class="carta__n"></span><span class="carta__name"></span>';
      b.firstChild.textContent = pad2(i + 1);
      b.lastChild.textContent = card.getAttribute("data-caption");
      b.addEventListener("click", function (e) { show(i, e.clientX); });
      li.appendChild(b);
      list.appendChild(li);
    });
    stack.parentNode.insertBefore(list, stack.nextSibling);
    var items = [].slice.call(list.querySelectorAll(".carta__item"));

    function mark() {
      cards.forEach(function (c, i) {
        c.classList.toggle("is-active", i === idx);
        c.setAttribute("aria-hidden", i === idx ? "false" : "true");
      });
      items.forEach(function (b, i) { b.setAttribute("aria-current", i === idx ? "true" : "false"); });
    }

    function show(next, clientX) {
      if (next === idx) return;
      if (finishNow) finishNow(); // un clic nuevo termina en el acto la animación anterior
      var cur = cards[next];
      idx = next;
      items.forEach(function (b, i) { b.setAttribute("aria-current", i === idx ? "true" : "false"); });
      if (reduce || !cur.animate) { mark(); return; }
      var box = stack.getBoundingClientRect();
      // el círculo se abre desde el borde de la foto más cercano a la lista, a la altura de donde se tocó
      var x = typeof clientX === "number" ? Math.max(0, Math.min(box.width, clientX - box.left)) : box.width / 2;
      var y = box.height;
      var radius = Math.ceil(Math.hypot(Math.max(x, box.width - x), y));
      cur.classList.add("is-entering");
      cur.setAttribute("aria-hidden", "false");
      var anim = cur.animate(
        { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + radius + "px at " + x + "px " + y + "px)"] },
        { duration: 700, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" }
      );
      var img = cur.querySelector("img");
      if (img && img.animate) img.animate({ transform: ["scale(1.14)", "scale(1)"] }, { duration: 1000, easing: "cubic-bezier(0.2, 0.7, 0.1, 1)" });
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
      timer = window.setTimeout(finishNow, 780); // por si la pestaña estaba oculta y no se dispara "onfinish"
    }

    // deslizar sobre la foto y flechas del teclado
    var x0 = null;
    stack.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    stack.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) show((idx + (dx < 0 ? 1 : -1) + n) % n, e.clientX);
    });
    stack.addEventListener("pointercancel", function () { x0 = null; });
    stack.setAttribute("tabindex", "0");
    stack.setAttribute("role", "group");
    stack.setAttribute("aria-label", "Fotos, usá las flechas o elegí un nombre de la lista");
    stack.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); show((idx + 1) % n); }
      if (e.key === "ArrowLeft") { e.preventDefault(); show((idx - 1 + n) % n); }
    });

    mark();
  }

  // B · tira con scroll nativo: se desliza con el dedo, el trackpad o arrastrando con el mouse
  function initTira(stack, wrap, cards) {
    var n = cards.length, last = -1;
    var caption = wrap.querySelector(".stack__caption");
    var count = wrap.querySelector(".stack__count");
    cards.forEach(function (c) {
      c.removeAttribute("data-pos");
      c.setAttribute("aria-hidden", "false");
    });
    var bar = document.createElement("div");
    bar.className = "tira__bar";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = "<span></span>";
    var fill = bar.firstChild;
    fill.style.width = (100 / n) + "%";
    stack.parentNode.insertBefore(bar, stack.nextSibling);

    var cursor = null;
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      cursor = document.createElement("span");
      cursor.className = "tira__cursor";
      cursor.setAttribute("aria-hidden", "true");
      cursor.textContent = "Arrastrar";
      wrap.appendChild(cursor);
      stack.classList.add("has-cursor");
    }

    function maxScroll() { return Math.max(0, stack.scrollWidth - stack.clientWidth); }
    function step() { return n > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : stack.clientWidth; }
    function update() {
      var max = maxScroll(), t = max > 0 ? Math.max(0, Math.min(1, stack.scrollLeft / max)) : 0;
      fill.style.transform = "translateX(" + (t * (n - 1) * 100) + "%)";
      var i = Math.round(t * (n - 1));
      if (i !== last) {
        last = i;
        if (caption) caption.textContent = cards[i].getAttribute("data-caption");
        if (count) count.textContent = pad2(i + 1) + " / " + pad2(n);
      }
    }
    var raf = 0;
    stack.addEventListener("scroll", function () {
      if (!raf) raf = window.requestAnimationFrame(function () { raf = 0; update(); });
    }, { passive: true });
    window.addEventListener("resize", update);

    // arrastrar con el mouse (con el dedo ya desliza el navegador)
    var down = false, sx = 0, sl = 0, dragDx = 0;
    function targets() {
      var max = maxScroll();
      return cards.map(function (c) { return Math.min(max, c.offsetLeft - cards[0].offsetLeft); });
    }
    function nearest(pos) {
      var t = targets(), best = 0, bd = Infinity;
      t.forEach(function (v, i) { var d = Math.abs(v - pos); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    // al soltar: si se arrastró más del 18 % de una foto, pasa a la siguiente (o anterior); si no, vuelve a la de partida
    function snapAfterDrag() {
      var from = nearest(sl), to = from, s = step();
      if (dragDx < -s * 0.18) to = Math.min(n - 1, from + 1);
      else if (dragDx > s * 0.18) to = Math.max(0, from - 1);
      stack.scrollTo({ left: targets()[to], behavior: reduce ? "auto" : "smooth" });
    }
    stack.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; sx = e.clientX; sl = stack.scrollLeft; dragDx = 0;
      stack.classList.add("is-drag");
      try { stack.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
    });
    stack.addEventListener("pointermove", function (e) {
      if (cursor && e.pointerType === "mouse") {
        var r = wrap.getBoundingClientRect();
        cursor.style.transform = "translate(" + (e.clientX - r.left) + "px, " + (e.clientY - r.top) + "px) translate(-50%, -50%)";
      }
      if (down) { dragDx = e.clientX - sx; stack.scrollLeft = sl - dragDx; }
    });
    function end() {
      if (!down) return;
      down = false;
      stack.classList.remove("is-drag");
      snapAfterDrag();
    }
    stack.addEventListener("pointerup", end);
    stack.addEventListener("pointercancel", end);
    if (cursor) {
      stack.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") cursor.classList.add("is-on"); });
      stack.addEventListener("pointerleave", function () { cursor.classList.remove("is-on"); });
    }

    stack.setAttribute("tabindex", "0");
    stack.setAttribute("role", "group");
    stack.setAttribute("aria-label", "Fotos, deslizá o usá las flechas del teclado");
    stack.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); stack.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }); }
      if (e.key === "ArrowLeft") { e.preventDefault(); stack.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }); }
    });

    update();
  }

  /* ---------- 3. Pilas de fotos (tarjetas apiladas) ---------- */
  [].forEach.call(document.querySelectorAll("[data-stack]"), function (stack) {
    var wrap = stack.closest(".stack-wrap");
    var cards = [].slice.call(stack.querySelectorAll(".stack__card"));
    var caption = wrap.querySelector(".stack__caption");
    var count = wrap.querySelector(".stack__count");
    var n = cards.length;
    var idx = 0;

    if (CAROUSEL === "carta") { initCarta(stack, wrap, cards); return; }
    if (CAROUSEL === "tira") { initTira(stack, wrap, cards); return; }

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

  apply(mode, true);
})();
