#!/usr/bin/env python3
"""Genera las fotos optimizadas del sitio a partir de scripts/fotos.json.

Lee los originales, crea versiones WebP en varios tamaños dentro de
assets/fotos/ y escribe assets/js/fotos.js, el archivo que usa la página para
armar las galerías. Las fotos que ya existen se saltan, así que para sumar
fotos nuevas basta con agregarlas a fotos.json y volver a ejecutarlo:

    python scripts/preparar_fotos.py
"""

import json
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

from PIL import Image, ImageCms, ImageOps

RAIZ = Path(__file__).resolve().parents[1]
MANIFIESTO = RAIZ / "scripts" / "fotos.json"
SALIDA = RAIZ / "assets" / "fotos"
DATOS = RAIZ / "assets" / "js" / "fotos.js"
OG = RAIZ / "assets" / "og"

LADOS_GALERIA = (800, 1400, 2200)  # lado mayor de cada versión, en píxeles
LADOS_PORTADA_H = (1280, 2400)
LADOS_PORTADA_V = (900, 1600)
CALIDAD = 80
EXTENSIONES = {".jpg", ".jpeg", ".png"}


def abrir(origen, lado_maximo):
    """Abre una foto, la endereza según su EXIF y la pasa a sRGB."""
    imagen = Image.open(origen)
    perfil = imagen.info.get("icc_profile")
    imagen.draft("RGB", (lado_maximo, lado_maximo))
    imagen = ImageOps.exif_transpose(imagen).convert("RGB")
    if perfil:
        try:
            entrada = ImageCms.ImageCmsProfile(__import__("io").BytesIO(perfil))
            if "srgb" not in ImageCms.getProfileName(entrada).lower():
                imagen = ImageCms.profileToProfile(
                    imagen, entrada, ImageCms.createProfile("sRGB"), outputMode="RGB"
                )
        except (OSError, ImageCms.PyCMSError):
            pass  # un perfil dañado no debe detener todo el proceso
    return imagen


def lados_validos(mayor, lados):
    """Quita los tamaños que obligarían a agrandar la foto."""
    validos = [lado for lado in lados if lado < mayor]
    return validos + [min(mayor, lados[-1])]


def procesar(tarea):
    """Crea las versiones de una foto y devuelve sus datos para la galería."""
    origen, base, lados = tarea
    base = Path(base)
    base.parent.mkdir(parents=True, exist_ok=True)

    existentes = sorted(
        base.parent.glob(f"{base.name}-*.webp"),
        key=lambda ruta: int(ruta.stem.rsplit("-", 1)[1]),
    )
    if existentes:
        lados_hechos = [int(r.stem.rsplit("-", 1)[1]) for r in existentes]
        with Image.open(existentes[-1]) as grande:
            ancho, alto = grande.size
            promedio = grande.convert("RGB").resize((1, 1), Image.Resampling.BOX)
        color = "#%02x%02x%02x" % promedio.getpixel((0, 0))
        return {"w": ancho, "h": alto, "color": color, "lados": lados_hechos}

    imagen = abrir(origen, max(lados))
    mayor = max(imagen.size)
    finales = lados_validos(mayor, lados)
    ancho, alto = imagen.size
    for lado in finales:
        escala = lado / mayor
        copia = imagen.resize(
            (round(imagen.width * escala), round(imagen.height * escala)),
            Image.Resampling.LANCZOS,
        )
        copia.save(f"{base}-{lado}.webp", "WEBP", quality=CALIDAD, method=5)
        ancho, alto = copia.size
    promedio = imagen.resize((1, 1), Image.Resampling.BOX).getpixel((0, 0))
    return {"w": ancho, "h": alto, "color": "#%02x%02x%02x" % promedio, "lados": finales}


def ubicar(referencia, fuentes):
    """Convierte 'coso:Carpeta/IMG_0001' en la ruta real del archivo."""
    alias, relativa = referencia.split(":", 1)
    carpeta = (RAIZ / fuentes[alias] / relativa).parent
    nombre = Path(relativa).name
    for candidato in carpeta.iterdir():
        if candidato.stem == nombre and candidato.suffix.lower() in EXTENSIONES:
            return candidato
    raise FileNotFoundError(f"No encontré la foto {referencia} en {carpeta}")


def crear_og(sala, origen):
    """Imagen de 1200 x 630 que aparece al compartir el enlace."""
    destino = OG / f"{sala}.jpg"
    if destino.exists():
        return
    OG.mkdir(parents=True, exist_ok=True)
    recorte = ImageOps.fit(abrir(origen, 2000), (1200, 630), Image.Resampling.LANCZOS)
    recorte.save(destino, "JPEG", quality=84, optimize=True, progressive=True)


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    manifiesto = json.loads(MANIFIESTO.read_text(encoding="utf-8"))
    fuentes = manifiesto["fuentes"]

    tareas = []
    salas = {}
    portadas = {}
    for sala, grupos in manifiesto["salas"].items():
        salas[sala] = []
        for grupo in grupos:
            filas = []
            for tipo, *referencias in grupo["filas"]:
                fotos = []
                for referencia in referencias:
                    base = SALIDA / sala / Path(referencia.split(":", 1)[1]).name
                    tareas.append((str(ubicar(referencia, fuentes)), str(base), LADOS_GALERIA))
                    fotos.append({"src": base.relative_to(RAIZ).as_posix(), "tarea": len(tareas) - 1})
                filas.append({"tipo": tipo, "fotos": fotos})
            salas[sala].append({"titulo": grupo["titulo"], "alt": grupo["alt"], "filas": filas})

    for sala, par in manifiesto["portadas"].items():
        portadas[sala] = {}
        for orientacion, lados in (("h", LADOS_PORTADA_H), ("v", LADOS_PORTADA_V)):
            base = SALIDA / "portadas" / f"{sala}-{orientacion}"
            tareas.append((str(ubicar(par[orientacion], fuentes)), str(base), lados))
            portadas[sala][orientacion] = {
                "src": base.relative_to(RAIZ).as_posix(),
                "tarea": len(tareas) - 1,
            }

    print(f"Procesando {len(tareas)} fotos…")
    with ProcessPoolExecutor() as grupo_procesos:
        resultados = list(grupo_procesos.map(procesar, tareas))

    def completar(foto, alt=None):
        datos = {"src": foto["src"], **resultados[foto["tarea"]]}
        if alt:
            datos["alt"] = alt
        return datos

    for grupos in salas.values():
        for grupo in grupos:
            alt = grupo.pop("alt")
            for fila in grupo["filas"]:
                fila["fotos"] = [completar(foto, alt) for foto in fila["fotos"]]
    for par in portadas.values():
        for orientacion in par:
            par[orientacion] = completar(par[orientacion])

    for sala, par in manifiesto["portadas"].items():
        crear_og(sala, ubicar(par["h"], fuentes))

    salida = json.dumps({"salas": salas, "portadas": portadas}, ensure_ascii=False, separators=(",", ":"))
    DATOS.write_text(
        "// Archivo generado por scripts/preparar_fotos.py. No editar a mano.\n"
        f"window.FOTOS = {salida};\n",
        encoding="utf-8",
    )
    total = sum(1 for _ in SALIDA.rglob("*.webp"))
    peso = sum(ruta.stat().st_size for ruta in SALIDA.rglob("*.webp")) / 1024 / 1024
    print(f"Listo: {total} archivos, {peso:.1f} MB en assets/fotos")


if __name__ == "__main__":
    main()
