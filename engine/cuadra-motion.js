/* ==========================================================================
   Cuadra Motion Engine v1.0
   Motor compartido de movimiento. NUNCA se edita por cliente — si un sitio
   necesita algo que esta version no resuelve, se mejora este archivo para
   TODOS (y se revisan los clientes activos antes de actualizar su
   <script src>), no se bifurca por proyecto.

   Que resuelve: reveal al scrollear, parallax, pin de scroll con progreso
   0-1, galeria horizontal fijada — y el gate de prefers-reduced-motion para
   las cuatro, para que nadie tenga que acordarse de escribirlo a mano.

   Que NO resuelve (a proposito): el motor no sabe que es un corazon de latte
   art, una zapatilla o un producto. Solo entrega progreso de scroll; que se
   hace con ese progreso es siempre codigo bespoke del cliente (ver
   plantillas/06-Implementacion-claude-code.prompt y README.md de esta carpeta).

   API: ver engine/README.md
   ========================================================================== */
(function (global) {
  "use strict";

  function reduceMotion() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function clamp01(n) {
    return Math.min(1, Math.max(0, n));
  }

  // Throttle a un callback por requestAnimationFrame — evita apilar trabajo
  // si el navegador dispara mas eventos de scroll de los que puede pintar.
  function rafThrottle(fn) {
    let ticking = false;
    return () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn();
        ticking = false;
      });
    };
  }

  /* ---------------------------------------------------------------------
   * Reveal — fade + translateY al entrar en pantalla.
   * HTML: data-reveal  |  data-reveal="stagger" data-reveal-delay="90"
   * CSS necesaria: ver cuadra-motion.css ([data-reveal] + .cm-revealed)
   * ------------------------------------------------------------------- */
  function initReveals(root) {
    root = root || document;
    const els = root.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    if (reduceMotion()) {
      els.forEach((el) => el.classList.add("cm-revealed"));
      return;
    }

    let staggerIndex = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.dataset.reveal === "stagger") {
            const step = Number(el.dataset.revealDelay || 90);
            el.style.transitionDelay = `${step * staggerIndex++}ms`;
          }
          el.classList.add("cm-revealed");
          observer.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------------------
   * Parallax — traslada en Y segun la distancia al centro del viewport.
   * HTML: data-parallax data-parallax-speed="0.08" (+ acerca, - aleja/invierte)
   * ------------------------------------------------------------------- */
  function initParallax(root) {
    root = root || document;
    if (reduceMotion()) return;
    const els = Array.from(root.querySelectorAll("[data-parallax]"));
    if (!els.length) return;

    const apply = () => {
      const vh = window.innerHeight;
      els.forEach((el) => {
        const speed = parseFloat(el.dataset.parallaxSpeed || "0.1");
        const rect = el.getBoundingClientRect();
        const centerDelta = rect.top + rect.height / 2 - vh / 2;
        el.style.transform = `translateY(${(-centerDelta * speed).toFixed(1)}px)`;
      });
    };
    window.addEventListener("scroll", rafThrottle(apply), { passive: true });
    window.addEventListener("resize", rafThrottle(apply));
    apply();
  }

  /* ---------------------------------------------------------------------
   * Pin — fija `container` en pantalla (requiere position:sticky;top:0 en
   * CSS, con el alto del tramo definido por el propio contenedor — ver
   * README) y reporta el progreso 0-1 del tramo en cada frame, en los dos
   * sentidos. Que se anima con ese progreso lo decide quien llama a pin().
   *
   * onUpdate(progress) — se llama en cada frame de scroll, progress 0-1
   * onReducedMotion()  — se llama UNA vez en vez de pinear, para que el
   *                       caller deje el elemento en su estado final
   * ------------------------------------------------------------------- */
  function pin(container, opts) {
    opts = opts || {};
    if (!container) return null;

    if (reduceMotion()) {
      if (opts.onReducedMotion) opts.onReducedMotion();
      return null;
    }

    const update = () => {
      const rect = container.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? clamp01(-rect.top / total) : 0;
      container.style.setProperty("--cm-progress", progress.toFixed(4));
      if (opts.onUpdate) opts.onUpdate(progress);
    };

    update();
    const onScroll = rafThrottle(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return {
      update,
      destroy() {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      },
    };
  }

  /* ---------------------------------------------------------------------
   * Galeria horizontal fijada — `stage` se ancla en pantalla mientras
   * `track` (la fila de tarjetas adentro) se traslada en horizontal, en
   * proporcion directa al scroll vertical consumido. La altura exacta del
   * stage la calcula el motor segun el ancho real del contenido — se
   * recalcula solo en resize, nadie tiene que medirlo a mano por cliente.
   *
   * HTML minimo:
   *   <div id="stage"><div id="track">...tarjetas...</div></div>
   * CSS minima: stage > position:relative; un hijo con position:sticky;
   *   top:0;overflow:hidden envolviendo a track (ver README para el ejemplo
   *   completo en patrones/galeria-horizontal-fijada/).
   * ------------------------------------------------------------------- */
  function horizontalGallery(stage, track, opts) {
    opts = opts || {};
    if (!stage || !track) return null;
    if (reduceMotion()) return null;

    let maxTranslate = 0;

    const measure = () => {
      maxTranslate = Math.max(0, track.scrollWidth - stage.clientWidth);
      stage.style.height = `${window.innerHeight + maxTranslate}px`;
    };

    const update = () => {
      const rect = stage.getBoundingClientRect();
      const total = stage.offsetHeight - window.innerHeight;
      const progress = total > 0 ? clamp01(-rect.top / total) : 0;
      track.style.transform = `translateX(${(-progress * maxTranslate).toFixed(1)}px)`;
      stage.style.setProperty("--cm-progress", progress.toFixed(4));
      if (opts.onUpdate) opts.onUpdate(progress);
    };

    measure();
    update();
    const onScroll = rafThrottle(update);
    const onResize = rafThrottle(() => {
      measure();
      update();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return {
      update,
      measure,
      destroy() {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
      },
    };
  }

  /* ---------------------------------------------------------------------
   * init — arranca lo declarativo (reveal + parallax). El pin y la galeria
   * horizontal siempre se llaman a mano desde el main.js de cada cliente,
   * porque el momento de firma es bespoke por definicion (ver README §3).
   * ------------------------------------------------------------------- */
  function init(opts) {
    opts = opts || {};
    initReveals(opts.root);
    initParallax(opts.root);
  }

  global.CuadraMotion = {
    init: init,
    initReveals: initReveals,
    initParallax: initParallax,
    pin: pin,
    horizontalGallery: horizontalGallery,
    reduceMotion: reduceMotion,
  };
})(window);
