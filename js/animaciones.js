// Banda de estadísticas de Inicio en movimiento continuo.
// Los cinco bloques se desplazan de derecha a izquierda, sin detenerse ni retroceder.
// Para que el recorrido no tenga cortes se agrega una copia visual de los bloques,
// oculta para los lectores de pantalla. El movimiento lo hace el CSS (@keyframes).
// Se pausa al pasar el mouse o cuando la banda recibe el foco del teclado.
// Sin JavaScript, o con movimiento reducido, se ven los cinco bloques fijos.

const estadisticas = document.querySelector('.estadisticas');
const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (estadisticas && !prefiereMenosMovimiento) {
  const grid = estadisticas.querySelector('.estadisticas__grid');
  const bloques = Array.from(grid.querySelectorAll('.estadisticas__item'));

  const ventana = document.createElement('div');
  ventana.className = 'estadisticas__ventana';
  const pista = document.createElement('div');
  pista.className = 'estadisticas__pista';

  // Los cinco bloques originales pasan a la pista, sin cambiar su contenido
  bloques.forEach(function (bloque) {
    pista.appendChild(bloque);
  });

  // Copia visual de los cinco bloques para que el bucle sea continuo
  bloques.forEach(function (bloque) {
    const copia = bloque.cloneNode(true);
    copia.setAttribute('aria-hidden', 'true');
    pista.appendChild(copia);
  });

  ventana.appendChild(pista);
  grid.appendChild(ventana);

  // La banda puede recibir el foco con Tab, lo que la detiene para leerla con calma
  grid.setAttribute('tabindex', '0');
  grid.setAttribute('role', 'region');
  grid.setAttribute('aria-label', 'Cifras institucionales');

  estadisticas.classList.add('estadisticas--marquesina');
}
