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

- **Portada de Aroma Moka con foto de fondo (2026-10-09, pedido de Luciano):** se quitaron las dos fotos que crecían con el scroll (taza rosa y pavlovas), sus epígrafes y el párrafo de la derecha; la portada usa una foto cenital de mesa de madera (`img/portada_aroma.webp` de 1860 px e `img/portada_aroma_960.webp`) con el título y los dos botones centrados ("Ver qué hay", "Cómo llegar"). El párrafo "Dos pasiones, una sola mesa…" se sacó porque "Juntos", justo abajo, dice lo mismo; los botones se conservaron. El sello giratorio pasó al centro del borde inferior, porque a la derecha tapaba el plato. La foto es el fondo en todos los tamaños, pero una foto horizontal recortada en vertical pierde toda la comida, así que hay **tres composiciones** elegidas con `<picture>`: desde 900 px la foto horizontal (`portada_aroma.webp` y `_960`), de 640 a 899 px una vertical casi cuadrada (`portada_aroma_tablet.webp`, 1229×1280) y por debajo de 640 px una vertical alta (`portada_aroma_movil.webp` 965×1630 y `_movil_750`). Desde el 2026-10-09 las dos verticales son **imágenes generadas por Luciano** con esas proporciones (0,96:1 y 0,59:1), que reemplazaron a las composiciones armadas a partir de la foto horizontal (recorte de las cuatro comidas con fundidos y madera extendida por espejo). La altura de la portada sigue la proporción de cada imagen para que el texto no tape la comida (se midió en 320, 375, 430, 640, 768, 900, 1024 y 1440 px). En celular el título baja un poco de tamaño (36 a 44 px) para entrar en el centro libre a 320 px. El texto pasa a moka sobre la madera clara. Solo afecta a `.hero--cover`; la portada de Dolce Shop no cambió. La foto no lleva `decoding="async"` a propósito: es la imagen principal y así pinta de inmediato. Las fotos `03_cafe_taza_rosa.webp` y `16_pavlovas.webp` quedan sin uso.
- **Portada de Dolce Shop con foto de fondo (2026-10-09, pedido de Luciano: "lo mismo"):** mismo tratamiento que la de Aroma Moka. Se quitaron las dos fotos que crecían (torta Oli y surtido de pastelería), sus epígrafes y el párrafo de la derecha ("Pastelería artesanal para cada ocasión…", que ya está en "A medida"); quedan el título y los botones "Pedir presupuesto" y "Ver trabajos" centrados, y el sello giratorio con el corazón al centro del borde inferior. Imágenes: `portada_dolce.webp` (1859 px) y `_960` para escritorio, `portada_dolce_tablet.webp` (1229×1280) y `portada_dolce_movil.webp` (965×1630) con `_movil_750`, las dos verticales generadas por Luciano (reemplazaron a las composiciones armadas con el mismo método que en Aroma Moka). Fondo rosa `#F3CCCB` tomado de la foto (`.hero--dolce`). Se retiró el CSS que quedó sin uso (`.band`, `.grow`, `.captions`, `.cap`, `.hero__aside` y el diseño en dos columnas de la portada). Las fotos `dolce_torta_oli.webp` y `08_surtido_pasteleria.webp` siguen en uso en las pilas.
- **Las dos imágenes de portada son generadas con IA (ChatGPT), aportadas por Luciano:** no son fotos del local ni de los productos reales, y los platos pueden no coincidir con lo que hacen (en Dolce Shop, las tortas y macarons de la portada no son necesariamente los suyos). Los PNG originales (2 a 2,3 MB) no están en el repo; siguen en `Descargas/Img Chat GPT/`. El de Dolce Shop también está copiado en `img/` pero excluido de git en `.git/info/exclude` (solo local).

- **Un solo marrón para el texto (2026-10-09, pedido de Luciano):** la etiqueta de la portada ("Aroma Moka & Dolce Shop") y las etiquetas chicas `label--accent` (Juntos, barras de carril, números de promesas) usaban madera (`#7E411A`); ahora usan moka (`#4F2C14`), el mismo del título y del resto del texto. Los logos ya usan un marrón casi igual (`#563117` medido), no se tocaron. **Madera queda solo como color de superficie:** fondo del cierre, botón activo del interruptor, cortina de cambio de modo y `theme-color` del navegador móvil. Pasarlo también a moka dejaría el cierre casi negro y quitaría un color de la paleta; si se quiere, es cambiar `--madera` en `css/style.css`.

- **Imágenes verticales propias (2026-10-09, aportadas por Luciano):** tablet 1229×1280 y celular 965×1630 para las dos webs, algo menores que las medidas recomendadas (1536×1600 y 1125×1900) pero con la proporción exacta; en pantallas de alta densidad se verán apenas más suaves. No se entregó imagen de escritorio: siguen `portada_aroma.webp` y `portada_dolce.webp` (1860×846 y 1859×846). Se midió con el DOM que el texto cae dentro de la franja libre de cada imagen en 320, 360, 375, 430, 640, 768 y 899 px. En celulares angostos (hasta 399 px) se compactó el espacio entre etiqueta, título y botones, y por debajo de 360 px el título baja a 30 px, porque la franja libre es más baja que el texto. Los PNG originales (2 MB cada uno) quedan solo en local, excluidos de git; las copias idénticas están en `Descargas/Img Chat GPT/`.

## Transición al cambiar de web: círculo desde el botón (2026-10-09, elegida por Luciano)

Al tocar el interruptor (o un enlace "Mirá lo que prepara…"), la web nueva se abre como un círculo desde el punto tocado, usando la API de transiciones de vista (`document.startViewTransition`; el círculo es un `clip-path` animado desde JS sobre `::view-transition-new(root)`). Se ve el contenido real de la otra web y dura ~0,65 s. Se compararon dos variantes por URL (`?t=circulo` y `?t=mitades`, esta última con dos mitades que se juntaban en un "&") y Luciano eligió el círculo; la otra y el parámetro se borraron.

- **Mismo lugar en la otra web:** en vez de volver al tope, la persona queda en la sección equivalente y a la misma altura relativa (Inicio ↔ Inicio, Juntos ↔ A medida, carriles (Aroma Moka) ↔ productos (Dolce Shop), cierre ↔ cierre); si estaba al final de la página, queda al final.
- **Otros detalles:** se ignora un segundo clic mientras corre la transición; el botón del interruptor se desliza con un pequeño rebote.
- **Respaldo:** en un navegador sin transiciones de vista queda una cortina de color (el tono de la portada de destino: `#F4D6BB` para Aroma Moka, `#F3CCCB` para Dolce Shop), que también conserva el lugar.
- **`prefers-reduced-motion`:** fundido de 150 ms si el navegador tiene la API; si no, cambio directo.
- **Código:** `js/main.js` (`switchCircle`, `switchCurtain`, `capturePos`, `restorePos`, `fadeSwap`) y el bloque "Cambio de web" en `css/style.css`.

Verificado: cambio de modo, conservación de la posición en ida y vuelta (diferencia de 0,1 % de la altura de la sección), doble clic, respaldo sin la API y consola sin errores; el círculo se midió creciendo (82 px a los 200 ms, 982 px a los 500 ms, 0,69 s en total) y se vio una captura a mitad de camino. **No se vio en movimiento real ni en un celular**, y el fundido de `prefers-reduced-motion` no se probó. Con la pestaña o el panel oculto el navegador omite la animación y el cambio ocurre directo.

## Movimiento de la portada (2026-10-09, aprobado por Luciano salvo el desvanecimiento, que se quitó)

Las dos portadas tienen un movimiento leve para que la web no se sienta estática. Se probó antes detrás de `?m=vivo`; Luciano pidió dejarlo todo igual salvo el desvanecimiento del texto al hacer scroll, que le pareció demasiado, y se **quitó** (sin él, el texto sale de pantalla de forma natural y no queda un estado a medio desvanecer). El parámetro se borró: es el comportamiento por defecto.

Restricción de las imágenes: la comida está en las esquinas y a solo 10 a 20 px del texto en celular y tablet, así que un parallax clásico (la foto sube y baja) haría que el título toque los platos. Todo lo que se agregó **agranda** la foto desde el centro, de modo que la comida se aleja del texto, nunca se acerca.

| Efecto | Qué hace | Dónde |
|---|---|---|
| Zoom al hacer scroll | La foto pasa de 1,02 a 1,08 mientras se sale de la portada. El texto sube un poco más rápido que la página (64 px en pantallas de 900 px o más, 28 px en menores), sin desvanecerse. Arriba de todo no cambia nada del diseño | Todas |
| Respiración | La foto se agranda un 3,5 % y vuelve, en ~22 s, desde que termina el asentado inicial. Se pausa cuando la portada no se ve (o está en la otra web) | Todas |
| Mouse | La foto se mueve hasta 6 × 4 px en sentido opuesto al puntero y el texto hasta 4 × 3 px a favor | Solo puntero fino y 900 px o más |
| Sello | Flota 6 px arriba y abajo en ciclos de 7 s | Todas |
| Botones | El relleno entra desde la izquierda al pasar el mouse | Todos los `.btn` (regla base) |

Todo es `transform` y desaparece con `prefers-reduced-motion`. Código: `heroMotion`, `--hp` en `scrub()` y la sección 5 de `js/main.js`; bloque "Movimiento de la portada" en `css/style.css` (el zoom va en el `<picture>` y el asentado y la respiración en la `<img>`, para no pisarse).

Verificado con mediciones (el panel de pruebas estaba oculto y pausa los cuadros de animación, así que se simuló el ciclo de dibujo): `--hp` de 0 a 1 y reversible, zoom 1,02 a 1,08, texto -64 px con opacidad siempre 1, parallax del mouse en las dos direcciones y regreso a cero, funciona en Dolce Shop y junto al círculo del cambio de web, consola sin errores. **No se vio en movimiento real ni en un celular**, y la pausa fuera de pantalla (IntersectionObserver) no se pudo probar con el panel oculto.

## Carruseles de fotos: estilo historias (2026-10-10, elegido por Luciano)

Los carruseles de las dos webs (dos por web, uno en cada carril) cambian de foto solos, estilo historias de Instagram. Reemplazan a las tarjetas apiladas con borde, inclinadas y con flechas de 44 px, que no seguían la estética de las portadas. Se compararon por URL cuatro alternativas (selector tipográfico "carta", tira con scroll nativo, fotos que avanzan con el scroll de la página y estilo historias); Luciano descartó la carta (lista larga: al elegir otro nombre había que volver a subir para ver el cambio), encontró la tira poco intuitiva y que "detiene un poco la experiencia", y eligió **historias**. Las otras y las tarjetas apiladas se borraron (CSS, JS, `data-pos`, flechas y el parámetro `?c`).

- **Barra de segmentos** arriba de la foto (uno por foto) que se llena como temporizador, 4,5 s por foto, con un leve degradé oscuro arriba para que se lea sobre fotos claras.
- **Toque en los lados:** el izquierdo (35 %) va a la foto anterior y el derecho (65 %) a la siguiente; apoyar más de 250 ms, o pasar el mouse por encima, pausa; también se desliza con el dedo o el mouse y se usan las flechas del teclado con el carrusel enfocado. En escritorio aparecen flechas circulares al pasar el mouse por cada lado. Botón de pausa visible (accesibilidad).
- **Cuándo corre:** solo mientras al menos el 40 % de la franja se ve y la pestaña está activa; los dos carruseles de una misma web no cambian a la vez (el segundo arranca al 45 %). Al volver a la pestaña no salta de golpe (tope de 100 ms por cuadro).
- **Cambio de foto:** la nueva se abre como un círculo desde donde terminó la barra (o desde donde se tocó), con un leve zoom de entrada. Un temporizador de respaldo cierra la animación aunque la pestaña estuviera oculta, y un toque nuevo termina en el acto la anterior.
- **Pie:** el nombre de la foto en serif grande y el contador "01 / 03" al lado. Sin `aria-live` (cambia solo, no se anuncia cada vez).
- **`prefers-reduced-motion`:** no avanza sola; se cambia con los toques y el teclado, sin animación.
- **Sin JavaScript** se ve la primera foto de cada carrusel (`is-active` en el HTML).

Código: `initHistorias` y la sección 3 de `js/main.js` (`scrub()` actualiza las franjas al hacer scroll); bloque de `.stack`, `.hist__*` y `.stack__bar` en `css/style.css`.

Verificado con mediciones: avance automático con relojes acelerados, no avanza fuera de vista ni al cargar, pausa con el botón y con el mouse, toque en los lados, apoyar y soltar no cambia, deslizar, teclado, carriles de 2 y 3 fotos de Dolce Shop, sin desborde horizontal a 375 y 320 px, consola sin errores, y una captura en escritorio. **No se vio el avance con relojes reales ni nada en un celular de verdad** (el panel de pruebas oculto pausa las animaciones).

## Barras de los carriles: nombres juntos en el centro (2026-10-10, pedido de Luciano)

Cada carril tiene una barra fija arriba con un rótulo y un nombre. Antes, en el carril derecho el rótulo estaba pegado al centro y el nombre al borde; ahora el orden de ese carril está invertido para que los dos nombres queden juntos junto al "&": el rótulo de la izquierda ("01 — Café") pegado al borde izquierdo, "Aroma Moka" junto al centro, "Dolce Shop" del otro lado del "&" y el rótulo de la derecha ("Comida — 02") pegado al borde derecho. Se lee de punta a punta como **"01 — Café … Aroma Moka & Dolce Shop … Comida — 02"**. En el carril derecho el orden del HTML es nombre y después rótulo, y el número va al final. Los nombres quedan a 48 px de la línea central (el "&" mide 46 px). En celular, con los carriles apilados, cada barra reparte sus dos textos entre los extremos. Esto vale solo para la web de Aroma Moka: en Dolce Shop ya no hay carriles ni barras (ver "Dolce Shop: productos sin la división").

## Cierre más completo, vista previa al compartir y datos para Google (2026-10-10, pedido de Luciano)

Luciano pidió ideas de secciones que faltaban y eligió armar las cuatro que no necesitan datos nuevos del cliente. Las demás (cómo pedir una torta, ocasiones, qué hay en la mesa, meriendas, preguntas frecuentes) esperan las respuestas de `../PREGUNTAS-CLIENTE.md`. La página sigue siendo la landing de tres bloques: lo nuevo entra en el cierre ("Visitanos") y en el `<head>`.

- **Mapa y "Cómo llegar":** mapa de Google incrustado (`loading="lazy"`, busca "Aroma Moka" más la dirección, así que muestra el local con su calificación) y un botón "Cómo llegar" que abre las indicaciones en Google Maps. **Solo se ve en la web de Aroma Moka** (`data-only="aroma"`): el lugar de retiro de Dolce Shop no está confirmado. Altura de 260 a 380 px. Al ser un mapa de Google, carga contenido de Google al llegar cerca.
- **"Abierto ahora":** en la tarjeta de Aroma Moka, calculado con la hora de Montevideo y el horario habitual (martes a sábado, 9 a 20 h), que sale de los atributos `data-days`, `data-from` y `data-to` del propio cartel. Dice "Abierto ahora · hasta las 20 h", "Cerrado ahora · abre hoy a las 9 h", "…abre mañana…" o "…abre el martes…". Se actualiza cada minuto y al volver a la pestaña; sin JavaScript queda oculto. **No conoce los feriados** (no encontrado), por eso la fila de horario aclara "En feriados, confirmá por WhatsApp". Si hay que cambiar el horario hay que tocarlo en tres lugares: el texto de la fila "Horario", los atributos del cartel y el JSON-LD.
- **Sello de reseñas:** "4,6 · 63 reseñas en Google", con link a Google Maps. Las cifras son un dato escrito a mano: se vieron en la tarjeta de Google Maps el 2026-10-10 y hay que actualizarlas a mano. No se muestran citas porque no hay reseñas elegidas ni permiso.
- **Vista previa al compartir:** metadatos Open Graph y Twitter con la imagen `img/og.jpg` (1200×630: las portadas de tablet de las dos webs, lado a lado, con los dos logos). Es la misma para las dos webs, porque quien rastrea el link (WhatsApp, por ejemplo) no ejecuta JavaScript y ve siempre el mismo HTML, también con `?v=dolce`. Como las portadas son imágenes generadas con IA, la vista previa también lo es.
- **Datos para Google:** JSON-LD con dos negocios (`CafeOrCoffeeShop` para Aroma Moka y `Bakery` para Dolce Shop) con nombre, teléfono, Instagram y dirección; de Aroma Moka también el horario. De Dolce Shop solo "Las Piedras, Canelones" y no se inventó dirección, horario ni coordenadas. **No se puso la calificación (`aggregateRating`)**: según las pautas de Google, las reseñas que el propio negocio publica sobre sí mismo no se muestran como estrellas. El título y la descripción cambian al pasar de web (ya cambiaba el título).
- **Código postal:** la ficha del negocio en Google muestra 15900 (el de la FICHA); buscando solo la dirección, Google mostró 90200. Se usó 15900.

**Pendiente antes de publicar de verdad (etapa 14):**
- Cambiar `https://aroma-moka-web.onrender.com` por la dirección definitiva en `index.html` (`og:image` y el JSON-LD: `@id`, `url` e `image`). Los metadatos de compartir necesitan una dirección completa.
- **La página sigue con `<meta name="robots" content="noindex">`** por ser una demo: mientras esté, Google no la indexa y los datos del JSON-LD no sirven de nada. Quitarlo es una decisión de Luciano al publicar.
- Si se quiere que el Instagram de Dolce Shop comparta una vista previa propia (con su nombre y su imagen), hace falta una página aparte con sus propios metadatos. No se hizo.

Verificado: las diez combinaciones de hora y día simuladas del cartel dan el texto esperado (incluidos los casos donde la fecha en UTC ya es otro día), el mapa carga y marca el local con 4,6 (63), no se ve en Dolce Shop y vuelve a mostrarse al cambiar a Aroma Moka (la aparición suave del reveal no se pudo ver con el panel oculto, que pausa el observador), el JSON-LD es JSON válido, y no hay desborde horizontal a 320, 375, 768 y 1440 px. **No se verificó** la vista previa en WhatsApp ni en otras redes (hace falta publicar), ni la aparición real en Google. El cartel se animó con el panel oculto, así que el pulso del punto no se vio con relojes reales.

## Dolce Shop: productos sin la división (2026-10-10, pedido de Luciano)

Luciano pidió sacar "la división" de la web de Dolce Shop y enfocarla solo en sus productos. Historia, para no repetirla: primero armé dos bloques apilados (commit `c8f073f`); Luciano aclaró que solo quería quitar la línea vertical con el "&" y se volvió a los dos carriles sin esa línea (`444a6e8`); al quedar todavía un corte vertical de color entre los dos fondos, pidió **unificar los dos fondos, eliminar esa división vertical y que siga viéndose con secciones horizontales**. Por eso volvió la disposición en bloques: en la web de Dolce Shop desaparecen los dos carriles, la línea central, el "&" y las barras que repetían el nombre ("01 — Tortas … Dolce Shop & Dolce Shop … Galletas y cajas — 02"). En su lugar hay **dos bloques de producto a ancho completo, uno debajo del otro**: "01 — Tortas" y "02 — Galletas y cajas", con el **mismo fondo hueso de la página** y separados por una línea horizontal. Se eligió el hueso para los dos; el rosa claro del segundo bloque era la otra opción.

- **Escritorio (1000 px o más):** cada bloque va en dos columnas, texto y carrusel de fotos (480 px), y los lados se alternan: texto a la izquierda y fotos a la derecha en Tortas, al revés en Galletas y cajas.
- **Tablet y celular:** el texto va arriba y el carrusel debajo, a todo el ancho (hasta 520 px).
- **Sin cambios:** los textos, las fotos y los carruseles estilo historias son los mismos. Los accesos "Tortas" y "Galletas" del menú y "Ver trabajos" siguen llegando a `#d-tortas` y `#d-galletas`, y el cambio entre webs conserva el lugar (de los productos de Dolce Shop a los carriles de Aroma Moka y de vuelta).
- **Ya no hay en esta web:** la deriva de las fotos con el scroll (`data-parallax`), la línea central, el "&" y las barras fijas. La etiqueta de cada bloque ("01 — Tortas", "02 — Galletas y cajas") quedó sobre el título.
- **La web de Aroma Moka no cambió.**

Código: sección `.products` con dos `.product` dentro de `main[data-only="dolce"]` en `index.html`; bloque "Productos de Dolce Shop" de `css/style.css`. Las reglas de `.lane*`, `.seam` y `.amp` siguen en uso solo para Aroma Moka.

**No se tocó:** el cierre ("Visitanos") es compartido, así que en la web de Dolce Shop sigue mostrando también la tarjeta de contacto de Aroma Moka, y la sección "A medida" tampoco cambió. Queda consultado con Luciano.

Verificado con mediciones: dos bloques con los lados alternados a 1440 px, una columna a 768, 375 y 320 px sin desborde horizontal, sin restos de carriles, línea central ni deriva en la web de Dolce Shop, los dos carruseles con su barra de segmentos y respondiendo al toque, el cambio de web conserva el lugar (0,54 de la sección en los dos sentidos), consola sin errores. Una captura en escritorio y una en celular; con el panel oculto el texto quedó a medio aparecer en la captura (el reveal del motor). Al volver a esta disposición se midió de nuevo en 1440 px: los dos bloques con el mismo fondo (rgb 255, 246, 238, el de la página), sin bordes verticales ni restos de carriles, con una línea horizontal entre ellos. Las medidas de 768, 375 y 320 px son de antes, con la misma disposición; solo cambió el color de fondo del segundo bloque.

## Torta en 3D (prueba, 2026-10-10, pedido de Luciano)

Luciano pidió probar el modelo 3D de la torta con rosas en el apartado de tortas de Dolce Shop, con paralaje y un giro lento y natural, "estilo la imagen de referencia". Una primera versión con giro de 360° y miniaturas de detalle le pareció "muy bruta" y pidió cómo integrarla sin que se note forzada. Esta es la versión que sigue la propuesta [IA] que acordamos (**foto primero, el 3D como un gesto sutil**).

**Solo se ve con `?torta=3d`** (por ejemplo `https://aroma-moka-web.onrender.com/?v=dolce&torta=3d`). Sin el parámetro la web no cambia en nada.

- **Qué se ve:** un bloque de apertura en "Tortas" de Dolce Shop: texto y botones a la izquierda, la torta sobre un disco rosa a la derecha (en celular, apilado). La tarjeta de tortas de siempre queda debajo, con la etiqueta "Más diseños" en vez de "01 — Tortas". El texto ("Tortas a tu medida", "Hechas para celebrar.", "Diseños únicos, detalles artesanales y mucho amor en cada torta.") **está tomado de la imagen de referencia: para revisar**. "Consultar por esta torta →" abre el WhatsApp de Dolce Shop con un mensaje; "Ver más diseños →" baja a la tarjeta de siempre.
- **Foto primero:** al cargar se ve la **foto real recortada** de la torta (`img/torta3d_poster.webp`). Cuando el modelo está listo, el 3D la reemplaza con un fundido de 0,7 s. Para que no se note el cambio, el modelo arranca en la **pose exacta de la foto**: se buscó por silueta el giro (−1,3 rad), la elevación (45°) y el campo visual (26°) donde el modelo se parece más a la foto (coincidencia de siluetas 97,8%, 97,1% ya en el cuadro final) y se encuadró en un cuadro de 20:21, el mismo de la sección. La foto se llevó a esa misma caja.
- **Movimiento:** un balanceo de **±30° alrededor del ángulo de la foto**, una ida y vuelta cada 18 s (velocidad máxima ~0,18 rad/s). **Nunca da la vuelta completa**, así que no muestra la parte de atrás, que el modelo inventa. Paralaje: con el scroll se mueven el disco y la torta a distinta velocidad y la torta gira un poco (relativo a donde apareció, para no romper el empalme con la foto); con el mouse la torta se inclina hasta unos 9° y el disco se mueve al revés. Se puede **arrastrar para girarla** (con inercia); a los 2 s de soltar vuelve sola al ángulo de la foto por el camino corto.
- **Sin botones a la vista:** se quitaron el "360°", el botón de pausa y las miniaturas de la primera versión. Un **toque o Enter/Espacio** sobre la torta pausa o reanuda el movimiento (el lienzo es un botón enfocable, con nombre accesible). Con `prefers-reduced-motion`: sin balanceo, sin paralaje y sin inercia; se puede arrastrar y se queda donde se lo deja.
- **Luz y color:** material "híbrido": la textura también emite (conserva el color y la luz de la foto) y queda poca luz encima para dar volumen. Calibrado contra la foto sobre la misma pose: marfil 233,225,206 contra 226,220,203 de la foto; rosa 234,188,187 contra 225,177,177; blanco 245 contra 247. **Corrección de la base:** el modelo trae vetas grises tipo mármol en la base blanca (artefacto de la generación; en la foto es lisa); se aclara por altura en el shader, sin tocar el archivo del modelo.
- **Peso y carga:** el modelo (`models/torta-dolce.glb`, 6,5 MiB) y three.js (`vendor/three/`, r160, MIT, 670 KB minificado, sin CDN) se cargan solo cuando la sección se acerca a la pantalla (700 px de margen) y solo en la web de Dolce Shop. Se dibuja solo mientras se ve y la pestaña está activa. Si no hay WebGL, no hay red o un shader falla, queda la foto (si el shader de la base falla, vuelve al material simple).
- **Código:** `js/torta3d.js` (módulo), `vendor/three/`, `models/`, `img/torta3d_poster.webp`; en `index.html`, el bloque `.torta3d` dentro de `#d-tortas`, un `importmap` y una línea que pone la clase `has-torta3d`; en `css/style.css`, el bloque "Torta en 3D"; en `js/main.js`, la sección 7. Las herramientas de ajuste de pose están en `research/3d/` (`pose.html`, `pose2.html`).

**Verificado:** el primer cuadro del 3D coincide con la foto (desfase 0 respecto del giro de la foto); el balanceo llega a +0,51 y −0,52 rad con período de 18 s; el toque y Enter/Espacio pausan y reanudan; el arrastre gira y vuelve a 0 por el camino corto; paralaje del puntero y del scroll; modo "reducir movimiento"; sin desborde horizontal a 375 y 1440 px; modelo cargado en three.js sin errores de consola. Se probó con un reloj de cuadros simulado porque el panel de pruebas quedó oculto. **No se vio:** el movimiento fluido a cuadros reales, el rendimiento en un celular de verdad, ni el fundido de la foto al 3D en un navegador (solo se midió que las siluetas coinciden).

**Limitaciones del modelo:** sale de una sola foto de baja resolución (663×807): las rosas se reconocen pero tienen menos detalle de pétalos que la foto, y la parte de atrás y los laterales que no se ven son inventados (por eso el balanceo corto). Para un giro completo hacen falta fotos de otros ángulos (ver `../PREGUNTAS-CLIENTE.md`, "Pedido de fotos de la torta").

**Decisión pendiente:** si esto pasa a ser la apertura de "Tortas" por defecto (sin el parámetro) o se descarta.

## Fuente de diseño

No hay `DESIGN.md` (se eliminó el 2026-09-30 a pedido de Luciano). El contrato de esta pasada es el **Artifact Design "Aroma Moka — Design Concept"** (https://claude.ai/artifact/MYgK5VvxpF7Qomp2fo2ex8) y las decisiones tomadas en la conversación del 2026-10-07. Nada de esto está marcado APROBADO. **No se usó el `DESIGN.md` anterior** (`sites/aroma-moka/DESIGN.md`) como referencia, por pedido explícito.

Decisiones [YO] que gobiernan esta versión: dirección fotográfica y editorial; sin tablero de ajedrez como recurso gráfico; sin QR (era solo de una pieza publicitaria); no explicar que Dolce Shop es de la misma dueña, sino presentar a los dos negocios siempre unidos; landing simple; dos botones, uno por negocio; **interruptor** que cambia la web entera entre Aroma Moka (que incluye a Dolce Shop) y Dolce Shop.

## Mapa de escenas → archivos

Todo en una sola página, con dos modos. El modo vive en `html[data-mode]` (`aroma` o `dolce`); cada bloque se muestra según `data-only`.

| Escena | Aroma Moka | Dolce Shop |
|---|---|---|
| Apertura | `#inicio` (foto de portada de fondo) | `#d-inicio` (foto de portada de fondo) |
| Manifiesto | `#juntos` ("Juntos") | `#d-medida` ("A medida") |
| Dos carriles + carruseles de fotos (Aroma Moka) / dos bloques de producto con carrusel (Dolce Shop) | `#cafe` / `#comer` | `#d-tortas` / `#d-galletas` |
| Cierre con datos y botones | `#visitanos` (compartido; solo cambian título y etiqueta) | igual |
| Pie | `.foot` (compartido) | igual |

- `index.html`: estructura y contenido de las dos webs.
- `css/style.css`: tokens, componentes y escalado (mobile-first: base móvil, `min-width` 640 / 1000 / 1280). El modo cambia solo las variables `--field`, `--field-ink`, `--field-sub` y `--u`: madera con texto hueso en Aroma Moka, rosa chicle con texto moka en Dolce Shop.
- `js/main.js`: interruptor de modo, cierre que se junta, línea central, barra de progreso y carruseles de fotos.
- `engine/cuadra-motion.css|js`: reveals (`data-reveal`) y deriva de los carriles (`data-parallax`). Es una **copia sin cambios** del motor de Cuadra (`engine/` en la raíz de `Webs/`, copiada el 2026-10-07), puesta acá para que el repo de este sitio se publique solo. Si el motor cambia en `Webs/`, hay que volver a copiarlo.

## Movimiento más allá del reveal básico, y por qué

El concepto pide un recorrido con un solo gesto fuerte por pantalla, así que hay más que el reveal:

- **Foto que crece (retirada el 2026-10-09):** el momento de firma original (la pareja de fotos del inicio que se abría del 64% al 100% con `clip-path` y `--p`) se quitó de las dos webs cuando las portadas pasaron a foto de fondo. Hoy el gesto de entrada es el asentado de la foto (`settle`, escala 1.15 a 1 en 1,8 s). `main.js` conserva el cálculo de `--p` porque lo usan los carriles y el cierre.
- **Dos carriles a contramarcha (solo en la web de Aroma Moka):** los carruseles de fotos derivan en sentidos opuestos con `data-parallax` del motor (velocidad ±0.07, solo ≥ 1000 px). Una línea central se dibuja con el scroll y un "&" marca la unión.
- **Cierre que se junta:** los datos de las dos casas se acercan desde ±10 vw.
- **Anillo de texto:** SVG con `textPath` que gira una vuelta cada 24 s.
- **Carruseles de fotos:** estilo historias, con barra de segmentos, toque en los lados, pausa y círculo de apertura (ver "Carruseles de fotos").
- **Interruptor:** un círculo con la web nueva se abre desde el botón tocado (0,65 s) y deja a la persona en el mismo lugar de la página (ver "Transición al cambiar de web").
- **Barra de progreso** rosa de 3 px arriba.

`prefers-reduced-motion`: sin animación de ninguna clase; el interruptor hace un fundido de 150 ms (o cambia directo) y todo queda en su estado final. En móvil no hay deriva de carriles.

Registrado en `docs/operacion/MOTION-LOG.md`. No repite el momento de firma de los clientes recientes (trazo SVG, producto flotante).

## Desviaciones del Artifact y cómo se conserva la intención

- **Scroll con JS en vez de CSS `animation-timeline`:** el Artifact usaba CSS para el prototipo; acá se pasó a JS para soportar Safari y Firefox. Mismo efecto.
- **Lugar de la mascota:** el Artifact tenía un círculo punteado. En el sitio **no se muestra**: el anillo del cierre gira alrededor del isotipo (Aroma Moka) o de un corazón (Dolce Shop). Cuando llegue la mascota en vectorial y sin QR, entra en el centro de ese anillo.
- **Logo de Dolce Shop (2026-10-09):** el encabezado del modo Dolce Shop y el pie usan `img/dolce_logo.webp`, el logo que mandó Luciano (PNG con transparencia, 1536×1024) recortado al contorno y pasado a WebP de 800 px. El original queda en `img/dolce_logo_original.png`. Es rosa sobre transparente: se ve bien sobre hueso y madera, pero se pierde sobre el rosa chicle del inicio de Dolce Shop, por eso ahí no se usa. Reemplazó al texto provisorio ("Dolce Shop / Pastelería artesanal").
- **Datos reales en vez de corchetes:** dirección, horario, WhatsApp e Instagram salen de `research/RESEARCH.md` y de lo confirmado por Luciano.

## Decisiones [IA] donde no había contrato

- La web de Dolce Shop (titular "Tortas y galletas hechas a tu medida", sección "A medida", bloques "Tortas" y "Galletas y cajas") es una **propuesta mía** a partir de las fotos de sus tortas y galletas, el texto "Pastelería artesanal" de sus tarjetas y los destacados de su Instagram (Mamá, San Valentín, Pascuas, Fiestas, Tortas, Cookies).
- Campo de Dolce Shop en rosa chicle (el rosa de su papel de empaque) y el de Aroma Moka en madera.
- Corazón de línea genérico como centro del anillo de Dolce Shop.
- Orden de las fotos de los carruseles y repetición de algunas fotos entre secciones, porque Dolce Shop tiene solo 4 fotos reales.

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
- **Fotos de Dolce Shop:** solo 4, de 480 a 640 px de ancho, bajadas de Instagram. Se ven bien en los carruseles, pero no aguantan una foto grande. Hacen falta más y en mejor calidad.
- Carta y precios: no encontrados, no hay ninguno en el sitio.
- **Para armar las secciones que faltan** (cómo pedir una torta, ocasiones, qué hay en la mesa, meriendas, preguntas frecuentes, quiénes están detrás) y los datos que siguen sin encontrarse (feriados, horario y lugar de retiro de Dolce Shop, link de PedidosYa, delivery propio): `../PREGUNTAS-CLIENTE.md`, lista de 22 preguntas en dos tandas, sin enviar.

## Funcionalidades simuladas (etapa 15)

Ninguna: no hay formularios. Los dos botones abren WhatsApp con un mensaje de saludo prellenado; el link "Cómo llegar" abre una búsqueda de Google Maps con la dirección.

## Problemas conocidos

- **Verificación visual incompleta:** al verificar, el panel del navegador estuvo oculto y no repintaba al hacer scroll. Se verificó por DOM (no hay scroll horizontal en 375, 768, 1280 y 1920 px; sin errores de consola; recursos y fuentes cargan; interruptor, pilas de fotos y variables de scroll responden) y visualmente solo el inicio en 375 y 1100 px. **No se vieron las secciones de abajo ni el modo Dolce Shop en pantalla.** Pendiente de revisión visual en la etapa 7.
- **Imágenes sin uso en `img/`:** quedan los WebP/JPG de versiones anteriores que esta versión ya no usa. No se borraron.
- **Fuentes:** Young Serif y Figtree vienen de Google Fonts (necesita conexión).
- La deriva de carriles depende de `requestAnimationFrame`: si la pestaña está oculta, se pausa (es normal).
