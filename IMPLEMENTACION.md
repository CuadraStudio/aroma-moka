# aroma-moka — IMPLEMENTACION.md (v7.0 · 2026-10-07)

Reimplementación completa. Reemplaza `index.html`, `css/style.css` y `js/main.js` de la v6.0; la v6.0 y todas las anteriores quedan en el historial de git de esta carpeta.

## Cómo abrir o servir el sitio

Esta laptop no tiene Python. Desde la raíz del repo (`Webs/`):

```
node .claude/serve.js 3021
```

y abrir `http://localhost:3021/clientes/aroma-moka/site/`. La entrada `aroma-moka` de `.claude/launch.json` ya apunta a ese comando. `.claude/serve.js` es un servidor estático mínimo que se agregó en esta pasada.

El sitio es autónomo: el motor de movimiento está copiado en `engine/` (ver abajo), así que también se puede servir directo desde esta carpeta con cualquier servidor estático.

Enlace directo a cada web: `?v=aroma` y `?v=dolce`.

## Publicación (demo)

- Repo: `CuadraStudio/aroma-moka` en GitHub (privado), rama `main`. La raíz del repo es esta carpeta `site/`.
- Render: sitio estático `aroma-moka-web` (workspace CuadraStudio), sin build, publica `.`, deploy automático con cada push a `main`. URL: https://aroma-moka-web.onrender.com
- Para actualizar la demo: `git push` desde esta carpeta.
- Mantiene `<meta name="robots" content="noindex">`: es una demo para el prospecto, no producción.
- Los nombres de Render son únicos: `aroma-moka` ya estaba tomado, por eso termina en `-web`.

## Ajustes después de la entrega

- **Portada de Aroma Moka con foto de fondo (2026-10-09, pedido de Luciano):** se quitaron las dos fotos que crecían con el scroll (taza rosa y pavlovas), sus epígrafes y el párrafo de la derecha; la portada usa una foto cenital de mesa de madera (`img/portada_aroma.webp` de 1860 px e `img/portada_aroma_960.webp`) con el título y los dos botones centrados ("Ver qué hay", "Cómo llegar"). El párrafo "Dos pasiones, una sola mesa…" se sacó porque "Juntos", justo abajo, dice lo mismo; los botones se conservaron. El sello giratorio pasó al centro del borde inferior, porque a la derecha tapaba el plato. La foto es el fondo en todos los tamaños, pero una foto horizontal recortada en vertical pierde toda la comida, así que hay **tres composiciones** elegidas con `<picture>`: desde 900 px la foto horizontal (`portada_aroma.webp` y `_960`), de 640 a 899 px una vertical casi cuadrada (`portada_aroma_tablet.webp`, 1536×1600) y por debajo de 640 px una vertical alta (`portada_aroma_movil.webp` 1125×1900 y `_movil_750`). Las dos verticales se armaron a partir de la misma foto: se recortaron las cuatro comidas (taza, rol, croissant, panqueque), se pusieron en las esquinas con fundidos y la madera del centro se extendió por espejo, para dejar el centro libre al texto. La altura de la portada sigue la proporción de cada imagen para que el texto no tape la comida (se midió en 320, 375, 430, 640, 768, 900, 1024 y 1440 px). En celular el título baja un poco de tamaño (36 a 44 px) para entrar en el centro libre a 320 px. El texto pasa a moka sobre la madera clara. Solo afecta a `.hero--cover`; la portada de Dolce Shop no cambió. La foto no lleva `decoding="async"` a propósito: es la imagen principal y así pinta de inmediato. Las fotos `03_cafe_taza_rosa.webp` y `16_pavlovas.webp` quedan sin uso.
- **La imagen de portada es generada con IA (ChatGPT), aportada por Luciano:** no es una foto del local y los platos pueden no coincidir con la carta real. El PNG original (2,3 MB) no está en el repo; sigue en `Descargas/Img Chat GPT/`.

- **Un solo marrón para el texto (2026-10-09, pedido de Luciano):** la etiqueta de la portada ("Aroma Moka & Dolce Shop") y las etiquetas chicas `label--accent` (Juntos, barras de carril, números de promesas) usaban madera (`#7E411A`); ahora usan moka (`#4F2C14`), el mismo del título y del resto del texto. Los logos ya usan un marrón casi igual (`#563117` medido), no se tocaron. **Madera queda solo como color de superficie:** fondo del cierre, botón activo del interruptor, cortina de cambio de modo y `theme-color` del navegador móvil. Pasarlo también a moka dejaría el cierre casi negro y quitaría un color de la paleta; si se quiere, es cambiar `--madera` en `css/style.css`.

## Fuente de diseño

No hay `DESIGN.md` (se eliminó el 2026-09-30 a pedido de Luciano). El contrato de esta pasada es el **Artifact Design "Aroma Moka — Design Concept"** (https://claude.ai/artifact/MYgK5VvxpF7Qomp2fo2ex8) y las decisiones tomadas en la conversación del 2026-10-07. Nada de esto está marcado APROBADO. **No se usó el `DESIGN.md` anterior** (`sites/aroma-moka/DESIGN.md`) como referencia, por pedido explícito.

Decisiones [YO] que gobiernan esta versión: dirección fotográfica y editorial; sin tablero de ajedrez como recurso gráfico; sin QR (era solo de una pieza publicitaria); no explicar que Dolce Shop es de la misma dueña, sino presentar a los dos negocios siempre unidos; landing simple; dos botones, uno por negocio; **interruptor** que cambia la web entera entre Aroma Moka (que incluye a Dolce Shop) y Dolce Shop.

## Mapa de escenas → archivos

Todo en una sola página, con dos modos. El modo vive en `html[data-mode]` (`aroma` o `dolce`); cada bloque se muestra según `data-only`.

| Escena | Aroma Moka | Dolce Shop |
|---|---|---|
| Apertura | `#inicio` (foto de portada de fondo) | `#d-inicio` (foto que crece) |
| Manifiesto | `#juntos` ("Juntos") | `#d-medida` ("A medida") |
| Dos carriles + pilas de fotos | `#cafe` / `#comer` | `#d-tortas` / `#d-galletas` |
| Cierre con datos y botones | `#visitanos` (compartido; solo cambian título y etiqueta) | igual |
| Pie | `.foot` (compartido) | igual |

- `index.html`: estructura y contenido de las dos webs.
- `css/style.css`: tokens, componentes y escalado (mobile-first: base móvil, `min-width` 640 / 1000 / 1280). El modo cambia solo las variables `--field`, `--field-ink`, `--field-sub` y `--u`: madera con texto hueso en Aroma Moka, rosa chicle con texto moka en Dolce Shop.
- `js/main.js`: interruptor de modo, "foto que crece", cierre que se junta, línea central, barra de progreso y pilas de fotos.
- `engine/cuadra-motion.css|js`: reveals (`data-reveal`) y deriva de los carriles (`data-parallax`). Es una **copia sin cambios** del motor de Cuadra (`engine/` en la raíz de `Webs/`, copiada el 2026-10-07), puesta acá para que el repo de este sitio se publique solo. Si el motor cambia en `Webs/`, hay que volver a copiarlo.

## Movimiento más allá del reveal básico, y por qué

El concepto pide un recorrido con un solo gesto fuerte por pantalla, así que hay más que el reveal:

- **Foto que crece (momento de firma; desde 2026-10-09 solo en la web de Dolce Shop):** la pareja de fotos del inicio sube y se abre del 64% al 100% del ancho con esquinas redondeadas, mientras el fondo pasa de campo de color a hueso. Es `clip-path` con la variable `--p`, que `main.js` calcula con el scroll (en los dos sentidos). Se eligió JS y no `animation-timeline` para que funcione en todos los navegadores.
- **Dos carriles a contramarcha:** las pilas de fotos derivan en sentidos opuestos con `data-parallax` del motor (velocidad ±0.07, solo ≥ 1000 px). Una línea central se dibuja con el scroll y un "&" marca la unión.
- **Cierre que se junta:** los datos de las dos casas se acercan desde ±10 vw.
- **Anillo de texto:** SVG con `textPath` que gira una vuelta cada 24 s.
- **Pilas de fotos:** tres tarjetas apiladas con flechas, teclado (flechas con la pila enfocada) y swipe.
- **Interruptor:** una cortina del color del modo de destino sube, se cambia el contenido y se retira (0.9 s en total).
- **Barra de progreso** rosa de 3 px arriba.

`prefers-reduced-motion`: sin animación de ninguna clase; el interruptor cambia al instante y todo queda en su estado final. En móvil no hay deriva de carriles.

Registrado en `docs/operacion/MOTION-LOG.md`. No repite el momento de firma de los clientes recientes (trazo SVG, producto flotante).

## Desviaciones del Artifact y cómo se conserva la intención

- **Scroll con JS en vez de CSS `animation-timeline`:** el Artifact usaba CSS para el prototipo; acá se pasó a JS para soportar Safari y Firefox. Mismo efecto.
- **Lugar de la mascota:** el Artifact tenía un círculo punteado. En el sitio **no se muestra**: el anillo del cierre gira alrededor del isotipo (Aroma Moka) o de un corazón (Dolce Shop). Cuando llegue la mascota en vectorial y sin QR, entra en el centro de ese anillo.
- **Logo de Dolce Shop (2026-10-09):** el encabezado del modo Dolce Shop y el pie usan `img/dolce_logo.webp`, el logo que mandó Luciano (PNG con transparencia, 1536×1024) recortado al contorno y pasado a WebP de 800 px. El original queda en `img/dolce_logo_original.png`. Es rosa sobre transparente: se ve bien sobre hueso y madera, pero se pierde sobre el rosa chicle del inicio de Dolce Shop, por eso ahí no se usa. Reemplazó al texto provisorio ("Dolce Shop / Pastelería artesanal").
- **Datos reales en vez de corchetes:** dirección, horario, WhatsApp e Instagram salen de `research/RESEARCH.md` y de lo confirmado por Luciano.

## Decisiones [IA] donde no había contrato

- La web de Dolce Shop (titular "Tortas y galletas hechas a tu medida", sección "A medida", carriles "Tortas" y "Galletas y cajas") es una **propuesta mía** a partir de las fotos de sus tortas y galletas, el texto "Pastelería artesanal" de sus tarjetas y los destacados de su Instagram (Mamá, San Valentín, Pascuas, Fiestas, Tortas, Cookies).
- Campo de Dolce Shop en rosa chicle (el rosa de su papel de empaque) y el de Aroma Moka en madera.
- Corazón de línea genérico como centro del anillo de Dolce Shop.
- Orden de las pilas de fotos y repetición de algunas fotos entre secciones, porque Dolce Shop tiene solo 4 fotos reales.

## Copy escrito por IA, para revisar

- Aroma Moka: titular "Un café y algo dulce, en la misma mesa."; "Dos pasiones, una sola mesa…"; "Juntos" y sus tres promesas; "Cada taza, con dibujo"; "Hecho para el café"; "Venite: la mesa te espera".
- Dolce Shop: "Tortas y galletas hechas a tu medida."; "Cada torta y cada galleta se piensa para una ocasión…"; sus tres promesas; "Tortas para cada ocasión"; "Galletas y cajas con tu mensaje"; "Contanos tu ocasión".
- "Mejor servicio" se transmite como tono ("recibirte bien", "bien servida"), no como afirmación comprobable.
- Los pies de foto describen lo que se ve en cada foto.

## Datos faltantes

- **Link de PedidosYa:** solo se menciona como texto, no encontrado.
- **Horario de Dolce Shop:** no encontrado (el de la bio es el de Aroma Moka). En su web solo figura "Presupuestos únicamente por WhatsApp".
- **Logo de Dolce Shop en vectorial (SVG):** hoy se usa el PNG recortado; en tamaño chico alcanza, pero un vectorial queda más nítido y permitiría una versión de un solo color para fondos rosas.
- **Mascota** (taza con gorro tejido y cara sonriente) en vectorial y sin QR. La imagen recibida mide 140×162 px.
- **Isotipo** en alta: el actual mide 150 px y solo se usa en tamaño chico.
- **Fotos de Dolce Shop:** solo 4, de 480 a 640 px de ancho, bajadas de Instagram. Se ven bien en las tarjetas, pero no aguantan una foto grande. Hacen falta más y en mejor calidad.
- Carta y precios: no encontrados, no hay ninguno en el sitio.

## Funcionalidades simuladas (etapa 15)

Ninguna: no hay formularios. Los dos botones abren WhatsApp con un mensaje de saludo prellenado; el link "Cómo llegar" abre una búsqueda de Google Maps con la dirección.

## Problemas conocidos

- **Verificación visual incompleta:** al verificar, el panel del navegador estuvo oculto y no repintaba al hacer scroll. Se verificó por DOM (no hay scroll horizontal en 375, 768, 1280 y 1920 px; sin errores de consola; recursos y fuentes cargan; interruptor, pilas de fotos y variables de scroll responden) y visualmente solo el inicio en 375 y 1100 px. **No se vieron las secciones de abajo ni el modo Dolce Shop en pantalla.** Pendiente de revisión visual en la etapa 7.
- **Imágenes sin uso en `img/`:** quedan los WebP/JPG de versiones anteriores que esta versión ya no usa. No se borraron.
- **Fuentes:** Young Serif y Figtree vienen de Google Fonts (necesita conexión).
- La deriva de carriles depende de `requestAnimationFrame`: si la pestaña está oculta, se pausa (es normal).
