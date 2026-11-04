# Maritza Rodríguez Fotografía

Sitio web de una sola marca con cuatro categorías: bodas, quinceañeras, familiares e institucionales. Es un sitio estático: HTML, CSS y JavaScript, sin dependencias que instalar.

## Verlo en tu computadora

Desde esta carpeta:

```bash
python -m http.server 5180
```

Luego abre <http://localhost:5180>.

## Cambiar los datos de contacto

Todo está en `assets/js/config.js`: Instagram, Facebook, ciudad y WhatsApp. Las sesiones se coordinan solo por WhatsApp, con el mensaje ya escrito que está en ese archivo. Instagram es un enlace al perfil. El enlace de Facebook aparece solo cuando se escribe su dirección; hoy está vacío porque el perfil no se ve sin iniciar sesión en Facebook. Si cambia el número, cámbialo también en `telephone`, dentro de `index.html`.

## Agregar o cambiar fotos

1. Edita `scripts/fotos.json`. Cada categoría tiene grupos, y cada grupo tiene filas:
   - `pleno`: una foto horizontal a todo el ancho
   - `par`: dos fotos en una fila
   - `trio`: tres fotos en una fila
   - `isla`: una foto vertical centrada
2. Ejecuta `python scripts/preparar_fotos.py`. Crea las versiones optimizadas y actualiza `assets/js/fotos.js`. Las fotos que ya existen se saltan.

Las rutas de `fuentes` apuntan a los originales en `../Maritza Album`. Esa carpeta solo hace falta para procesar fotos nuevas, no para publicar el sitio.

## Abrir la categoría Institucionales

Hoy muestra el lente casi cerrado porque todavía no tiene fotos. En `scripts/fotos.json`:

1. Agrega las fotos en `salas.institucionales`, con el mismo formato de las otras categorías.
2. Agrega su portada en `portadas`, con una foto horizontal (`h`) y una vertical (`v`):

   ```json
   "institucionales": { "h": "coso:Carpeta/IMG_0001", "v": "coso:Carpeta/IMG_0002" }
   ```

3. Ejecuta `python scripts/preparar_fotos.py`.

El lente se abre solo en la página de la categoría y en su tarjeta del inicio, y la categoría entra sola a la animación del inicio.

## Cambiar el texto de las páginas

El inicio se edita directamente en `index.html`. Para cambiar cuánto dura cada escena de su animación, edita `--espera` en `assets/css/sitio.css`. Las cuatro páginas de categoría salen de una plantilla: edita `scripts/crear_paginas.py` y ejecútalo con `python scripts/crear_paginas.py`.

## Publicar

Si cambias un archivo CSS o JS, sube el número `?v=` con el que se cargan en `index.html` y en `scripts/crear_paginas.py`, y ejecuta ese script. Así nadie se queda con la versión anterior guardada en su navegador.

Funciona en GitHub Pages tal como está, igual que los álbumes; el archivo `.nojekyll` ya está incluido. La dirección es <https://luisma4.github.io/PW-MartizaRodriguez/>.

Las rutas de `og:image` ya usan esa dirección completa, porque WhatsApp e Instagram la necesitan para mostrar la foto al compartir un enlace. Si el sitio pasa a un dominio propio, cámbialas en `index.html` y en `scripts/crear_paginas.py`.
