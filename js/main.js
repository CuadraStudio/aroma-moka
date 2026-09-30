(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
   * Loader de marca: isologo breve antes de abrir la pagina.
   * Se saca solo (clase is-hidden) al primero entre "load" o un minimo,
   * asi nunca tapa la pagina mas de la cuenta si algo tarda.
   * ------------------------------------------------------------------- */
  const loader = document.getElementById("brandLoader");
  if (loader) {
    if (reduceMotion) {
      loader.classList.add("is-hidden");
    } else {
      const MIN_MS = 900;
      const MAX_MS = 2200;
      let hidden = false;
      const hide = () => {
        if (hidden) return;
        hidden = true;
        loader.classList.add("is-hidden");
        loader.addEventListener("transitionend", () => loader.remove(), { once: true });
      };
      const start = Date.now();
      window.addEventListener(
        "load",
        () => setTimeout(hide, Math.max(0, MIN_MS - (Date.now() - start))),
        { once: true }
      );
      setTimeout(hide, MAX_MS); // nunca deja la pagina tapada si "load" no llega
    }
  }

  /* ---------------------------------------------------------------------
   * Goteo: los bordes con clip-path de gota se estiran un toque al entrar
   * ------------------------------------------------------------------- */
  if (!reduceMotion) {
    const dripEls = document.querySelectorAll(".wavy-top");
    if (dripEls.length) {
      const dripObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("drip-stretch");
            setTimeout(() => entry.target.classList.remove("drip-stretch"), 550);
            dripObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.15 }
      );
      dripEls.forEach((el) => dripObserver.observe(el));
    }
  }

  /* ---------------------------------------------------------------------
   * Corazon que se dibuja: eco del latte art real, una sola vez
   * ------------------------------------------------------------------- */
  const heartDraw = document.getElementById("heartDraw");
  if (heartDraw) {
    const heartPath = heartDraw.querySelector(".heart-draw__path");
    if (heartPath && heartPath.getTotalLength) {
      const len = Math.ceil(heartPath.getTotalLength());
      heartPath.style.strokeDasharray = String(len);
      heartPath.style.strokeDashoffset = reduceMotion ? "0" : String(len);
    }
    if (reduceMotion) {
      heartDraw.classList.add("in-view");
    } else {
      const heartObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              heartDraw.classList.add("in-view");
              // el offset se fijo inline arriba (mayor especificidad que la regla de clase) -
              // hay que resetearlo por JS tambien, si no la regla .in-view nunca gana
              if (heartPath) heartPath.style.strokeDashoffset = "0";
              heartObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      heartObserver.observe(heartDraw);
    }
  }

  /* ---------------------------------------------------------------------
   * Nav: sombra al scrollear + link activo por sección + menú mobile
   * ------------------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navMobile = document.getElementById("navMobile");
  const navClose = document.getElementById("navClose");

  function openMobileNav() {
    navMobile.classList.add("is-open");
    navMobile.setAttribute("aria-hidden", "false");
    navToggle.setAttribute("aria-expanded", "true");
  }
  function closeMobileNav() {
    navMobile.classList.remove("is-open");
    navMobile.setAttribute("aria-hidden", "true");
    navToggle.setAttribute("aria-expanded", "false");
  }
  navToggle?.addEventListener("click", openMobileNav);
  navClose?.addEventListener("click", closeMobileNav);
  navMobile?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMobileNav));

  const navLinks = document.querySelectorAll(".nav__links a");
  const navSections = ["lugar", "clasicos", "pasteleria"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (navSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    navSections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------------------------------------------------------------------
   * Pill de WhatsApp fija: aparece después del hero
   * ------------------------------------------------------------------- */
  const whatsappPill = document.getElementById("whatsappPill");
  const heroSection = document.querySelector(".hero");
  if (whatsappPill && heroSection) {
    const pillObserver = new IntersectionObserver(
      ([entry]) => whatsappPill.classList.toggle("is-visible", !entry.isIntersecting),
      { threshold: 0 }
    );
    pillObserver.observe(heroSection);
  }

  /* ---------------------------------------------------------------------
   * Parallax de una capa — fotos de producto se mueven más lento
   * ------------------------------------------------------------------- */
  if (!reduceMotion) {
    const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));
    if (parallaxEls.length) {
      let ticking = false;
      const applyParallax = () => {
        ticking = false;
        const vh = window.innerHeight;
        parallaxEls.forEach((el) => {
          const speed = parseFloat(el.dataset.parallaxSpeed || "0.1");
          const rect = el.getBoundingClientRect();
          const centerDelta = rect.top + rect.height / 2 - vh / 2;
          el.style.transform = `translateY(${(-centerDelta * speed).toFixed(1)}px)`;
        });
      };
      window.addEventListener(
        "scroll",
        () => {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(applyParallax);
          }
        },
        { passive: true }
      );
      applyParallax();
    }
  }

  /* ---------------------------------------------------------------------
   * Racimo de pastelería: revelación apilada al hacer scroll
   * ------------------------------------------------------------------- */
  const stackItems = document.querySelectorAll(".stack-item");
  stackItems.forEach((item, i) => {
    item.style.transitionDelay = `${(i % 5) * 90}ms`;
  });

  if (stackItems.length) {
    if (reduceMotion) {
      stackItems.forEach((item) => item.classList.add("in-view"));
    } else {
      const stackObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              stackObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      stackItems.forEach((item) => stackObserver.observe(item));
    }
  }

  /* ---------------------------------------------------------------------
   * Vitrina horizontal del surtido: soporte de teclado
   * ------------------------------------------------------------------- */
  const surtidoTrack = document.getElementById("surtidoTrack");
  surtidoTrack?.addEventListener("keydown", (e) => {
    const card = surtidoTrack.querySelector(".surtido__card");
    const step = card ? card.getBoundingClientRect().width + 20 : 300;
    if (e.key === "ArrowRight") {
      surtidoTrack.scrollBy({ left: step, behavior: "smooth" });
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      surtidoTrack.scrollBy({ left: -step, behavior: "smooth" });
      e.preventDefault();
    }
  });
})();
