// Carruseles: muestran un grupo de elementos y permiten avanzar o retroceder con botones.
// Sirve para cualquier bloque con esta estructura:
//   .carrusel > botón anterior, .carrusel__ventana > .carrusel__pista > elementos, botón siguiente
// Funcionan en bucle: después del último grupo vuelven al primero, y al revés.
// Sin JavaScript los elementos se siguen viendo como una cuadrícula normal.
const carruseles = document.querySelectorAll('.carrusel');
const movimientoReducidoCarrusel = window.matchMedia('(prefers-reduced-motion: reduce)');

carruseles.forEach(function (carrusel) {
  const pista = carrusel.querySelector('.carrusel__pista');
  const elementos = pista.children;
  const botonAnterior = carrusel.querySelector('.carrusel__boton--anterior');
  const botonSiguiente = carrusel.querySelector('.carrusel__boton--siguiente');
  const estado = carrusel.querySelector('.carrusel__estado');
  let posicion = 0;
  let cambiando = false;

  // Activa los estilos del carrusel y muestra los botones
  carrusel.classList.add('carrusel--activo');
  botonAnterior.hidden = false;
  botonSiguiente.hidden = false;

  // Lee del CSS cuántos elementos se ven a la vez (cambia según el tamaño de pantalla)
  function elementosVisibles() {
    const valor = getComputedStyle(carrusel).getPropertyValue('--carrusel-visibles');
    return parseInt(valor, 10) || 1;
  }

  // Última posición posible según cuántos elementos se ven a la vez
  function ultimaPosicion() {
    return Math.max(elementos.length - elementosVisibles(), 0);
  }

  // Desplaza la pista hasta la posición actual y actualiza el mensaje
  function actualizar() {
    const visibles = elementosVisibles();

    // Evita salir del contenido, por ejemplo al cambiar el tamaño de la ventana
    posicion = Math.min(Math.max(posicion, 0), ultimaPosicion());

    const desplazamiento = elementos[posicion].offsetLeft - elementos[0].offsetLeft;
    pista.style.transform = 'translateX(-' + desplazamiento + 'px)';

    // Mensaje para lectores de pantalla con lo que se está mostrando
    const primero = posicion + 1;
    const ultimo = Math.min(posicion + visibles, elementos.length);
    if (primero === ultimo) {
      estado.textContent = 'Mostrando ' + primero + ' de ' + elementos.length;
    } else {
      estado.textContent = 'Mostrando ' + primero + ' a ' + ultimo + ' de ' + elementos.length;
    }
  }

  // Va de un extremo al otro sin recorrer todos los elementos:
  // la pista se desvanece, cambia de posición sin deslizarse y vuelve a aparecer
  function saltar(nuevaPosicion) {
    if (movimientoReducidoCarrusel.matches) {
      posicion = nuevaPosicion;
      actualizar();
      return;
    }
    cambiando = true;
    pista.classList.add('carrusel__pista--desvanecida');
    setTimeout(function () {
      pista.classList.add('carrusel__pista--sin-deslizar');
      posicion = nuevaPosicion;
      actualizar();
      // Aplica la nueva posición antes de volver a activar el deslizamiento
      pista.getBoundingClientRect();
      pista.classList.remove('carrusel__pista--sin-deslizar');
      pista.classList.remove('carrusel__pista--desvanecida');
      cambiando = false;
    }, 200);
  }

  botonAnterior.addEventListener('click', function () {
    if (cambiando || ultimaPosicion() === 0) {
      return;
    }
    if (posicion === 0) {
      saltar(ultimaPosicion());
    } else {
      posicion = posicion - 1;
      actualizar();
    }
  });

  botonSiguiente.addEventListener('click', function () {
    if (cambiando || ultimaPosicion() === 0) {
      return;
    }
    if (posicion >= ultimaPosicion()) {
      saltar(0);
    } else {
      posicion = posicion + 1;
      actualizar();
    }
  });

  // Recalcula al cambiar el tamaño de la ventana (cambia la cantidad visible)
  window.addEventListener('resize', actualizar);

  actualizar();
});
