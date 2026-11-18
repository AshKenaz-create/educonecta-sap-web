// Carrusel de la portada de Inicio: muestra una fotografía a la vez.
// Se maneja con las flechas, con los indicadores o con las teclas izquierda/derecha.
// Funciona en bucle: después de la última fotografía vuelve a la primera, y al revés.
// No avanza solo. Sin JavaScript se ve únicamente la primera fotografía.

const portada = document.querySelector('.portada');

if (portada) {
  const pista = portada.querySelector('.portada__pista');
  const diapositivas = portada.querySelectorAll('.portada__diapositiva');
  const botonAnterior = portada.querySelector('.portada__flecha--anterior');
  const botonSiguiente = portada.querySelector('.portada__flecha--siguiente');
  const contenedorIndicadores = portada.querySelector('.portada__indicadores');
  const indicadores = portada.querySelectorAll('.portada__indicador');
  const estado = portada.querySelector('.portada__estado');
  const ultima = diapositivas.length - 1;
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  let actual = 0;
  let cambiando = false;

  // Activa los estilos del carrusel y muestra los controles
  portada.classList.add('portada--activa');
  botonAnterior.hidden = false;
  botonSiguiente.hidden = false;
  contenedorIndicadores.hidden = false;

  // Muestra la fotografía indicada y actualiza indicadores y mensaje
  function mostrar(indice, anunciar) {
    actual = indice;
    pista.style.transform = 'translateX(-' + (actual * 100) + '%)';

    diapositivas.forEach(function (diapositiva, i) {
      // Las fotografías que no se ven quedan inactivas para teclado y lectores de pantalla
      diapositiva.inert = i !== actual;
    });

    indicadores.forEach(function (indicador, i) {
      if (i === actual) {
        indicador.setAttribute('aria-current', 'true');
      } else {
        indicador.removeAttribute('aria-current');
      }
    });

    // Mensaje para lectores de pantalla (no se anuncia al cargar la página)
    if (anunciar) {
      estado.textContent = 'Fotografía ' + (actual + 1) + ' de ' + diapositivas.length;
    }
  }

  // Cambia a otra fotografía. Entre la primera y la última no se desliza por
  // todas: la pista se desvanece, cambia sin deslizarse y vuelve a aparecer
  function irA(destino) {
    if (cambiando || destino === actual) {
      return;
    }
    const esSalto = Math.abs(destino - actual) === ultima && ultima > 1;

    if (!esSalto || movimientoReducido.matches) {
      mostrar(destino, true);
      return;
    }

    cambiando = true;
    pista.classList.add('portada__pista--desvanecida');
    setTimeout(function () {
      pista.classList.add('portada__pista--sin-deslizar');
      mostrar(destino, true);
      // Aplica la nueva posición antes de volver a activar el deslizamiento
      pista.getBoundingClientRect();
      pista.classList.remove('portada__pista--sin-deslizar');
      pista.classList.remove('portada__pista--desvanecida');
      cambiando = false;
    }, 200);
  }

  // Posición siguiente y anterior en bucle (después de la última viene la primera)
  function siguienteIndice() {
    return actual === ultima ? 0 : actual + 1;
  }

  function anteriorIndice() {
    return actual === 0 ? ultima : actual - 1;
  }

  botonAnterior.addEventListener('click', function () {
    irA(anteriorIndice());
  });

  botonSiguiente.addEventListener('click', function () {
    irA(siguienteIndice());
  });

  indicadores.forEach(function (indicador, i) {
    indicador.addEventListener('click', function () {
      irA(i);
    });
  });

  // Teclas izquierda y derecha cuando el foco está dentro del carrusel
  portada.addEventListener('keydown', function (evento) {
    let destino;
    if (evento.key === 'ArrowLeft') {
      destino = anteriorIndice();
    } else if (evento.key === 'ArrowRight') {
      destino = siguienteIndice();
    } else {
      return;
    }
    evento.preventDefault();
    if (cambiando) {
      return;
    }
    irA(destino);

    // Si el foco estaba en un indicador, pasa al indicador de la nueva fotografía
    if (document.activeElement.classList.contains('portada__indicador')) {
      indicadores[destino].focus();
    }
  });

  mostrar(0, false);
}
