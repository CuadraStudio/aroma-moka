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

## Problemas conocidos

- `sites/aroma-moka/` (el original) sigue existiendo en paralelo, ahora desactualizado respecto a `clientes/aroma-moka/site/` — candidato a archivar cuando el cliente apruebe esta versión, no se borró sin confirmar.
- `research/RESEARCH.md` marca 04-personas en 0 pese a búsqueda activa — si aparece una foto real con personas, sumarla.
