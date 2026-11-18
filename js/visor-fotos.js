// Permite ampliar las fotografías de las galerías (Historia, Campus, Actividades,
// Uniformes y Admisiones).
// Cada fotografía de una galería se convierte en un botón que abre un <dialog>
// con la imagen grande, su título, flechas en bucle y botón de cierre.
// Se carga después de carousel.js y no cambia el funcionamiento de los carruseles.
// Sin JavaScript las fotografías siguen apareciendo normalmente en su sección.

// Galerías: contenedor, elementos y de dónde se toman el título y la descripción ya existentes.
// "fotos" se usa cuando las imágenes de una galería están en secciones distintas.
const galeriasVisor = [
  // Hitos Históricos: título = año, descripción = texto del hito
  { contenedor: '.hitos-historicos__grid', elemento: '.tarjeta', titulo: '.tarjeta__titulo', descripcion: 'p' },
  // Tarjetas de Laboratorios: título de la tarjeta
  { contenedor: '.laboratorios__grid', elemento: '.tarjeta', titulo: '.tarjeta__titulo', descripcion: null },
  // Tarjetas de Actividades (Servicios Extracurriculares): título de la tarjeta
  { contenedor: '.actividades__grid', elemento: '.tarjeta', titulo: '.tarjeta__titulo', descripcion: null },
  // Uniformes (Nosotros - Institución): título de la tarjeta
  { contenedor: '.uniformes__grid', elemento: '.tarjeta', titulo: '.tarjeta__titulo', descripcion: null },
  // Admisiones: imagen introductoria y las tres piezas del proceso en una sola galería;
  // título de la sección y texto alternativo de cada imagen
  { contenedor: '.proceso-admision__grid', fotos: '.admisiones-intro__imagen, .proceso-admision__grid img', tituloSeccion: '.proceso-admision h2', descripcion: 'alt' },
  // Detalle de laboratorio: título de la sección y texto alternativo de cada fotografía
  { contenedor: '.laboratorio-detalle__galeria', elemento: 'img', tituloSeccion: '#titulo-laboratorio-detalle', descripcion: 'alt' }
];

const galeriasEncontradas = galeriasVisor.filter(function (g) {
  return document.querySelector(g.contenedor);
});

if (galeriasEncontradas.length > 0 && typeof HTMLDialogElement === 'function') {
  // ---------- Ventana del visor (se crea una sola vez) ----------
  const visor = document.createElement('dialog');
  visor.className = 'visor';
  visor.setAttribute('aria-labelledby', 'visor-titulo');
  visor.innerHTML =
    '<button type="button" class="visor__cerrar" aria-label="Cerrar visor de fotografías"><span aria-hidden="true">&times;</span></button>' +
    '<button type="button" class="visor__flecha visor__flecha--anterior" aria-label="Fotografía anterior"><span aria-hidden="true">&#8249;</span></button>' +
    '<figure class="visor__figura">' +
      '<figcaption class="visor__leyenda">' +
        '<span class="visor__titulo" id="visor-titulo"></span>' +
        '<span class="visor__descripcion"></span>' +
        '<span class="visor__contador"></span>' +
      '</figcaption>' +
    '</figure>' +
    '<button type="button" class="visor__flecha visor__flecha--siguiente" aria-label="Fotografía siguiente"><span aria-hidden="true">&#8250;</span></button>';
  document.body.appendChild(visor);

  // La imagen se agrega al abrir el visor por primera vez, para no dejar una imagen vacía en la página
  const figuraVisor = visor.querySelector('.visor__figura');
  const imagenVisor = document.createElement('img');
  imagenVisor.className = 'visor__imagen';
  const tituloVisor = visor.querySelector('.visor__titulo');
  const descripcionVisor = visor.querySelector('.visor__descripcion');
  const contadorVisor = visor.querySelector('.visor__contador');
  const botonCerrar = visor.querySelector('.visor__cerrar');
  const botonAnterior = visor.querySelector('.visor__flecha--anterior');
  const botonSiguiente = visor.querySelector('.visor__flecha--siguiente');

  let fotosActuales = [];
  let indiceActual = 0;
  let botonOrigen = null;

  // Muestra en el visor la fotografía indicada de la galería abierta
  function mostrarFoto(indice) {
    // Bucle: después de la última viene la primera, y al revés
    indiceActual = (indice + fotosActuales.length) % fotosActuales.length;
    const foto = fotosActuales[indiceActual];
    imagenVisor.src = foto.src;
    imagenVisor.alt = foto.alt;
    tituloVisor.textContent = foto.titulo;
    descripcionVisor.textContent = foto.descripcion;
    descripcionVisor.hidden = foto.descripcion === '';
    contadorVisor.textContent = 'Fotografía ' + (indiceActual + 1) + ' de ' + fotosActuales.length;
  }

  function abrirVisor(fotos, indice, boton) {
    fotosActuales = fotos;
    botonOrigen = boton;
    if (!imagenVisor.isConnected) {
      figuraVisor.insertBefore(imagenVisor, figuraVisor.firstChild);
    }
    mostrarFoto(indice);
    // Evita que la página de fondo se desplace mientras el visor está abierto
    document.documentElement.classList.add('visor-abierto');
    visor.showModal();
    botonCerrar.focus();
  }

  botonCerrar.addEventListener('click', function () {
    visor.close();
  });

  botonAnterior.addEventListener('click', function () {
    mostrarFoto(indiceActual - 1);
  });

  botonSiguiente.addEventListener('click', function () {
    mostrarFoto(indiceActual + 1);
  });

  // Teclas dentro del visor (Escape lo cierra el propio <dialog>)
  const botonesVisor = [botonCerrar, botonAnterior, botonSiguiente];
  visor.addEventListener('keydown', function (evento) {
    // Tab no sale del visor: del último botón vuelve al primero, y al revés
    if (evento.key === 'Tab') {
      const posicion = botonesVisor.indexOf(document.activeElement);
      const siguiente = evento.shiftKey ? posicion - 1 : posicion + 1;
      botonesVisor[(siguiente + botonesVisor.length) % botonesVisor.length].focus();
      evento.preventDefault();
    } else if (evento.key === 'ArrowLeft') {
      mostrarFoto(indiceActual - 1);
      evento.preventDefault();
    } else if (evento.key === 'ArrowRight') {
      mostrarFoto(indiceActual + 1);
      evento.preventDefault();
    }
  });

  // Un clic en el fondo oscuro (fuera de la fotografía y los botones) cierra el visor
  visor.addEventListener('click', function (evento) {
    if (evento.target === visor) {
      visor.close();
    }
  });

  // Al cerrar (con el botón, con Escape o con el fondo), el foco vuelve a la fotografía de origen
  visor.addEventListener('close', function () {
    document.documentElement.classList.remove('visor-abierto');
    if (botonOrigen) {
      botonOrigen.focus({ preventScroll: true });
    }
  });

  // Deslizar horizontalmente en pantallas táctiles cambia de fotografía
  let inicioToque = null;
  imagenVisor.addEventListener('touchstart', function (evento) {
    inicioToque = evento.changedTouches[0].clientX;
  }, { passive: true });
  imagenVisor.addEventListener('touchend', function (evento) {
    if (inicioToque === null) {
      return;
    }
    const distancia = evento.changedTouches[0].clientX - inicioToque;
    inicioToque = null;
    if (distancia > 50) {
      mostrarFoto(indiceActual - 1);
    } else if (distancia < -50) {
      mostrarFoto(indiceActual + 1);
    }
  });

  // ---------- Fotografías de cada galería ----------
  galeriasEncontradas.forEach(function (galeria) {
    const contenedor = document.querySelector(galeria.contenedor);
    const elementos = galeria.fotos
      ? Array.from(document.querySelectorAll(galeria.fotos))
      : Array.from(contenedor.querySelectorAll(':scope > ' + galeria.elemento));
    const tituloSeccion = galeria.tituloSeccion ? document.querySelector(galeria.tituloSeccion).textContent.trim() : '';
    const fotos = [];
    const botones = [];

    elementos.forEach(function (elemento, i) {
      const imagen = elemento.tagName === 'IMG' ? elemento : elemento.querySelector('img');
      let titulo;
      let descripcion = '';
      if (galeria.tituloSeccion) {
        titulo = tituloSeccion;
        descripcion = imagen.alt;
      } else {
        titulo = elemento.querySelector(galeria.titulo).textContent.trim();
        if (galeria.descripcion) {
          descripcion = elemento.querySelector(galeria.descripcion).textContent.trim();
        }
      }
      fotos.push({ src: imagen.getAttribute('src'), alt: imagen.alt, titulo: titulo, descripcion: descripcion });

      // La fotografía queda dentro de un botón que abre el visor
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'visor-abrir';
      boton.setAttribute('aria-label', 'Ampliar fotografía: ' + titulo + (galeria.tituloSeccion ? ' ' + (i + 1) : ''));
      imagen.parentNode.insertBefore(boton, imagen);
      boton.appendChild(imagen);
      boton.addEventListener('click', function () {
        abrirVisor(fotos, i, boton);
      });
      botones.push(boton);
    });

    // Dentro de un carrusel, solo las fotografías visibles se pueden enfocar con Tab.
    // Así el foco nunca llega a una fotografía oculta ni mueve el carrusel por su cuenta.
    const ventana = contenedor.closest('.carrusel__ventana');
    if (ventana && 'IntersectionObserver' in window) {
      const observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          entrada.target.tabIndex = entrada.intersectionRatio > 0.9 ? 0 : -1;
        });
      }, { root: ventana, threshold: [0, 0.9, 1] });
      botones.forEach(function (boton) {
        observador.observe(boton);
      });
    }
  });
}
