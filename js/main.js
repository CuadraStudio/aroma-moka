(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
        { threshold: 0.25 }
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
