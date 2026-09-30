# aroma-moka — IMPLEMENTACION.md

Este sitio no se construyó desde cero en esta pasada — ya existía en `sites/aroma-moka/` desde antes del workflow formal. Este documento cubre lo que cambió al formalizarlo en `clientes/aroma-moka/site/`.

## Cómo abrir o servir el sitio

```
python -m http.server 3021 --directory clientes/aroma-moka/site
```

## Qué se hizo en esta pasada (2026-09-30)

1. **Migración:** contenido copiado de `sites/aroma-moka/` a `clientes/aroma-moka/site/`, con su propio historial de git desde acá en adelante. `sites/aroma-moka/` queda como el original pre-workflow — no se borró, ver nota abajo.
2. **Corrección de datos falsos:** el sitio tenía un WhatsApp inventado (`59800000000`) y un link de Instagram genérico (`instagram.com`). Se reemplazaron por los reales, verificados en Google Maps e Instagram el 2026-09-30: WhatsApp `59895741364`, Instagram [@aroma.moka](https://www.instagram.com/aroma.moka/). 4 lugares corregidos (botón "Escribinos por WhatsApp", ícono de Instagram del footer, ícono de WhatsApp del footer, píldora fija "Pedir").
3. **CSS reescrito mobile-first:** antes era desktop-first (`max-width` en 8 breakpoints). Ahora las reglas base (sin media query) son el layout móvil, y todo lo que escala hacia arriba vive en una sección final de `min-width` (561, 641, 781, 901, 981, 1080px — mismos breakpoints que antes, invertidos). Verificado en 375, 1030 y 1400px sin scroll horizontal, sin errores de consola, sin regresiones visuales en desktop.
4. **DESIGN.md migrado** a `clientes/aroma-moka/DESIGN.md`, reformateado a la plantilla de 13 secciones — el concepto ("Se sirve con corazón") no cambió, se sumó evidencia nueva (terraza exterior, personalización con galletas) que lo refuerza.

## No se tocó en esta pasada

- El JS (`js/main.js`) — reveal del corazón de latte art, parallax, scroll-snap del surtido — sigue siendo el mismo, no tenía nada desktop-first que corregir.
- El texto "Horario: Consultanos por WhatsApp" — ya hay un horario real verificado (Martes a Sábado, 9 a 20h) pero no se pidió corregirlo, queda señalado en DESIGN.md §12.
- "Estacionamiento: Gratuito" — no se verificó, queda señalado en DESIGN.md §12.

## v2.0 (2026-09-30) — integración de Dolce Shop

DESIGN.md pasó a v2.0 porque el cliente no aprobó v1.0 ("el diseño sigue siendo el mismo") y confirmó que Dolce Shop (tortas/cookies personalizadas) es la misma familia/negocio. Cambios en el sitio:

- 2 fotos reales nuevas de Dolce Shop (torta "Oli", cookies navideñas) reemplazan 2 piezas del racimo de "La mesa" (`dolce_torta_oli`, `dolce_cookies_navidad` en `img/`, WebP+JPG). Llevan un borde coral sutil (`.dolce-piece`) — integradas en el mismo racimo, no en sección aparte.
- Sección "Personalización": se agrega mención a Dolce Shop (por marca, no por nombre personal — pedido explícito del cliente) y un botón "Encargá tu torta" al WhatsApp de Dolce Shop.
- Sección "Cierre": pasa de una CTA a dos, lado a lado — "Pedí — café y vitrina" (Aroma Moka, 095 741 364) y "Encargá — Dolce Shop" (093 329 614) — mismo peso visual, ninguna es la principal.
- Nuevos tokens de color `--menta-dolce` / `--coral-dolce`, usados únicamente en el botón/CTA de Dolce Shop y el borde de sus piezas en el racimo — la paleta base de Aroma Moka (rosa/crema) no cambia.
- Verificado en 375 y 800px: sin errores de consola, imágenes cargando (200 OK), CTAs apiladas correctamente en mobile.

## v3.0 (2026-09-30) — lenguaje visual más seguro (referencia del cliente)

El cliente trajo una referencia externa ([triozen-tech/day-3-melt](https://github.com/triozen-tech/day-3-melt), un sitio-demo ficticio con fotos generadas por IA) pidiendo "algo así". Se tomó el lenguaje visual/estructural, nunca sus fotos ni su motor (Next.js, cursor personalizado, video scroll-driven — ninguno es parte del stack de Cuadra). Cambios:

- **Loader de marca:** `#brandLoader`, isologo real (`isotipo.jpg/webp` — el de las letras "AM" con la tacita, no el sello circular que describía DESIGN.md; es el único isologo suelto que existe como archivo limpio) sobre crema, pulso breve, se retira solo (mínimo ~900ms, máximo 2.2s aunque `load` no llegue nunca). `prefers-reduced-motion`: no se muestra.
- **Goteo marcado:** se rediseñaron los `clipPath` `waveTop`/`waveBottom` con más oscilaciones y más amplitud (de ~0.05-0.1 a ~0.1-0.2 de la altura). Se sumó `wavy-top` a `.mesa` y `.personal` (antes solo estaba en `.clasicos` y el footer) para reforzar el corte entre "El gesto" y "La mesa". Estiramiento leve al entrar en viewport vía clase `.drip-stretch` (`scaleY`, 550ms, se retira sola).
- **Tipografía mayor:** `.hero__title` de `clamp(2.6rem,...,4.4rem)` a `clamp(3.2rem,...,6rem)`; `--fs-h2` de `clamp(2rem,...,3.4rem)` a `clamp(2.3rem,...,4rem)`.
- **Corazón que se dibuja:** nuevo SVG `#heartDraw` en `.cafe__hero` (esquina inferior derecha de la foto de la taza), trazo animado con `stroke-dasharray`/`getTotalLength()`, disparado por `IntersectionObserver`. **No existía en ninguna versión anterior** — DESIGN.md lo describía desde v1.0 pero nunca se había implementado; se construyó recién ahora.
- **Un solo color de acción:** se sacó `--coral-dolce` de los botones "Encargá" (ambos vuelven a la paleta rosa/marrón — `btn-pill--on-rosa` y `btn-pill--outline`). Menta/coral quedan solo en el borde de las piezas de Dolce Shop en el racimo (`.dolce-piece`), nunca en botones.

**Bug real encontrado y corregido en esta pasada:** el corazón no se dibujaba — el JS fijaba `stroke-dashoffset` inline (mayor especificidad que la regla CSS `.in-view`), así que la clase se agregaba bien pero el offset nunca volvía a 0 visualmente. Se corrigió reseteando el offset por JS también, no solo por clase.

Verificado en 375 y 800px: sin errores de consola, sin scroll horizontal, loader se retira solo y se elimina del DOM, corazón se dibuja al entrar en viewport (confirmado con `getComputedStyle`, no solo visualmente), botones "Pedí"/"Encargá" ambos en paleta rosa/marrón.

## v4.0 (2026-09-30) — estructura, no solo piel

El cliente marcó, con razón, que v3.0 seguía siendo la misma estructura de siempre con lenguaje visual nuevo encima: todas las escenas tenían la misma mecánica ("contenedor → intro + grilla 2 columnas → borde ondulado"), solo cambiaban las fotos. v4.0 cambia la mecánica de dos escenas de verdad, no el estilo:

- **El gesto (café) → momento de firma a pantalla completa.** Se reemplazó `.cafe__layout` (grilla 2 columnas, foto 1:1 chica) por `.cafe__stage` / `.cafe__pin`: un contenedor alto (`220vh`) con la foto en `position: sticky` a pantalla completa. El corazón (`#heartDraw`) ya no usa `IntersectionObserver` — un listener de scroll (`requestAnimationFrame`-throttled) calcula el progreso 0–1 del tramo fijado y lo aplica directo a `stroke-dashoffset`. Responde en los dos sentidos: subís y el trazo retrocede. Las fotos satélite y la nota bajaron, en flujo normal, debajo del stage.
- **La mesa → galería horizontal fijada.** `.racimo` (grilla asimétrica 12 columnas con reveal por `IntersectionObserver`) y `.surtido` (scroll-snap libre) se fusionaron en `.mesa__gallery-stage`: 10 tarjetas (las 5 del racimo + las 5 del surtido, incluidas las 2 de Dolce Shop) en una sola pista. La sección se ancla (`sticky`) y un `translateX` calculado en JS mueve la pista en horizontal en proporción directa al scroll vertical consumido. La altura exacta del stage la calcula JS (`scrollWidth` real de la pista menos el ancho visible), no un valor fijo — se recalcula en `resize`. Una barra fina (`#mesaGalleryBar`) marca el progreso.
- **Personalización cambia de onda a arco.** Nuevo `clipPath` `#archTop`, misma mecánica de estiramiento al entrar en pantalla que `wavy-top`, forma distinta — para que dos secciones seguidas no usen el mismo corte.

Las dos mecánicas nuevas se verificaron con scroll programático (no solo visualmente): el trazo del corazón y el `translateX` de la galería responden de forma exactamente proporcional al progreso (50% de scroll → 50% de trazo / 50% de traslado; reversible en ambos sentidos). `prefers-reduced-motion`: el stage del café se aplana a una imagen fija de 60vh con el corazón ya dibujado; la galería se aplana a una grilla normal que envuelve línea, sin pin ni traslado.

Verificado en 375 y ~640px: sin scroll horizontal, sin errores de consola, ninguna escena repite la mecánica de su vecina inmediata.

## Problemas conocidos

- `sites/aroma-moka/` (el original) sigue existiendo en paralelo, ahora desactualizado respecto a `clientes/aroma-moka/site/` — candidato a archivar cuando el cliente apruebe esta versión, no se borró sin confirmar.
- `research/RESEARCH.md` marca 04-personas en 0 pese a búsqueda activa — si aparece una foto real con personas, sumarla.
- El loader usa el isologo "AM + tacita" (bubble), no el sello circular con el corazón que describía DESIGN.md — es el único logo suelto disponible como archivo limpio; si el negocio tiene el sello circular como archivo aparte, se puede reemplazar.
- "Estacionamiento: Gratuito" sigue sin verificar; el horario del sitio sigue sin actualizarse al real (Martes a Sábado 9-20h) — ninguno de los dos fue pedido en esta pasada.
