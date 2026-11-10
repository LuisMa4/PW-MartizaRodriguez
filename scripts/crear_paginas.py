#!/usr/bin/env python3
"""Escribe las cuatro páginas de categoría a partir de una sola plantilla.

Solo hace falta ejecutarlo si cambia el texto o la estructura de esas páginas.
Las fotos y los datos de contacto no se editan aquí.

    python scripts/crear_paginas.py
"""

from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]

PLANTILLA = """<!doctype html>
<html lang="es" data-sala="{id}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{nombre} | Maritza Rodríguez Fotografía</title>
  <meta name="description" content="{descripcion}">
  <meta name="theme-color" content="{pared}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_PE">
  <meta property="og:title" content="{nombre} | Maritza Rodríguez Fotografía">
  <meta property="og:description" content="{descripcion}">
  <meta property="og:image" content="https://luisma4.github.io/PW-MartizaRodriguez/assets/og/{og}.jpg">
  <link rel="icon" href="assets/logos/favicon.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..700&family=Jost:wght@400;500&display=swap">
  <link rel="stylesheet" href="assets/css/sitio.css?v=7">
  <script>
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('con-iris');
  </script>
</head>
<body>
  <canvas id="iris" aria-hidden="true"></canvas>

  <main>
    <section class="portada" aria-label="Foto de portada">
      <div class="lente-m" data-solo-cerrada><img src="assets/logos/monograma.webp" alt="" width="300" height="240"></div>
      <canvas aria-hidden="true" data-solo-cerrada></canvas>
    </section>
    <div class="encabezado">
      <h1 class="titular" data-ajustar="0.34">{nombre}</h1>
      <p class="bajada" data-solo-abierta>{bajada}</p>
      <div class="nota-cerrada" data-solo-cerrada>
        <p>Estoy preparando esta galería. Si tu institución necesita fotos de promociones, graduaciones o productos, escríbeme.</p>
        <a class="boton" target="_blank" rel="noopener" data-contacto>Escribir por WhatsApp</a>
      </div>
    </div>
    <div id="galeria"></div>
  </main>

  <footer id="cierre"></footer>

  <noscript><p><a href="https://www.instagram.com/maritza._rodriguez/">Ver mi trabajo en Instagram</a></p></noscript>
  <script src="assets/js/config.js?v=7"></script>
  <script src="assets/js/fotos.js?v=7"></script>
  <script src="assets/js/iris.js?v=7"></script>
  <script src="assets/js/sitio.js?v=7"></script>
</body>
</html>
"""

PAGINAS = (
    {
        "id": "bodas",
        "archivo": "bodas.html",
        "nombre": "Bodas",
        "pared": "#4c0f22",
        "og": "bodas",
        "bajada": "Preboda, ceremonia, retratos y fiesta.",
        "descripcion": "Fotografía de bodas en Tacna, Perú: preboda, ceremonia, retratos de pareja y fiesta.",
    },
    {
        "id": "quinceaneras",
        "archivo": "quinceaneras.html",
        "nombre": "Quinceañeras",
        "pared": "#45164f",
        "og": "quinceaneras",
        "bajada": "Sesión, playa, fiesta y detalles.",
        "descripcion": "Fotografía de quinceañeras en Tacna, Perú: sesión de fotos, playa, fiesta y detalles.",
    },
    {
        "id": "familiares",
        "archivo": "familiares.html",
        "nombre": "Familiares",
        "pared": "#0e3a2d",
        "og": "familiares",
        "bajada": "Padres, hijos y hermanos, juntos.",
        "descripcion": "Sesiones de fotos familiares en Tacna, Perú: padres, hijos y hermanos, juntos.",
    },
    {
        "id": "ninos",
        "archivo": "ninos.html",
        "nombre": "Niños",
        "pared": "#523307",
        "og": "ninos",
        "bajada": "Retratos, cumpleaños y sesiones temáticas.",
        "descripcion": "Fotografía infantil en Tacna, Perú: retratos, cumpleaños y sesiones temáticas.",
    },
    {
        "id": "embarazo",
        "archivo": "embarazo.html",
        "nombre": "Embarazo",
        "pared": "#0c3d47",
        "og": "embarazo",
        "bajada": "Sesiones de maternidad, sola o en familia.",
        "descripcion": "Fotografía de embarazo en Tacna, Perú: sesiones de maternidad, sola o en familia.",
    },
    {
        "id": "navidad",
        "archivo": "navidad.html",
        "nombre": "Navidad",
        "pared": "#5b1a12",
        "og": "navidad",
        "bajada": "Sesiones navideñas para niños, parejas y familias.",
        "descripcion": "Sesiones de fotos navideñas en Tacna, Perú, para niños, parejas y familias.",
    },
    {
        "id": "institucionales",
        "archivo": "institucionales.html",
        "nombre": "Institucionales",
        "pared": "#0f2a5c",
        "og": "institucionales",
        "bajada": "Promociones de colegios, graduaciones y productos.",
        "descripcion": "Fotografía institucional en Tacna, Perú: promociones de colegios, graduaciones y fotografía de producto.",
    },
)

for pagina in PAGINAS:
    (RAIZ / pagina["archivo"]).write_text(PLANTILLA.format(**pagina), encoding="utf-8")
    print("Escrita", pagina["archivo"])
