/* Comportamiento del sitio: barras, galerías, visor de fotos y portada con diafragma. */
(function () {
  'use strict';

  const SALAS = [
    { id: 'bodas', nombre: 'Bodas', href: 'bodas.html', pared: '#4c0f22', sesion: 'de boda' },
    { id: 'quinceaneras', nombre: 'Quinceañeras', href: 'quinceaneras.html', pared: '#45164f', sesion: 'de quinceañera' },
    { id: 'familiares', nombre: 'Familiares', href: 'familiares.html', pared: '#0e3a2d', sesion: 'familiar' },
    { id: 'institucionales', nombre: 'Institucionales', href: 'institucionales.html', pared: '#0f2a5c', sesion: 'institucional' },
  ];

  const raiz = document.documentElement;
  const conIris = raiz.classList.contains('con-iris');
  const sala = SALAS.find((item) => item.id === raiz.dataset.sala);
  const sitio = window.SITIO;
  const fotos = window.FOTOS || { salas: {}, portadas: {} };
  const capaIris = document.getElementById('iris');
  const CLAVE_TRANSICION = 'mr-iris';

  const limitar = (valor, minimo, maximo) => Math.min(Math.max(valor, minimo), maximo);
  const pausa = (ms) => new Promise((listo) => setTimeout(listo, ms));

  const enlaceInstagram = `https://www.instagram.com/${sitio.instagram}/`;

  /* Las redes van como iconos en la barra superior y con su nombre en el contacto. */
  const redes = [
    {
      nombre: 'Instagram',
      enlace: enlaceInstagram,
      icono: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
    },
    {
      nombre: 'Facebook',
      enlace: sitio.facebook ? `https://www.facebook.com/${sitio.facebook}` : '',
      icono: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    },
  ].filter((red) => red.enlace);

  const iconoRed = (red) => `<svg viewBox="0 0 24 24" aria-hidden="true">${red.icono}</svg>`;

  /* Las sesiones se coordinan solo por WhatsApp; las redes son para ver su trabajo. */
  const mensaje = sitio.mensajeWhatsapp.replace('{sesion}', sala ? sala.sesion : 'de fotos');
  const enlaceWhatsapp = `https://wa.me/${sitio.whatsapp}?text=${encodeURIComponent(mensaje)}`;

  /* ---------- Barras y cierre ---------- */

  function montarBarras() {
    const iconos = redes
      .map((red) => `<a class="barra__red" href="${red.enlace}" target="_blank" rel="noopener" aria-label="${red.nombre}">${iconoRed(red)}</a>`)
      .join('');

    const enlaces = SALAS.map((item) => {
      const actual = item === sala ? ' aria-current="page"' : '';
      return `<a href="${item.href}" data-sala-enlace="${item.id}"${actual}>${item.nombre}</a>`;
    }).join('');

    document.body.insertAdjacentHTML(
      'beforeend',
      `<header class="barra">
        <a class="barra__marca" href="index.html" aria-label="Maritza Rodríguez Fotografía, inicio">
          <img src="assets/logos/monograma.webp" alt="" width="300" height="240">
        </a>
        <div class="barra__acciones">
          ${iconos}
          <a class="barra__accion" href="${enlaceWhatsapp}" target="_blank" rel="noopener">Coordina tu sesión</a>
        </div>
      </header>
      <nav class="salas" aria-label="Categorías">${enlaces}</nav>`
    );

    document.querySelectorAll('[data-contacto]').forEach((boton) => {
      boton.href = enlaceWhatsapp;
    });
  }

  function montarCierre() {
    const lugar = document.getElementById('cierre');
    if (!lugar) return;

    let siguiente = '';
    if (sala) {
      const destino = SALAS[(SALAS.indexOf(sala) + 1) % SALAS.length];
      siguiente = `<a class="siguiente" href="${destino.href}" style="--pared-siguiente:${destino.pared}">
        <span>Sigue con</span>
        <strong>${destino.nombre}</strong>
      </a>`;
    }

    lugar.innerHTML = `${siguiente}
      <div class="contacto">
        <h2>Coordina tu sesión</h2>
        <p>Cuéntame qué tienes en mente y la fecha que te gustaría.</p>
        <div class="contacto__acciones">
          <a class="boton" href="${enlaceWhatsapp}" target="_blank" rel="noopener">Escribir por WhatsApp</a>
        </div>
        <div class="contacto__redes">
          ${redes.map((red) => `<a href="${red.enlace}" target="_blank" rel="noopener">${iconoRed(red)}${red.nombre}</a>`).join('')}
        </div>
        <img class="contacto__firma" src="assets/logos/firma.webp" alt="Maritza Rodríguez Fotografía" width="1100" height="384" loading="lazy">
        <p class="contacto__ciudad">${sitio.ciudad}</p>
      </div>`;
  }

  /* ---------- Portadas ---------- */

  function fuentes(foto) {
    return foto.lados.map((lado) => `${foto.src}-${lado}.webp ${lado}w`).join(', ');
  }

  function htmlPortada(portada) {
    const horizontal = portada.h;
    const mayor = horizontal.lados[horizontal.lados.length - 1];
    return `<picture>
      <source media="(orientation: portrait)" srcset="${fuentes(portada.v)}" sizes="100vw">
      <img class="fondo" src="${horizontal.src}-${mayor}.webp" srcset="${fuentes(horizontal)}" sizes="100vw" alt="">
    </picture>`;
  }

  /* Una categoría sin fotos muestra el lente casi cerrado en lugar de una galería vacía. */
  function salaCerrada(id) {
    return !fotos.portadas[id];
  }

  /* ---------- Títulos a la medida ---------- */

  function ajustarTitulares() {
    document.querySelectorAll('[data-ajustar]').forEach((titulo) => {
      const contenedor = titulo.parentElement;
      const estilo = getComputedStyle(contenedor);
      const disponible = contenedor.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight);
      titulo.style.fontSize = '100px';
      const medido = titulo.getBoundingClientRect().width;
      if (!medido) return;
      const techo = window.innerHeight * parseFloat(titulo.dataset.ajustar || '0.34');
      const tamano = Math.min((100 * disponible) / medido, techo);
      titulo.style.fontSize = `${tamano.toFixed(1)}px`;
      if (titulo.classList.contains('titular')) raiz.style.setProperty('--tamano-titular', `${tamano.toFixed(1)}px`);
    });
  }

  /* ---------- Galería ---------- */

  const TAMANOS = {
    pleno: '100vw',
    par: '(min-width: 700px) 50vw, 50vw',
    trio: '(min-width: 700px) 33vw, 33vw',
    isla: '(min-width: 700px) 56vw, 84vw',
  };

  function montarGaleria() {
    const lugar = document.getElementById('galeria');
    if (!lugar || !sala) return [];

    const lista = [];
    const html = (fotos.salas[sala.id] || []).map((grupo) => {
      const filas = grupo.filas.map((fila) => {
        const piezas = fila.fotos.map((foto) => {
          const indice = lista.push(foto) - 1;
          const mayor = foto.lados[foto.lados.length - 1];
          const proporcion = (foto.w / foto.h).toFixed(4);
          return `<a class="foto" href="${foto.src}-${mayor}.webp" data-indice="${indice}"
              style="--proporcion:${proporcion};background:${foto.color}" aria-label="Ampliar foto ${indice + 1}">
            <img src="${foto.src}-${foto.lados[0]}.webp" srcset="${fuentes(foto)}" sizes="${TAMANOS[fila.tipo]}"
              width="${foto.w}" height="${foto.h}" alt="${foto.alt}" loading="lazy" decoding="async">
          </a>`;
        });
        return `<div class="fila fila--${fila.tipo}">${piezas.join('')}</div>`;
      });
      const titulo = grupo.titulo ? `<h2 class="grupo__titulo">${grupo.titulo}</h2>` : '';
      return `<section class="grupo">${titulo}${filas.join('')}</section>`;
    });

    lugar.innerHTML = html.join('');
    return lista;
  }

  /* Las fotos a todo el ancho se abren con la forma del diafragma al llegar a ellas. */
  function revelarFotosGrandes() {
    if (!conIris || !('IntersectionObserver' in window)) return;

    const radio = (caja) => Math.hypot(caja.width, caja.height) / 1.8;
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          const contenedor = entrada.target;
          observador.unobserve(contenedor);
          const imagen = contenedor.querySelector('img');
          const caja = contenedor.getBoundingClientRect();
          const cx = caja.width / 2;
          const cy = caja.height / 2;
          imagen.style.clipPath = '';
          imagen.animate(
            [{ clipPath: Iris.recorte(cx, cy, 0, 0.9) }, { clipPath: Iris.recorte(cx, cy, radio(caja), 0) }],
            { duration: 1150, easing: 'cubic-bezier(.7, 0, .2, 1)' }
          );
        });
      },
      { threshold: 0.2 }
    );

    /* El recorte va en la imagen y se observa su contenedor: un elemento recortado
       a cero no llega a contar como visible para el observador. */
    document.querySelectorAll('.fila--pleno .foto').forEach((contenedor) => {
      const caja = contenedor.getBoundingClientRect();
      contenedor.style.background = 'none';
      contenedor.querySelector('img').style.clipPath = Iris.recorte(caja.width / 2, caja.height / 2, 0);
      observador.observe(contenedor);
    });
  }

  /* ---------- Visor de fotos ---------- */

  function montarVisor(lista) {
    if (!lista.length) return;

    document.body.insertAdjacentHTML(
      'beforeend',
      `<div class="visor" role="dialog" aria-modal="true" aria-label="Foto ampliada" hidden>
        <img class="visor__foto" alt="">
        <button class="visor__boton visor__cerrar" type="button" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>
        </button>
        <button class="visor__boton visor__anterior" type="button" aria-label="Foto anterior">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4l-8 8 8 8"/></svg>
        </button>
        <button class="visor__boton visor__siguiente" type="button" aria-label="Foto siguiente">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8"/></svg>
        </button>
        <p class="visor__cuenta" aria-live="polite"></p>
      </div>`
    );

    const visor = document.querySelector('.visor');
    const imagen = visor.querySelector('.visor__foto');
    const cuenta = visor.querySelector('.visor__cuenta');
    const cerrarBoton = visor.querySelector('.visor__cerrar');
    let indice = 0;
    let origen = null;
    let abierto = false;

    function mostrar(nuevo) {
      indice = (nuevo + lista.length) % lista.length;
      const foto = lista[indice];
      imagen.srcset = fuentes(foto);
      imagen.sizes = '100vw';
      imagen.src = `${foto.src}-${foto.lados[foto.lados.length - 1]}.webp`;
      imagen.alt = foto.alt;
      cuenta.textContent = `${indice + 1} de ${lista.length}`;
      [indice + 1, indice - 1].forEach((vecina) => {
        const cercana = lista[(vecina + lista.length) % lista.length];
        new Image().src = `${cercana.src}-${cercana.lados[Math.min(1, cercana.lados.length - 1)]}.webp`;
      });
    }

    function radioPantalla(x, y) {
      return Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) * 1.12;
    }

    function abrir(nuevo, x, y, disparador) {
      origen = { x, y, disparador };
      abierto = true;
      mostrar(nuevo);
      visor.hidden = false;
      raiz.classList.add('visor-abierto');
      history.pushState({ visor: true }, '');
      cerrarBoton.focus({ preventScroll: true });
      if (conIris) {
        visor.animate(
          [{ clipPath: Iris.recorte(x, y, 0, 0.8) }, { clipPath: Iris.recorte(x, y, radioPantalla(x, y), 0) }],
          { duration: 620, easing: 'cubic-bezier(.7, 0, .2, 1)' }
        );
      }
    }

    function terminar() {
      abierto = false;
      raiz.classList.remove('visor-abierto');
      const volver = () => {
        visor.hidden = true;
        imagen.removeAttribute('src');
        imagen.removeAttribute('srcset');
      };
      if (origen) origen.disparador.focus({ preventScroll: true });
      if (conIris && origen) {
        visor.animate(
          [
            { clipPath: Iris.recorte(origen.x, origen.y, radioPantalla(origen.x, origen.y), 0) },
            { clipPath: Iris.recorte(origen.x, origen.y, 0, 0.8) },
          ],
          { duration: 420, easing: 'cubic-bezier(.7, 0, .2, 1)' }
        ).onfinish = volver;
      } else {
        volver();
      }
    }

    function cerrar() {
      if (abierto) history.back();
    }

    document.getElementById('galeria').addEventListener('click', (evento) => {
      const foto = evento.target.closest('.foto');
      if (!foto) return;
      evento.preventDefault();
      const caja = foto.getBoundingClientRect();
      abrir(
        Number(foto.dataset.indice),
        evento.detail ? evento.clientX : caja.left + caja.width / 2,
        evento.detail ? evento.clientY : caja.top + caja.height / 2,
        foto
      );
    });

    cerrarBoton.addEventListener('click', cerrar);
    visor.querySelector('.visor__anterior').addEventListener('click', () => mostrar(indice - 1));
    visor.querySelector('.visor__siguiente').addEventListener('click', () => mostrar(indice + 1));
    visor.addEventListener('click', (evento) => {
      if (evento.target === visor) cerrar();
    });

    window.addEventListener('popstate', () => {
      if (abierto) terminar();
    });

    document.addEventListener('keydown', (evento) => {
      if (!abierto) return;
      if (evento.key === 'Escape') cerrar();
      if (evento.key === 'ArrowRight') mostrar(indice + 1);
      if (evento.key === 'ArrowLeft') mostrar(indice - 1);
      if (evento.key === 'Tab') {
        evento.preventDefault();
        const botones = [...visor.querySelectorAll('button')];
        const actual = botones.indexOf(document.activeElement);
        const salto = evento.shiftKey ? -1 : 1;
        botones[(actual + salto + botones.length) % botones.length].focus();
      }
    });

    let toqueX = null;
    visor.addEventListener('touchstart', (evento) => {
      toqueX = evento.changedTouches[0].clientX;
    }, { passive: true });
    visor.addEventListener('touchend', (evento) => {
      if (toqueX === null) return;
      const recorrido = evento.changedTouches[0].clientX - toqueX;
      toqueX = null;
      if (Math.abs(recorrido) > 50) mostrar(indice + (recorrido < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---------- Transiciones entre páginas ---------- */

  function leerTransicion() {
    try {
      const guardada = JSON.parse(sessionStorage.getItem(CLAVE_TRANSICION));
      sessionStorage.removeItem(CLAVE_TRANSICION);
      return guardada;
    } catch (error) {
      return null;
    }
  }

  function guardarTransicion(datos) {
    try {
      sessionStorage.setItem(CLAVE_TRANSICION, JSON.stringify(datos));
    } catch (error) {
      /* Sin almacenamiento, la siguiente página solo abre desde el centro. */
    }
  }

  function colorDestino(url) {
    const archivo = url.pathname.split('/').pop() || 'index.html';
    const destino = SALAS.find((item) => item.href === archivo);
    return destino ? destino.pared : '#000000';
  }

  function interceptarEnlaces() {
    if (!conIris) return;

    document.addEventListener('click', (evento) => {
      const enlace = evento.target.closest('a[href$=".html"]');
      if (!enlace || evento.defaultPrevented) return;
      if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey || evento.button) return;

      evento.preventDefault();
      const destino = new URL(enlace.href);
      const x = evento.detail ? evento.clientX : innerWidth / 2;
      const y = evento.detail ? evento.clientY : innerHeight / 2;
      const color = colorDestino(destino);
      guardarTransicion({ x: x / innerWidth, y: y / innerHeight, color });

      capaIris.hidden = false;
      capaIris.style.animation = 'none';
      capaIris.style.background = 'transparent';
      new Iris(capaIris).animar(1, 0, 640, color, x, y).then(() => {
        window.location.href = enlace.href;
      });
    });

    window.addEventListener('pageshow', (evento) => {
      if (evento.persisted) capaIris.hidden = true;
    });
  }

  function esperarImagen(imagen, limite) {
    if (!imagen) return Promise.resolve();
    const lista = imagen.decode ? imagen.decode().catch(() => {}) : Promise.resolve();
    return Promise.race([lista, pausa(limite)]);
  }

  /* Abre la página nueva desde el mismo punto donde se cerró la anterior. */
  function abrirPagina(transicion) {
    if (!conIris) return;

    capaIris.style.animation = 'none';
    const omitir = !transicion && !sala;
    if (omitir || (sala && salaCerrada(sala.id))) {
      capaIris.hidden = true;
      return;
    }

    capaIris.style.background = 'transparent';
    const iris = new Iris(capaIris);
    const color = sala ? sala.pared : (transicion && transicion.color) || '#000000';
    const cx = (transicion ? transicion.x : 0.5) * iris.ancho;
    const cy = (transicion ? transicion.y : 0.5) * iris.alto;
    iris.pintar(0, color, cx, cy);

    esperarImagen(document.querySelector('.portada .fondo, .escena.activa .fondo'), 1400)
      .then(() => iris.animar(0, 1, 1200, color, cx, cy))
      .then(() => {
        capaIris.hidden = true;
      });
  }

  /* ---------- Portada de una categoría ---------- */

  function montarPortadaDeSala() {
    const portada = document.querySelector('.portada');
    if (!portada || !sala) return;

    if (!salaCerrada(sala.id)) {
      portada.innerHTML = htmlPortada(fotos.portadas[sala.id]);
      document.querySelectorAll('[data-solo-cerrada]').forEach((elemento) => elemento.remove());
      return;
    }

    raiz.classList.add('sala-cerrada');
    const lienzo = portada.querySelector('canvas');
    const iris = new Iris(lienzo);
    const dibujar = (apertura) => iris.pintar(apertura, sala.pared, iris.ancho / 2, iris.alto * 0.44);
    dibujar(conIris ? 0 : 0.24);
    if (conIris) iris.animar(0, 0.24, 1500, sala.pared, iris.ancho / 2, iris.alto * 0.44);
    window.addEventListener('resize', () => {
      if (iris.medir()) dibujar(0.24);
    });
  }

  /* ---------- Portada principal ---------- */

  function montarEscenario(transicion) {
    const escenario = document.getElementById('escenario');
    if (!escenario) return;

    const escenas = [...escenario.querySelectorAll('.escena')];
    escenas.forEach((escena) => {
      const id = escena.dataset.sala || 'inicio';
      if (fotos.portadas[id]) {
        escena.classList.remove('escena--cerrada');
        escena.insertAdjacentHTML('afterbegin', htmlPortada(fotos.portadas[id]));
      }
    });

    if (!conIris) {
      escenas.forEach((escena) => escena.classList.add('activa'));
      return;
    }

    const fijo = escenario.querySelector('.escenario__fijo');
    const lienzo = escenario.querySelector('.iris-escena');
    const iris = new Iris(lienzo);
    const CENTRO_Y = 0.44;

    const paredes = escenas.map((escena) => {
      const elegida = SALAS.find((item) => item.id === escena.dataset.sala);
      return elegida ? elegida.pared : '#000000';
    });
    const techos = escenas.map((escena) => (escena.classList.contains('escena--cerrada') ? 0.24 : 1));

    /* Lo que debe verse por encima de las láminas se mueve sobre el canvas. */
    const sobrepuestos = [];
    escenas.forEach((escena, posicion) => {
      if (escena.classList.contains('escena--cerrada')) {
        escena.querySelectorAll('.escena__texto').forEach((texto) => texto.setAttribute('data-sobre', ''));
      }
      escena.querySelectorAll('[data-sobre]').forEach((elemento) => {
        elemento.classList.add('sobre');
        fijo.append(elemento);
        sobrepuestos.push({ elemento, posicion });
      });
    });

    const enlacesSalas = [...document.querySelectorAll('[data-sala-enlace]')];
    let visible = -1;
    let enIntro = false;
    let pedido = false;

    function mostrar(posicion) {
      if (posicion === visible) return;
      if (visible >= 0) escenas[visible].classList.remove('activa');
      escenas[posicion].classList.add('activa');
      visible = posicion;
      const id = escenas[posicion].dataset.sala;
      enlacesSalas.forEach((enlace) => {
        enlace.classList.toggle('activo', enlace.dataset.salaEnlace === id);
      });
    }

    function actualizar() {
      pedido = false;
      if (enIntro) return;
      const alto = fijo.offsetHeight || window.innerHeight || 1;
      const ultimo = escenas.length - 1;
      const progreso = limitar((window.scrollY - escenario.offsetTop) / alto, 0, ultimo);
      const tramo = Math.min(Math.floor(progreso), ultimo - 1);
      const avance = progreso - tramo;
      const cercana = avance < 0.5 ? tramo : tramo + 1;
      const abierto = Math.abs(1 - 2 * avance);

      mostrar(cercana);
      iris.pintar(Math.pow(abierto, 1.5) * techos[cercana], paredes[tramo + 1], iris.ancho / 2, iris.alto * CENTRO_Y);

      sobrepuestos.forEach(({ elemento, posicion }) => {
        const activo = posicion === cercana;
        elemento.style.opacity = activo ? limitar((abierto - 0.45) / 0.45, 0, 1) : 0;
        elemento.style.visibility = activo ? 'visible' : 'hidden';
      });
    }

    function pedirActualizacion() {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(actualizar);
    }

    function cancelarIntro() {
      if (!enIntro) return;
      enIntro = false;
      iris.detener();
      raiz.classList.remove('intro');
      pedirActualizacion();
    }

    function ajustarLienzo() {
      const cambio = iris.medir();
      if (cambio && enIntro) iris.pintar(0, '#000000', iris.ancho / 2, iris.alto * CENTRO_Y);
      pedirActualizacion();
    }

    /* Al dejar de desplazarse, la página sigue hasta la parada siguiente en esa
       dirección. Se hace aquí y no con scroll-snap porque el anclaje del navegador
       devuelve a la parada anterior los giros cortos de la rueda del ratón. */
    let ultimaY = window.scrollY;
    let direccion = 1;
    let tocando = false;
    let espera = 0;

    function asentar() {
      if (tocando || enIntro) return;
      const alto = fijo.offsetHeight || window.innerHeight;
      const posicion = (window.scrollY - escenario.offsetTop) / alto;
      if (posicion <= 0 || posicion >= escenas.length) return;
      if (Math.abs(posicion - Math.round(posicion)) < 0.004) return;
      const parada = direccion > 0 ? Math.ceil(posicion) : Math.floor(posicion);
      window.scrollTo({ top: escenario.offsetTop + parada * alto, behavior: 'smooth' });
    }

    function programarAsiento() {
      clearTimeout(espera);
      espera = setTimeout(asentar, 130);
    }

    window.addEventListener('scroll', () => {
      if (enIntro && window.scrollY > 4) cancelarIntro();
      const y = window.scrollY;
      if (y !== ultimaY) direccion = y > ultimaY ? 1 : -1;
      ultimaY = y;
      pedirActualizacion();
      programarAsiento();
    }, { passive: true });
    window.addEventListener('touchstart', () => {
      tocando = true;
    }, { passive: true });
    window.addEventListener('touchend', () => {
      tocando = false;
      programarAsiento();
    }, { passive: true });
    window.addEventListener('resize', ajustarLienzo);

    const flecha = document.querySelector('.desliza');
    if (flecha) {
      flecha.addEventListener('click', () => {
        window.scrollTo({ top: fijo.offsetHeight, behavior: 'smooth' });
      });
    }

    mostrar(0);
    actualizar();

    if (window.scrollY < 5 && !transicion) {
      enIntro = true;
      raiz.classList.add('intro');
      iris.pintar(0, '#000000', iris.ancho / 2, iris.alto * CENTRO_Y);
      esperarImagen(escenas[0].querySelector('.fondo'), 1800)
        .then(() => pausa(750))
        .then(() => (enIntro ? iris.animar(0, 1, 1900, '#000000', iris.ancho / 2, iris.alto * CENTRO_Y) : null))
        .then(() => {
          if (!enIntro) return;
          enIntro = false;
          raiz.classList.remove('intro');
          actualizar();
        });
    }
  }

  /* ---------- Arranque ---------- */

  const transicion = conIris ? leerTransicion() : null;

  montarBarras();
  montarCierre();
  montarPortadaDeSala();
  montarEscenario(transicion);
  const lista = montarGaleria();
  montarVisor(lista);
  revelarFotosGrandes();
  interceptarEnlaces();
  ajustarTitulares();
  abrirPagina(transicion);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarTitulares);
  window.addEventListener('resize', ajustarTitulares);
})();
