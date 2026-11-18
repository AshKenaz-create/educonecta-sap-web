// Detalle de noticia: muestra solo la publicación indicada en la dirección.
// Ejemplo: noticia-evento.html?noticia=jornada-academica
// Sin JavaScript se ven todas las publicaciones, una debajo de otra.

const detalleNoticias = document.querySelector('.detalle-noticias');

if (detalleNoticias) {
  const noticias = detalleNoticias.querySelectorAll('.detalle-noticia');
  const mensajeSinJs = detalleNoticias.querySelector('.detalle-noticias__sin-js');
  const mensajeNoEncontrada = detalleNoticias.querySelector('.detalle-noticias__no-encontrada');

  // Lee el identificador que viene después de ?noticia= en la dirección
  const parametros = new URLSearchParams(window.location.search);
  const idSolicitado = parametros.get('noticia');

  let noticiaEncontrada = null;

  // Deja visible solo la noticia cuyo id coincide; oculta las demás
  noticias.forEach(function (noticia) {
    if (noticia.id === idSolicitado) {
      noticiaEncontrada = noticia;
    } else {
      noticia.hidden = true;
    }
  });

  mensajeSinJs.hidden = true;

  if (noticiaEncontrada) {
    // Usa el título de la noticia en la pestaña del navegador
    const titulo = noticiaEncontrada.querySelector('.detalle-noticia__titulo').textContent;
    document.title = titulo + ' - Institución Educativa San Antonio de Padua';
  } else {
    // Identificador vacío o inexistente: no se muestra ninguna noticia por error
    mensajeNoEncontrada.hidden = false;
    document.title = 'Noticia no encontrada - Institución Educativa San Antonio de Padua';
  }
}
