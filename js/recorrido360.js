// Recorrido 360° de Campus.
// Cada espacio es una fotoesfera convertida en las seis caras de un cubo; la cámara
// está en el centro y el visitante gira la vista con el mouse, el dedo o el teclado.
// Las fotografías de un espacio se descargan solo cuando el visitante lo elige.
// Sin JavaScript se ve la pieza gráfica de la sección con un aviso.

const recorrido = document.querySelector('.recorrido360');

if (recorrido) {
  const escena = recorrido.querySelector('.recorrido360__escena');
  const cubo = recorrido.querySelector('.recorrido360__cubo');
  const caras = recorrido.querySelectorAll('.recorrido360__cara');
  const portada = recorrido.querySelector('.recorrido360__portada');
  const ayuda = recorrido.querySelector('.recorrido360__ayuda');
  const estado = recorrido.querySelector('.recorrido360__estado');
  const botonesEspacio = recorrido.querySelectorAll('.recorrido360__espacio');
  const botonInicio = recorrido.querySelector('.recorrido360__boton--inicio');
  const botonCompleta = recorrido.querySelector('.recorrido360__boton--completa');
  const visor = recorrido.querySelector('.recorrido360__visor');
  const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pantallaTactil = window.matchMedia('(pointer: coarse)').matches;

  // Orden de las caras en el HTML (frente, derecha, atrás, izquierda, arriba, abajo)
  const nombresCaras = ['frente', 'derecha', 'atras', 'izquierda', 'arriba', 'abajo'];
  const LIMITE_VERTICAL = 85;   // no se puede pasar del cenit ni del nadir

  let yaw = 0;                  // giro horizontal en grados (positivo = mirar a la derecha)
  let pitch = 0;                // giro vertical (positivo = mirar arriba)
  let yawInicial = 0;
  let campoVertical = 75;
  let perspectiva = 500;
  let animacion = null;
  let animando = false;
  let objetivoYaw = 0;
  let objetivoPitch = 0;
  let cargaActual = 0;          // evita que una carga anterior termine encima de la nueva

  // Activa la versión interactiva: aparecen las tarjetas de espacios
  recorrido.querySelector('.recorrido360__sin-js').hidden = true;
  recorrido.querySelector('.recorrido360__intro').hidden = false;
  recorrido.querySelector('.recorrido360__espacios').hidden = false;

  // Indicaciones distintas para pantallas táctiles y para mouse y teclado
  ayuda.textContent = pantallaTactil
    ? 'Desliza con el dedo para mirar alrededor'
    : 'Arrastra para mirar alrededor · Usa las flechas del teclado';

  // El campo de visión se amplía en pantallas angostas (celular vertical),
  // para que a lo ancho se vean al menos unos 65 grados
  function ajustarPerspectiva() {
    const ancho = escena.clientWidth;
    const alto = escena.clientHeight;
    if (!alto) {
      return;
    }
    const proporcion = ancho / alto;
    const necesario = 2 * Math.atan(Math.tan(32.5 * Math.PI / 180) / proporcion) * 180 / Math.PI;
    campoVertical = Math.min(95, Math.max(75, necesario));
    perspectiva = alto / 2 / Math.tan((campoVertical / 2) * Math.PI / 180);
    escena.style.perspective = perspectiva + 'px';
    escena.dataset.campo = campoVertical.toFixed(2);
    dibujar();
  }

  // Coloca la cámara en el centro del cubo y aplica los giros
  function dibujar() {
    pitch = Math.max(-LIMITE_VERTICAL, Math.min(LIMITE_VERTICAL, pitch));
    yaw = ((yaw % 360) + 540) % 360 - 180;   // siempre entre -180 y 180, sin límite al girar
    cubo.style.transform = 'translateZ(' + perspectiva + 'px) rotateX(' + pitch + 'deg) rotateY(' + yaw + 'deg)';
    escena.dataset.yaw = yaw.toFixed(1);
    escena.dataset.pitch = pitch.toFixed(1);
  }

  function ocultarAyuda() {
    ayuda.classList.add('recorrido360__ayuda--oculta');
  }

  // Gira suavemente hasta una orientación (inmediato con movimiento reducido)
  function girarHasta(nuevoYaw, nuevoPitch, duracion) {
    cancelAnimationFrame(animacion);
    objetivoYaw = nuevoYaw;
    objetivoPitch = nuevoPitch;
    if (menosMovimiento || duracion === 0) {
      animando = false;
      yaw = nuevoYaw;
      pitch = nuevoPitch;
      dibujar();
      return;
    }
    const inicioYaw = yaw;
    const inicioPitch = pitch;
    const diferencia = ((nuevoYaw - inicioYaw) % 360 + 540) % 360 - 180;   // camino más corto
    const inicio = performance.now();
    function paso(ahora) {
      const t = Math.min((ahora - inicio) / duracion, 1);
      const suave = 1 - Math.pow(1 - t, 3);
      yaw = inicioYaw + diferencia * suave;
      pitch = inicioPitch + (nuevoPitch - inicioPitch) * suave;
      dibujar();
      if (t < 1) {
        animacion = requestAnimationFrame(paso);
      } else {
        animando = false;
      }
    }
    animando = true;
    animacion = requestAnimationFrame(paso);
  }

  // ---------- Carga de un espacio ----------

  function rutaCara(espacio, cara) {
    return '../assets/images/campus/recorrido-360/' + espacio + '/' + cara + '.jpg';
  }

  // Descarga una imagen y espera a que esté lista para mostrarse.
  // La misma imagen se coloca luego en la cara del cubo, así cada archivo se lee una sola vez.
  function precargar(ruta) {
    return new Promise(function (resolver, rechazar) {
      const imagen = new Image();
      imagen.alt = '';
      imagen.draggable = false;
      imagen.className = 'recorrido360__textura';
      imagen.onload = function () {
        resolver(imagen);
      };
      imagen.onerror = function () {
        rechazar(ruta);
      };
      imagen.src = ruta;
    });
  }

  function mostrarEstado(texto, esError) {
    estado.textContent = texto;
    estado.classList.toggle('recorrido360__estado--error', esError);
    estado.hidden = false;
  }

  function abrirEspacio(boton) {
    const espacio = boton.dataset.espacio;
    const nombre = boton.querySelector('.recorrido360__nombre').textContent;
    const numeroCarga = ++cargaActual;

    botonesEspacio.forEach(function (otro) {
      otro.setAttribute('aria-pressed', otro === boton ? 'true' : 'false');
    });

    // La primera vez se cambia la portada por el visor
    portada.hidden = true;
    escena.hidden = false;
    ajustarPerspectiva();
    escena.setAttribute('aria-label', 'Vista panorámica de 360 grados: ' + nombre);
    mostrarEstado('Cargando ' + nombre + '…', false);
    escena.classList.add('recorrido360__escena--cargando');

    Promise.all(nombresCaras.map(function (cara) {
      return precargar(rutaCara(espacio, cara));
    })).then(function (imagenes) {
      if (numeroCarga !== cargaActual) {
        return;   // el visitante ya eligió otro espacio
      }
      // Las imágenes del espacio anterior se retiran y se colocan las nuevas
      caras.forEach(function (cara, i) {
        cara.replaceChildren(imagenes[i]);
      });
      escena.classList.remove('recorrido360__escena--cargando');
      estado.hidden = true;
      yawInicial = Number(boton.dataset.inicio) || 0;
      girarHasta(yawInicial, 0, 0);
    }).catch(function () {
      if (numeroCarga !== cargaActual) {
        return;
      }
      escena.classList.remove('recorrido360__escena--cargando');
      mostrarEstado('No fue posible cargar «' + nombre + '». Intenta de nuevo o elige otro espacio.', true);
    });
  }

  botonesEspacio.forEach(function (boton) {
    boton.addEventListener('click', function () {
      abrirEspacio(boton);
    });
  });

  // ---------- Arrastrar con mouse o con el dedo ----------
  let arrastrando = false;
  let ultimoX = 0;
  let ultimoY = 0;
  let velocidad = 0;

  escena.addEventListener('pointerdown', function (evento) {
    // Los botones del visor funcionan normalmente
    if (evento.target.closest('button')) {
      return;
    }
    arrastrando = true;
    ultimoX = evento.clientX;
    ultimoY = evento.clientY;
    velocidad = 0;
    cancelAnimationFrame(animacion);
    animando = false;
    escena.setPointerCapture(evento.pointerId);
    ocultarAyuda();
  });

  escena.addEventListener('pointermove', function (evento) {
    if (!arrastrando) {
      return;
    }
    // Grados por píxel según el campo de visión: la imagen sigue al puntero
    const gradosPorPixel = campoVertical / escena.clientHeight;
    const dx = evento.clientX - ultimoX;
    const dy = evento.clientY - ultimoY;
    yaw -= dx * gradosPorPixel;
    pitch += dy * gradosPorPixel;
    velocidad = -dx * gradosPorPixel;
    ultimoX = evento.clientX;
    ultimoY = evento.clientY;
    dibujar();
  });

  function soltar() {
    if (!arrastrando) {
      return;
    }
    arrastrando = false;
    // Un pequeño impulso al soltar, salvo con movimiento reducido
    if (menosMovimiento || Math.abs(velocidad) < 0.05) {
      return;
    }
    function inercia() {
      velocidad *= 0.92;
      yaw += velocidad;
      dibujar();
      if (Math.abs(velocidad) > 0.02) {
        animacion = requestAnimationFrame(inercia);
      }
    }
    animacion = requestAnimationFrame(inercia);
  }

  escena.addEventListener('pointerup', soltar);
  escena.addEventListener('pointercancel', soltar);

  // ---------- Teclado ----------
  escena.addEventListener('keydown', function (evento) {
    if (evento.target !== escena) {
      return;   // las teclas sobre los botones del visor no giran la vista
    }
    const paso = evento.shiftKey ? 30 : 10;
    // Si todavía gira por una tecla anterior, se suma sobre ese destino
    let destinoYaw = animando ? objetivoYaw : yaw;
    let destinoPitch = animando ? objetivoPitch : pitch;
    if (evento.key === 'ArrowLeft') {
      destinoYaw -= paso;
    } else if (evento.key === 'ArrowRight') {
      destinoYaw += paso;
    } else if (evento.key === 'ArrowUp') {
      destinoPitch += paso;
    } else if (evento.key === 'ArrowDown') {
      destinoPitch -= paso;
    } else if (evento.key === 'Home') {
      destinoYaw = yawInicial;
      destinoPitch = 0;
    } else {
      return;
    }
    evento.preventDefault();
    ocultarAyuda();
    girarHasta(destinoYaw, Math.max(-LIMITE_VERTICAL, Math.min(LIMITE_VERTICAL, destinoPitch)), 180);
  });

  // ---------- Controles ----------
  botonInicio.addEventListener('click', function () {
    girarHasta(yawInicial, 0, 500);
  });

  // Pantalla completa solo si el navegador la permite
  if (document.fullscreenEnabled && visor.requestFullscreen) {
    botonCompleta.hidden = false;
    botonCompleta.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        visor.requestFullscreen();
      }
    });
    document.addEventListener('fullscreenchange', function () {
      botonCompleta.textContent = document.fullscreenElement ? 'Salir de pantalla completa' : 'Pantalla completa';
      ajustarPerspectiva();
    });
  }

  window.addEventListener('resize', ajustarPerspectiva);
}
