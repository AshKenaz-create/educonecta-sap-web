// Calendario de Actividades: muestra los días del mes y permite cambiar de mes.
// Funciona aunque no haya actividades registradas.

// Actividades institucionales confirmadas.
// Formato de cada actividad: { fecha: 'AAAA-MM-DD', titulo: 'Nombre de la actividad' }
// Se deja vacía hasta que la institución entregue fechas oficiales.
const actividades = [];

// Actividades FICTICIAS, solo para mostrar el funcionamiento del prototipo.
// No son eventos reales ni confirmados: en la página se marcan como "Ejemplo"
// y el recuadro "Notas" lo explica. Solo existen en noviembre de 2026.
// Se deben borrar cuando la institución entregue su programación oficial.
const actividadesDemostrativas = [
  { fecha: '2026-11-05', titulo: 'Jornada deportiva estudiantil' },
  { fecha: '2026-11-08', titulo: 'Muestra cultural institucional' },
  { fecha: '2026-11-12', titulo: 'Feria de ciencias escolar' },
  { fecha: '2026-11-17', titulo: 'Encuentro de familias' },
  { fecha: '2026-11-21', titulo: 'Taller de lectura y escritura' },
  { fecha: '2026-11-25', titulo: 'Jornada ambiental EcoFest' },
  { fecha: '2026-11-28', titulo: 'Acto de reconocimiento estudiantil' }
];

const nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const calendario = document.querySelector('.calendario');

if (calendario) {
  const contenido = calendario.querySelector('.calendario__contenido');
  const mensajeSinJs = calendario.querySelector('.calendario__sin-js');
  const nombreMes = calendario.querySelector('.calendario__nombre-mes');
  const anio = calendario.querySelector('.calendario__anio');
  const leyendaTabla = calendario.querySelector('.calendario__tabla caption');
  const cuerpoTabla = calendario.querySelector('.calendario__dias');
  const listaActividades = calendario.querySelector('.calendario__actividades');
  const sinActividades = calendario.querySelector('.calendario__sin-actividades');
  const botonAnterior = calendario.querySelector('.calendario__boton--anterior');
  const botonSiguiente = calendario.querySelector('.calendario__boton--siguiente');
  const botonHoy = calendario.querySelector('.calendario__boton-hoy');

  // Fecha de hoy según el equipo del visitante
  const hoy = new Date();

  // Mes que se está mostrando (los meses en JavaScript van de 0 = enero a 11 = diciembre)
  let mesVisible = hoy.getMonth();
  let anioVisible = hoy.getFullYear();

  // Muestra el calendario interactivo y oculta el mensaje alternativo
  contenido.hidden = false;
  mensajeSinJs.hidden = true;

  // Convierte un número de mes o día en texto de dos cifras (3 → "03")
  function dosCifras(numero) {
    return String(numero).padStart(2, '0');
  }

  // Devuelve las actividades del mes visible (oficiales y de ejemplo), ordenadas por fecha.
  // A las de ejemplo se les agrega "demostrativa: true" para identificarlas en la página.
  function actividadesDelMes() {
    const prefijo = anioVisible + '-' + dosCifras(mesVisible + 1) + '-';
    const oficiales = actividades.filter(function (actividad) {
      return actividad.fecha.startsWith(prefijo);
    });
    const deEjemplo = actividadesDemostrativas.filter(function (actividad) {
      return actividad.fecha.startsWith(prefijo);
    }).map(function (actividad) {
      return { fecha: actividad.fecha, titulo: actividad.titulo, demostrativa: true };
    });
    return oficiales.concat(deEjemplo).sort(function (a, b) {
      return a.fecha < b.fecha ? -1 : 1;
    });
  }

  // Resalta en el panel lateral la actividad de una fecha (al pasar el mouse o enfocar el día)
  function resaltarActividad(fecha, activar) {
    listaActividades.querySelectorAll('[data-fecha="' + fecha + '"]').forEach(function (elemento) {
      elemento.classList.toggle('calendario__actividad--resaltada', activar);
    });
  }

  // Dibuja el mes visible: título, días y lista de actividades
  function mostrarMes() {
    const titulo = nombresMeses[mesVisible] + ' de ' + anioVisible;
    nombreMes.textContent = nombresMeses[mesVisible];
    anio.textContent = anioVisible;
    leyendaTabla.textContent = titulo;

    // El día 0 del mes siguiente es el último día de este mes (tiene en cuenta los años bisiestos)
    const diasDelMes = new Date(anioVisible, mesVisible + 1, 0).getDate();

    // getDay() empieza en domingo (0); se ajusta para que la semana empiece en lunes
    const primerDia = new Date(anioVisible, mesVisible, 1).getDay();
    const espaciosIniciales = (primerDia + 6) % 7;

    const actividadesMes = actividadesDelMes();
    const esMesActual = mesVisible === hoy.getMonth() && anioVisible === hoy.getFullYear();

    // Siempre se dibujan 6 semanas (42 casillas) para que el calendario no cambie de altura
    cuerpoTabla.innerHTML = '';
    let fila;

    for (let casilla = 0; casilla < 42; casilla++) {
      if (casilla % 7 === 0) {
        fila = document.createElement('tr');
        cuerpoTabla.appendChild(fila);
      }

      const celda = document.createElement('td');
      celda.className = 'calendario__dia';
      const dia = casilla - espaciosIniciales + 1;

      if (dia < 1 || dia > diasDelMes) {
        // Casilla vacía antes del día 1 o después del último día
        celda.classList.add('calendario__dia--vacio');
      } else {
        const numero = document.createElement('span');
        numero.className = 'calendario__numero';
        numero.textContent = dia;
        celda.appendChild(numero);

        if (esMesActual && dia === hoy.getDate()) {
          celda.classList.add('calendario__dia--hoy');
          celda.setAttribute('aria-current', 'date');
          numero.setAttribute('title', 'Hoy');
        }

        // Marca los días que tienen actividades; con el mouse o con Tab se resalta
        // la actividad correspondiente en el panel "Actividades del mes"
        const fecha = anioVisible + '-' + dosCifras(mesVisible + 1) + '-' + dosCifras(dia);
        const actividadesDia = actividadesMes.filter(function (actividad) {
          return actividad.fecha === fecha;
        });
        if (actividadesDia.length > 0) {
          celda.classList.add('calendario__dia--actividad');
          celda.tabIndex = 0;
          const nombres = actividadesDia.map(function (actividad) {
            return actividad.titulo + (actividad.demostrativa ? ' (actividad de ejemplo)' : '');
          });
          celda.setAttribute('aria-label', dia + ' de ' + nombresMeses[mesVisible].toLowerCase() + ': ' + nombres.join(', '));
          celda.title = nombres.join(', ');
          celda.addEventListener('mouseenter', function () { resaltarActividad(fecha, true); });
          celda.addEventListener('mouseleave', function () { resaltarActividad(fecha, false); });
          celda.addEventListener('focus', function () { resaltarActividad(fecha, true); });
          celda.addEventListener('blur', function () { resaltarActividad(fecha, false); });
        }
      }

      fila.appendChild(celda);
    }

    // Lista de actividades del mes, o el mensaje cuando no hay ninguna
    listaActividades.innerHTML = '';
    actividadesMes.forEach(function (actividad) {
      const elemento = document.createElement('li');
      elemento.dataset.fecha = actividad.fecha;
      const dia = Number(actividad.fecha.slice(8, 10));

      // Las actividades ficticias llevan la etiqueta "Ejemplo"
      if (actividad.demostrativa) {
        elemento.classList.add('calendario__actividad--ejemplo');
        const etiqueta = document.createElement('span');
        etiqueta.className = 'calendario__etiqueta-ejemplo';
        etiqueta.textContent = 'Ejemplo';
        elemento.appendChild(etiqueta);
      }

      const fecha = document.createElement('strong');
      fecha.textContent = dia + ' de ' + nombresMeses[mesVisible].toLowerCase() + ': ';
      elemento.appendChild(fecha);
      elemento.appendChild(document.createTextNode(actividad.titulo));
      listaActividades.appendChild(elemento);
    });
    listaActividades.hidden = actividadesMes.length === 0;
    sinActividades.hidden = actividadesMes.length > 0;

    // El botón "Ir al mes actual" solo está activo si se está viendo otro mes
    botonHoy.disabled = esMesActual;
  }

  // Cambia el mes visible; new Date() ajusta solo el año (diciembre + 1 → enero del año siguiente)
  function cambiarMes(cantidad) {
    const nuevaFecha = new Date(anioVisible, mesVisible + cantidad, 1);
    mesVisible = nuevaFecha.getMonth();
    anioVisible = nuevaFecha.getFullYear();
    mostrarMes();
  }

  botonAnterior.addEventListener('click', function () {
    cambiarMes(-1);
  });

  botonSiguiente.addEventListener('click', function () {
    cambiarMes(1);
  });

  botonHoy.addEventListener('click', function () {
    mesVisible = hoy.getMonth();
    anioVisible = hoy.getFullYear();
    mostrarMes();
    // El botón queda desactivado, así que el foco pasa al botón de mes siguiente
    botonSiguiente.focus();
  });

  mostrarMes();
}
