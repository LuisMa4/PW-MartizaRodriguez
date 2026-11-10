/* Comportamiento del sitio: barras, galerías, visor de fotos y animación del diafragma. */
(function () {
  'use strict';

  const SALAS = [
    { id: 'bodas', nombre: 'Bodas', href: 'bodas.html', pared: '#4c0f22' },
    { id: 'quinceaneras', nombre: 'Quinceañeras', href: 'quinceaneras.html', pared: '#45164f' },
    { id: 'familiares', nombre: 'Familiares', href: 'familiares.html', pared: '#0e3a2d' },
    { id: 'ninos', nombre: 'Niños', href: 'ninos.html', pared: '#523307' },
    { id: 'embarazo', nombre: 'Embarazo', href: 'embarazo.html', pared: '#0c3d47' },
    { id: 'navidad', nombre: 'Navidad', href: 'navidad.html', pared: '#5b1a12' },
    { id: 'institucionales', nombre: 'Institucionales', href: 'institucionales.html', pared: '#0f2a5c' },
  ];

  const raiz = document.documentElement;
  const conIris = raiz.classList.contains('con-iris');
  const sala = SALAS.find((item) => item.id === raiz.dataset.sala);
  const sitio = window.SITIO;
  const fotos = window.FOTOS || { salas: {}, portadas: {} };
  const capaIris = document.getElementById('iris');
  const CLAVE_TRANSICION = 'mr-iris';

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
  const enlaceWhatsapp = `https://wa.me/${sitio.whatsapp}?text=${encodeURIComponent(sitio.mensajeWhatsapp)}`;

  /* ---------- Barras y cierre ---------- */

  function montarBarras() {
    const iconos = redes
      .map((red) => `<a class="barra__red" href="${red.enlace}" target="_blank" rel="noopener" aria-label="${red.nombre}">${iconoRed(red)}</a>`)
      .join('');

    const enlaces = SALAS.map((item) => {
      const actual = item === sala ? ' aria-current="page"' : '';
      return `<a href="${item.href}" data-sala-enlace="${item.id}"${actual}>${item.nombre}</a>`;
    }).join('');

    /* En el inicio va la marca; en una categoría, un botón claro para volver al inicio. */
    const izquierda = sala
      ? `<a class="barra__accion barra__regresar" href="index.html" aria-label="Regresar al inicio">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
          <span>Regresar</span>
        </a>`
      : `<a class="barra__marca" href="index.html" aria-label="Maritza Rodríguez Fotografía, inicio">
          <img src="assets/logos/monograma.webp" alt="" width="300" height="240">
        </a>`;

    document.body.insertAdjacentHTML(
      'beforeend',
      `<header class="barra">
        ${izquierda}
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

    /* En pantallas angostas no caben todas las categorías: el menú se desliza de
       lado, con la categoría actual al centro y un desvanecido que avisa que hay más. */
    const menu = document.querySelector('.salas');
    const actual = menu.querySelector('[aria-current]');
    function medirMenu() {
      menu.classList.toggle('salas--desliza', menu.scrollWidth > menu.clientWidth + 1);
      if (actual) menu.scrollLeft = actual.offsetLeft - (menu.clientWidth - actual.offsetWidth) / 2;
    }
    medirMenu();
    window.addEventListener('resize', medirMenu);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirMenu);
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
            { duration: 750, easing: 'cubic-bezier(.7, 0, .2, 1)' }
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

  const archivoDe = (url) => url.pathname.split('/').pop() || 'index.html';
  const salaDe = (url) => SALAS.find((item) => item.href === archivoDe(url));

  /* Abrir y cerrar comparten un solo diafragma. Si llegan más clics mientras se
     cierra, solo cambia el destino: gana el último y se navega una sola vez. */
  let cortina = null;
  let salida = null;

  function prepararCortina() {
    capaIris.hidden = false;
    capaIris.style.animation = 'none';
    capaIris.style.background = 'transparent';
    if (cortina) cortina.medir();
    else cortina = new Iris(capaIris);
    return cortina;
  }

  function salirHacia(destino, x, y) {
    const elegida = salaDe(destino);
    const color = elegida ? elegida.pared : '#000000';
    const enCamino = Boolean(salida);
    const iris = enCamino ? cortina : prepararCortina();

    /* Si el diafragma ya se está moviendo, sigue desde donde está y no salta. */
    const enMovimiento = iris.apertura < 1;
    const cx = enMovimiento ? iris.cx : x;
    const cy = enMovimiento ? iris.cy : y;

    salida = destino.href;
    iris.tinte = color;
    guardarTransicion({ x: cx / innerWidth, y: cy / innerHeight, color });
    if (enCamino) return;

    iris.animar(iris.apertura, 0, 160 + 300 * iris.apertura, color, cx, cy).then((terminado) => {
      if (terminado) window.location.href = salida;
    });
  }

  function interceptarEnlaces() {
    if (!conIris) return;

    document.addEventListener('click', (evento) => {
      const enlace = evento.target.closest('a[href$=".html"]');
      if (!enlace || evento.defaultPrevented) return;
      if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey || evento.button) return;

      evento.preventDefault();
      const destino = new URL(enlace.href);
      if (archivoDe(destino) === archivoDe(window.location)) {
        window.scrollTo({ top: 0 });
        return;
      }
      salirHacia(
        destino,
        evento.detail ? evento.clientX : innerWidth / 2,
        evento.detail ? evento.clientY : innerHeight / 2
      );
    });

    /* Al volver con el botón Atrás, el navegador restaura la página tal como quedó. */
    window.addEventListener('pageshow', (evento) => {
      if (!evento.persisted) return;
      salida = null;
      if (cortina) {
        cortina.detener();
        cortina.apertura = 1;
      }
      capaIris.hidden = true;
    });
  }

  /* Al acercarse a un enlace se adelanta la página y su portada, para que el
     diafragma no tenga que quedarse cerrado esperando la carga. */
  function anticiparPaginas() {
    const vistas = new Set();

    function anticipar(evento) {
      const enlace = evento.target.closest && evento.target.closest('a[href$=".html"]');
      if (!enlace || vistas.has(enlace.href)) return;
      vistas.add(enlace.href);
      document.head.insertAdjacentHTML('beforeend', `<link rel="prefetch" href="${enlace.href}">`);

      const elegida = salaDe(new URL(enlace.href));
      const portada = elegida && fotos.portadas[elegida.id];
      if (!portada) return;
      const imagen = new Image();
      imagen.sizes = '100vw';
      imagen.srcset = fuentes(matchMedia('(orientation: portrait)').matches ? portada.v : portada.h);
    }

    ['pointerover', 'focusin', 'touchstart'].forEach((tipo) => {
      document.addEventListener(tipo, anticipar, { passive: true });
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

    const iris = prepararCortina();
    const color = sala ? sala.pared : (transicion && transicion.color) || '#000000';
    const cx = (transicion ? transicion.x : 0.5) * iris.ancho;
    const cy = (transicion ? transicion.y : 0.5) * iris.alto;
    iris.pintar(0, color, cx, cy);

    esperarImagen(document.querySelector('.portada .fondo, .escena.activa .fondo'), 900)
      .then(() => (salida ? false : iris.animar(0, 1, 800, color, cx, cy)))
      .then((terminado) => {
        if (terminado) capaIris.hidden = true;
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

  /* ---------- Animación del inicio ---------- */

  /* Las escenas pasan solas con el diafragma y el desplazamiento de la página queda
     libre. El tiempo de cada escena lo lleva la animación CSS de su marca de avance:
     así pausar es detener esa animación y no hay temporizadores que coordinar. */
  function montarVitrina(transicion) {
    const vitrina = document.getElementById('vitrina');
    if (!vitrina) return;

    /* Una categoría sin fotos entra sola a la animación cuando las tenga. */
    vitrina.querySelectorAll('.escena[data-sala]').forEach((escena) => {
      if (salaCerrada(escena.dataset.sala)) escena.remove();
    });

    const escenas = [...vitrina.querySelectorAll('.escena')];
    const idDe = (escena) => escena.dataset.sala || 'inicio';

    function cargar(escena) {
      if (!escena.querySelector('.fondo')) {
        escena.insertAdjacentHTML('afterbegin', htmlPortada(fotos.portadas[idDe(escena)]));
      }
      return escena.querySelector('.fondo');
    }

    const primera = cargar(escenas[0]);
    if (!conIris) return;

    const salaDeEscena = (escena) => SALAS.find((item) => item.id === idDe(escena));
    const paredes = escenas.map((escena) => (salaDeEscena(escena) ? salaDeEscena(escena).pared : '#000000'));

    vitrina.insertAdjacentHTML(
      'beforeend',
      `<div class="vitrina__controles">
        <div class="vitrina__marcas">
          ${escenas
            .map((escena) => {
              const elegida = salaDeEscena(escena);
              return `<button type="button" aria-label="Ver ${elegida ? elegida.nombre : 'la portada'}"><span><i></i></span></button>`;
            })
            .join('')}
        </div>
        <button class="vitrina__pausa" type="button" aria-label="Pausar la animación">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path class="icono-pausar" d="M9 6v12M15 6v12"/>
            <path class="icono-seguir" d="M8 5.5l10.5 6.5L8 18.5z"/>
          </svg>
        </button>
      </div>`
    );

    const iris = new Iris(vitrina.querySelector('.iris-escena'));
    const marcas = [...vitrina.querySelectorAll('.vitrina__marcas button')];
    const botonPausa = vitrina.querySelector('.vitrina__pausa');
    const centro = () => [iris.ancho / 2, iris.alto * 0.44];

    let actual = 0;
    let destino = 0;
    let cerrando = false;
    let enPausa = false;
    let fuera = false;
    let conFoco = false;

    function mostrar(posicion) {
      escenas[actual].classList.remove('activa');
      escenas[posicion].classList.add('activa');
      actual = posicion;
      marcas.forEach((marca, indice) => {
        marca.classList.remove('llenando');
        marca.classList.toggle('vista', indice < posicion);
        if (indice === posicion) marca.setAttribute('aria-current', 'true');
        else marca.removeAttribute('aria-current');
      });
    }

    function esperarEnEscena() {
      marcas[actual].classList.add('llenando');
      cargar(escenas[(actual + 1) % escenas.length]);
    }

    /* Como en las transiciones entre páginas, gana el último pedido. */
    function cambiarA(posicion) {
      destino = posicion;
      if (cerrando) return;
      cerrando = true;
      marcas[actual].classList.replace('llenando', 'vista');

      const [cx, cy] = centro();
      esperarImagen(cargar(escenas[posicion]), 1500)
        .then(() => iris.animar(iris.apertura, 0, 240 + 520 * iris.apertura, paredes[destino], cx, cy))
        .then(() => esperarImagen(cargar(escenas[destino]), 1500))
        .then(() => {
          cerrando = false;
          mostrar(destino);
          return iris.animar(0, 1, 950, paredes[actual], cx, cy);
        })
        .then((terminado) => {
          if (terminado) esperarEnEscena();
        });
    }

    function actualizarPausa() {
      vitrina.classList.toggle('quieta', enPausa || fuera || conFoco || document.hidden);
    }

    vitrina.querySelector('.vitrina__marcas').addEventListener('animationend', () => {
      cambiarA((actual + 1) % escenas.length);
    });

    marcas.forEach((marca, posicion) => {
      marca.addEventListener('click', () => {
        if (posicion !== actual || cerrando) cambiarA(posicion);
      });
    });

    botonPausa.addEventListener('click', () => {
      enPausa = !enPausa;
      botonPausa.classList.toggle('en-pausa', enPausa);
      botonPausa.setAttribute('aria-label', enPausa ? 'Seguir la animación' : 'Pausar la animación');
      actualizarPausa();
    });

    /* Con el teclado, la escena no cambia mientras se está en uno de sus enlaces. */
    vitrina.addEventListener('focusin', (evento) => {
      conFoco = evento.target.matches(':focus-visible');
      actualizarPausa();
    });
    vitrina.addEventListener('focusout', () => {
      conFoco = false;
      actualizarPausa();
    });

    /* Fuera de la vista no hace falta animar nada. */
    document.addEventListener('visibilitychange', actualizarPausa);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        ([entrada]) => {
          fuera = !entrada.isIntersecting;
          actualizarPausa();
        },
        { threshold: 0.3 }
      ).observe(vitrina);
    }

    window.addEventListener('resize', () => {
      if (!iris.medir()) return;
      const [cx, cy] = centro();
      iris.pintar(iris.apertura, paredes[destino], cx, cy);
    });

    mostrar(0);

    if (transicion) {
      esperarEnEscena();
      return;
    }

    raiz.classList.add('intro');
    const [cx, cy] = centro();
    iris.pintar(0, '#000000', cx, cy);
    esperarImagen(primera, 1800)
      .then(() => pausa(450))
      .then(() => iris.animar(0, 1, 1500, '#000000', cx, cy))
      .then(() => {
        raiz.classList.remove('intro');
        esperarEnEscena();
      });
  }

  /* ---------- Categorías del inicio ---------- */

  function montarCategorias() {
    const lugar = document.getElementById('categorias-lista');
    if (!lugar) return;

    lugar.innerHTML = SALAS.map((item) => {
      const portada = fotos.portadas[item.id];
      if (!portada) {
        return `<a class="tarjeta tarjeta--cerrada" href="${item.href}" style="--pared-tarjeta:${item.pared}">
          <canvas aria-hidden="true" data-pared="${item.pared}"></canvas>
          <span class="lente-m"><img src="assets/logos/monograma.webp" alt="" width="300" height="240" loading="lazy"></span>
          <strong>${item.nombre}</strong>
        </a>`;
      }
      const foto = portada.v;
      return `<a class="tarjeta" href="${item.href}" style="--pared-tarjeta:${item.pared}">
        <img src="${foto.src}-${foto.lados[0]}.webp" srcset="${fuentes(foto)}" sizes="(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw"
          alt="" loading="lazy" decoding="async">
        <strong>${item.nombre}</strong>
      </a>`;
    }).join('');

    lugar.querySelectorAll('canvas').forEach((lienzo) => {
      const iris = new Iris(lienzo);
      const dibujar = () => iris.pintar(0.32, lienzo.dataset.pared, iris.ancho / 2, iris.alto * 0.44);
      dibujar();
      window.addEventListener('resize', () => {
        if (iris.medir()) dibujar();
      });
    });
  }

  /* ---------- Arranque ---------- */

  const transicion = conIris ? leerTransicion() : null;

  montarBarras();
  montarCierre();
  montarPortadaDeSala();
  montarVitrina(transicion);
  montarCategorias();
  const lista = montarGaleria();
  montarVisor(lista);
  revelarFotosGrandes();
  interceptarEnlaces();
  anticiparPaginas();
  ajustarTitulares();
  abrirPagina(transicion);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarTitulares);
  window.addEventListener('resize', ajustarTitulares);
})();
