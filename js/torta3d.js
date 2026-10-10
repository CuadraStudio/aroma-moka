/* Torta 3D de Dolce Shop (prueba, solo con ?torta=3d).
   La foto real es lo primero: la torta arranca en la pose exacta de la foto y se balancea unos ±30° alrededor
   de ese ángulo (nunca muestra la parte de atrás, que el modelo inventa), con paralaje suave del scroll y del
   puntero. Se puede arrastrar para girarla; después vuelve sola al ángulo de la foto.
   Lo carga main.js cuando la sección se acerca; si algo falla (sin WebGL, sin red) queda la foto.
   Three.js viene de vendor/ (sin CDN). */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const MODEL_URL = "models/torta-dolce.glb";
// pose de la foto (ajustada por silueta: IoU 0,978) y encuadre para un cuadro de 900×945
const POSE = { spin: -1.3, el: 45, fov: 26, dist: 2.5272, target: [-0.006, 0.4244, 0.0756] };
const ASPECT = 900 / 945;
const SWAY = { amp: 0.52, period: 18 };   // ±30°, una ida y vuelta cada 18 s (velocidad máxima ~0,18 rad/s)

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wrap = (a) => ((a + Math.PI) % TAU + TAU) % TAU - Math.PI;

export function init(host, opts = {}) {
  const reduce = !!opts.reduce;
  const stage = host.querySelector("[data-stage]");
  const canvas = host.querySelector("[data-canvas]");

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    return null; // sin WebGL: queda la foto
  }
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(POSE.fov, ASPECT, 0.05, 50);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffe9d6, 0.86);
  key.position.set(-2.4, 3.6, 3.2);
  const rim = new THREE.DirectionalLight(0xffe4ee, 0.4);
  rim.position.set(3, 2.2, -3);
  scene.add(key, rim, new THREE.HemisphereLight(0xfff6ee, 0xf4c3cc, 0.43));

  let bodyMat = null;
  renderer.debug.onShaderError = () => {
    if (bodyMat && bodyMat.onBeforeCompile) {
      bodyMat.onBeforeCompile = () => {};
      bodyMat.customProgramCacheKey = () => "simple";
      bodyMat.emissiveMap = null; bodyMat.emissive.set(0x000000);
      bodyMat.needsUpdate = true;
    } else {
      stage.classList.remove("is-live");
      stop();
    }
  };

  const pivot = new THREE.Group(); // el origen del modelo está en el centro de su base: gira sobre su eje
  scene.add(pivot);

  // ----- estado de movimiento -----
  let phase = 0;                 // fase del balanceo (segundos de balanceo acumulados)
  let swayW = 0;                 // peso del balanceo: 0 mientras se arrastra, sube solo; entra suave al inicio
  let user = 0;                  // giro que puso la persona al arrastrar (vuelve solo a 0)
  let userVel = 0, idleFor = 0;
  let paused = false, dragging = false;
  const par = { x: 0, y: 0 }, parGoal = { x: 0, y: 0 };
  let sp = 0, sp0 = null, running = false, raf = 0, last = 0, loaded = false, visible = true;

  function resize() {
    renderer.setSize(Math.max(1, stage.clientWidth), Math.max(1, stage.clientHeight), false);
  }
  function place(elOffset) {
    const el = THREE.MathUtils.degToRad(POSE.el) + elOffset;
    const t = POSE.target;
    camera.position.set(t[0], t[1] + POSE.dist * Math.sin(el), t[2] + POSE.dist * Math.cos(el));
    camera.lookAt(t[0], t[1], t[2]);
  }

  function frame(dt) {
    // balanceo
    if (!reduce && !paused) phase += dt;
    const swayTarget = reduce || dragging ? 0 : 1;
    swayW += (swayTarget - swayW) * (1 - Math.exp(-(dragging ? 6 : 0.9) * dt));
    const sway = reduce ? 0 : SWAY.amp * swayW * Math.sin((phase / SWAY.period) * TAU);

    // giro de la persona: inercia al soltar y regreso suave al ángulo de la foto
    if (!dragging) {
      user += userVel * dt;
      userVel *= Math.exp(-2.6 * dt);
      idleFor += dt;
      if (!reduce && idleFor > 2.2 && Math.abs(userVel) < 0.05) {
        user = wrap(user);
        user += (0 - user) * (1 - Math.exp(-dt / 1.6));
      }
    }

    // paralaje: puntero (suavizado) y scroll (capas del escenario y un poco de giro)
    const pa = 1 - Math.exp(-2.6 * dt);
    par.x += (parGoal.x - par.x) * pa;
    par.y += (parGoal.y - par.y) * pa;
    let scrollTurn = 0;
    if (!reduce) {
      const r = stage.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      sp = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      stage.style.setProperty("--sp", sp.toFixed(3));
      stage.style.setProperty("--mx", par.x.toFixed(3));
      stage.style.setProperty("--my", par.y.toFixed(3));
      if (sp0 === null) sp0 = sp;
      scrollTurn = (sp - sp0) * 0.28;
    }

    pivot.rotation.y = POSE.spin + sway + user + par.x * 0.16 + scrollTurn;
    place(-par.y * 0.05);
    renderer.render(scene, camera);
  }

  function tick(now) {
    raf = 0;
    if (!running) return;
    frame(clamp((now - last) / 1000, 0, 0.05));
    last = now;
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (running || !loaded) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  // ----- pausa: un toque o Enter/Espacio (sin botones a la vista) -----
  function setPaused(p) {
    paused = p;
    canvas.setAttribute("aria-pressed", String(paused));
  }

  // ----- arrastrar para girar (con inercia); un toque sin arrastrar pausa o reanuda -----
  let sx = 0, lastX = 0, lastT = 0, tap = false;
  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    sx = lastX = e.clientX; lastT = e.timeStamp; userVel = 0; tap = true;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!canvas.hasPointerCapture(e.pointerId)) return;
    if (!dragging && Math.abs(e.clientX - sx) > 5) { dragging = true; tap = false; stage.classList.add("is-drag"); }
    if (!dragging) return;
    const dx = e.clientX - lastX, dtm = Math.max(1, e.timeStamp - lastT) / 1000;
    user += dx * 0.009;
    userVel = clamp((dx * 0.009) / dtm, -4, 4) * 0.6 + userVel * 0.4;
    lastX = e.clientX; lastT = e.timeStamp;
  });
  canvas.addEventListener("pointerup", () => {
    if (dragging) { dragging = false; idleFor = 0; if (reduce) userVel = 0; stage.classList.remove("is-drag"); }
    else if (tap) setPaused(!paused);
    tap = false;
  });
  canvas.addEventListener("pointercancel", () => {
    dragging = false; tap = false; idleFor = 0; stage.classList.remove("is-drag");
  });
  canvas.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPaused(!paused); }
  });

  // ----- paralaje con el puntero: solo mouse o lápiz, nunca con "reducir movimiento" -----
  if (!reduce) {
    host.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const r = stage.getBoundingClientRect();
      parGoal.x = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
      parGoal.y = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
    });
    host.addEventListener("pointerleave", () => { parGoal.x = 0; parGoal.y = 0; });
  }

  // ----- solo se dibuja cuando se ve la torta y la pestaña está activa -----
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      visible && !document.hidden ? start() : stop();
    }, { rootMargin: "80px" }).observe(stage);
  }
  document.addEventListener("visibilitychange", () => (visible && !document.hidden ? start() : stop()));
  if ("ResizeObserver" in window) new ResizeObserver(() => { resize(); if (!running && loaded) { place(0); renderer.render(scene, camera); } }).observe(stage);

  // ----- carga del modelo -----
  resize();
  new GLTFLoader().load(MODEL_URL, (gltf) => {
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return;
      const m = o.material;
      bodyMat = m;
      // la textura también emite: conserva el color y la luz de la foto y queda poca luz encima para dar volumen
      m.emissive = new THREE.Color(0xffffff);
      m.emissiveMap = m.map;
      m.emissiveIntensity = 0.47;
      m.envMapIntensity = 0.45;
      // la base blanca salió con vetas grises tipo mármol (artefacto de la generación; en la foto es lisa):
      // se aclara por altura, sin tocar el archivo del modelo
      m.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nvarying float vLocalY;")
          .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocalY = position.y;");
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", "#include <common>\nvarying float vLocalY;")
          .replace("#include <map_fragment>", "#include <map_fragment>\nfloat boardMask = 1.0 - smoothstep(0.034, 0.046, vLocalY);\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.72, 0.72, 0.74), boardMask * 0.9);")
          .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance = mix(totalEmissiveRadiance, vec3(0.72, 0.72, 0.74) * emissive, boardMask * 0.9);");
      };
      for (const k of ["map", "normalMap", "metalnessMap", "roughnessMap"]) if (m[k]) m[k].anisotropy = maxAniso;
    });
    pivot.add(gltf.scene);
    loaded = true;
    pivot.rotation.y = POSE.spin;
    place(0);
    renderer.render(scene, camera);
    stage.classList.add("is-live");
    if (visible && !document.hidden) start();
  }, undefined, () => { /* sin modelo: queda la foto */ });

  // controlador para pruebas
  return {
    state: () => ({ phase, swayW, user, userVel, paused, dragging, running, loaded, spin: pivot.rotation.y }),
    setPhase(s) { phase = s; },
    renderAt(spin) { pivot.rotation.y = spin; place(0); renderer.render(scene, camera); },
  };
}
