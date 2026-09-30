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
    const dripEls = document.querySelectorAll(".wavy-top, .arch-top");
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
   * Momento de firma: la foto del gesto queda fija (css) mientras el
   * corazon se dibuja en proporcion directa al scroll dentro del stage.
   * No es un disparo unico al entrar en pantalla: responde todo el tiempo,
   * en los dos sentidos, mientras dura el "pin".
   * ------------------------------------------------------------------- */
  const cafeStage = document.getElementById("cafeStage");
  const heartPath = document.querySelector("#heartDraw .heart-draw__path");
  if (heartPath && heartPath.getTotalLength) {
    const heartLen = Math.ceil(heartPath.getTotalLength());
    heartPath.style.strokeDasharray = String(heartLen);
    if (reduceMotion || !cafeStage) {
      heartPath.style.strokeDashoffset = "0";
    } else {
      const updateHeart = () => {
        const rect = cafeStage.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        heartPath.style.strokeDashoffset = String(heartLen * (1 - progress));
      };
      updateHeart();
      let heartTicking = false;
      window.addEventListener(
        "scroll",
        () => {
          if (!heartTicking) {
            heartTicking = true;
            requestAnimationFrame(() => {
              updateHeart();
              heartTicking = false;
            });
          }
        },
        { passive: true }
      );
      window.addEventListener("resize", updateHeart);
    }
  }

  /* ---------------------------------------------------------------------
   * Galeria fijada: racimo + surtido recorridos en horizontal mientras la
   * pagina sigue bajando en vertical — segundo momento de firma de "La mesa"
   * ------------------------------------------------------------------- */
  const galleryStage = document.getElementById("mesaGalleryStage");
  const galleryTrack = document.getElementById("mesaGalleryTrack");
  const galleryBar = document.getElementById("mesaGalleryBar");
  if (galleryStage && galleryTrack && !reduceMotion) {
    let maxTranslate = 0;
    const measureGallery = () => {
      maxTranslate = Math.max(0, galleryTrack.scrollWidth - galleryStage.clientWidth);
      galleryStage.style.height = `${window.innerHeight + maxTranslate}px`;
    };
    const updateGallery = () => {
      const rect = galleryStage.getBoundingClientRect();
      const total = galleryStage.offsetHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      galleryTrack.style.transform = `translateX(${-progress * maxTranslate}px)`;
      if (galleryBar) galleryBar.style.width = `${progress * 100}%`;
    };
    measureGallery();
    updateGallery();
    let galleryTicking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!galleryTicking) {
          galleryTicking = true;
          requestAnimationFrame(() => {
            updateGallery();
            galleryTicking = false;
          });
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", () => {
      measureGallery();
      updateGallery();
    });
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

  const navLinks = document.querySelectorAll(".nav-mobile a");
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

})();
