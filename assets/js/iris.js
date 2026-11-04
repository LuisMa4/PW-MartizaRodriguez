/*
 * Diafragma de cámara dibujado en un canvas.
 *
 * El plano se reparte en láminas tipo molinete: cada lámina nace en un lado del
 * polígono central y sigue en línea recta hasta salir de la pantalla. Así las
 * láminas nunca se solapan y el agujero se cierra hasta un punto, igual que en
 * un lente real.
 */
(function () {
  'use strict';

  const LAMINAS = 9;
  const VUELTA = Math.PI * 2;
  const PASO = VUELTA / LAMINAS;
  const FILO = 'rgba(236, 210, 155, 0.6)';

  /* Tope de píxeles del lienzo. Pintar el doble de resolución en pantalla completa
     baja de 60 a 30 cuadros por segundo, y en movimiento la diferencia no se nota. */
  const LIMITE_PIXELES = 1920 * 1080;

  const suavizar = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function aRgb(hex) {
    const valor = parseInt(hex.slice(1), 16);
    return [(valor >> 16) & 255, (valor >> 8) & 255, valor & 255];
  }

  function mezclar(rgb, destino, cantidad) {
    const canal = (i) => Math.round(rgb[i] + (destino[i] - rgb[i]) * cantidad);
    return `rgb(${canal(0)}, ${canal(1)}, ${canal(2)})`;
  }

  class Iris {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.cuadro = 0;
      this.terminar = null;
      this.apertura = 1;
      this.tinte = '#000000';
      this.medir();
    }

    /* Cambiar el tamaño de un canvas lo borra, así que solo se hace si cambió de verdad:
       en los celulares la barra de direcciones dispara resize al desplazarse. */
    medir() {
      const caja = this.canvas.getBoundingClientRect();
      if (caja.width === this.ancho && caja.height === this.alto) return false;
      this.ancho = caja.width;
      this.alto = caja.height;
      const area = Math.max(caja.width * caja.height, 1);
      this.escala = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(LIMITE_PIXELES / area));
      this.canvas.width = Math.round(caja.width * this.escala);
      this.canvas.height = Math.round(caja.height * this.escala);
      return true;
    }

    /* apertura: 0 es cerrado y 1 es completamente abierto. */
    pintar(apertura, color, cx = this.ancho / 2, cy = this.alto / 2) {
      const { ctx, ancho, alto, escala } = this;
      this.apertura = apertura;
      this.cx = cx;
      this.cy = cy;
      ctx.setTransform(escala, 0, 0, escala, 0, 0);
      ctx.clearRect(0, 0, ancho, alto);
      if (apertura >= 1) return;

      const lejos = Math.hypot(Math.max(cx, ancho - cx), Math.max(cy, alto - cy));
      const radio = (lejos / Math.cos(Math.PI / LAMINAS)) * 1.03 * apertura;
      const giro = -0.4 + (1 - apertura) * 1.15;
      const largo = lejos * 3.4;

      const puntos = [];
      const rumbos = [];
      for (let i = 0; i < LAMINAS; i += 1) {
        const angulo = giro + i * PASO;
        puntos.push([cx + radio * Math.cos(angulo), cy + radio * Math.sin(angulo)]);
        const rumbo = angulo - PASO / 2 + Math.PI / 2;
        rumbos.push([Math.cos(rumbo), Math.sin(rumbo)]);
      }

      const base = aRgb(color);
      const esNegro = base.every((canal) => canal === 0);
      const claro = esNegro ? mezclar(base, [150, 118, 62], 0.34) : mezclar(base, [255, 255, 255], 0.13);
      const medio = mezclar(base, [0, 0, 0], 0.18);
      const oscuro = mezclar(base, [0, 0, 0], 0.62);

      for (let i = 0; i < LAMINAS; i += 1) {
        const siguiente = (i + 1) % LAMINAS;
        const [ax, ay] = puntos[i];
        const [bx, by] = puntos[siguiente];
        const [rax, ray] = rumbos[i];
        const [rbx, rby] = rumbos[siguiente];

        const normal = giro + siguiente * PASO - PASO / 2;
        const sombra = ctx.createLinearGradient(
          bx,
          by,
          bx + Math.cos(normal) * lejos * 0.8,
          by + Math.sin(normal) * lejos * 0.8
        );
        sombra.addColorStop(0, claro);
        sombra.addColorStop(0.4, medio);
        sombra.addColorStop(1, oscuro);

        const mx = rax + rbx;
        const my = ray + rby;
        const norma = Math.hypot(mx, my);

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + rbx * largo, by + rby * largo);
        ctx.lineTo(ax + (mx / norma) * largo * 1.4, ay + (my / norma) * largo * 1.4);
        ctx.lineTo(ax + rax * largo, ay + ray * largo);
        ctx.closePath();
        ctx.fillStyle = sombra;
        ctx.fill();
        ctx.lineWidth = 1 / escala;
        ctx.strokeStyle = sombra;
        ctx.stroke();
      }

      ctx.lineWidth = 1;
      ctx.strokeStyle = FILO;
      ctx.beginPath();
      for (let i = 0; i < LAMINAS; i += 1) {
        const siguiente = (i + 1) % LAMINAS;
        const [ax, ay] = puntos[i];
        const [bx, by] = puntos[siguiente];
        const [rbx, rby] = rumbos[siguiente];
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx + rbx * largo, by + rby * largo);
      }
      ctx.stroke();
    }

    /* Solo corre una animación a la vez. La promesa responde true si llegó al final
       y false si otra la reemplazó. El color se puede cambiar a medio camino con `tinte`. */
    animar(desde, hasta, duracion, color, cx, cy) {
      this.detener();
      this.tinte = color;
      return new Promise((listo) => {
        this.terminar = listo;
        const inicio = performance.now();
        const paso = (ahora) => {
          const t = Math.min((ahora - inicio) / duracion, 1);
          this.pintar(desde + (hasta - desde) * suavizar(t), this.tinte, cx, cy);
          if (t < 1) {
            this.cuadro = requestAnimationFrame(paso);
          } else {
            this.terminar = null;
            listo(true);
          }
        };
        this.cuadro = requestAnimationFrame(paso);
      });
    }

    detener() {
      cancelAnimationFrame(this.cuadro);
      if (this.terminar) this.terminar(false);
      this.terminar = null;
    }
  }

  /* Agujero del diafragma como clip-path, para abrir fotos con la misma forma. */
  Iris.recorte = function (cx, cy, radio, giro = 0) {
    const vertices = [];
    for (let i = 0; i < LAMINAS; i += 1) {
      const angulo = giro + i * PASO;
      const x = (cx + radio * Math.cos(angulo)).toFixed(1);
      const y = (cy + radio * Math.sin(angulo)).toFixed(1);
      vertices.push(`${x}px ${y}px`);
    }
    return `polygon(${vertices.join(', ')})`;
  };

  window.Iris = Iris;
})();
