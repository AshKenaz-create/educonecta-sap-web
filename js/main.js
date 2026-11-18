// Menú móvil: abre y cierra la navegación en pantallas pequeñas
const header = document.querySelector('.header');
const botonMenu = document.querySelector('.header__menu-boton');

if (header && botonMenu) {
  // Indica al CSS que el menú desplegable está disponible
  header.classList.add('header--con-menu');

  botonMenu.addEventListener('click', function () {
    const abierto = header.classList.toggle('header--menu-abierto');
    botonMenu.setAttribute('aria-expanded', abierto ? 'true' : 'false');
  });

  // Cierra el menú con la tecla Escape y devuelve el foco al botón
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && header.classList.contains('header--menu-abierto')) {
      header.classList.remove('header--menu-abierto');
      botonMenu.setAttribute('aria-expanded', 'false');
      botonMenu.focus();
    }
  });
}
