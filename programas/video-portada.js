// Botones «Ver video» de la portada (junto a los otros en la PC, sobre el logo en el celular):
// abren el video en grande y con sonido. Se cierra con el botón, con Esc o tocando afuera.
// En un celular parado se usa el video vertical.
const ventanaVideo = document.getElementById('ventanaVideo');
if (ventanaVideo) {
  const pelicula = ventanaVideo.querySelector('video');
  let botonVer = null; // el que abrió la ventana: ahí vuelve el foco al cerrar
  const botonCerrar = ventanaVideo.querySelector('button');

  const cerrar = () => {
    pelicula.pause();
    ventanaVideo.hidden = true;
    if (botonVer) botonVer.focus();
  };

  const abrir = evento => {
    evento.preventDefault();
    botonVer = evento.currentTarget;
    const parado = matchMedia('(orientation: portrait) and (max-width: 700px)').matches;
    const archivo = parado ? 'envase-vertical' : 'envase-horizontal';
    if (pelicula.dataset.archivo !== archivo) {
      pelicula.dataset.archivo = archivo;
      pelicula.classList.toggle('vertical', parado);
      pelicula.poster = `imagenes/video-${archivo}.jpg`;
      pelicula.src = `videos/${archivo}.mp4`;
    } else {
      pelicula.currentTime = 0;
    }
    ventanaVideo.hidden = false;
    entrar(ventanaVideo.firstElementChild);
    botonCerrar.focus();
    pelicula.play().catch(() => {}); // si el navegador no deja arrancar solo, queda el botón de reproducir
  };
  document.querySelectorAll('.ver-video').forEach(boton => boton.addEventListener('click', abrir));

  botonCerrar.addEventListener('click', cerrar);
  ventanaVideo.addEventListener('click', evento => { if (evento.target === ventanaVideo) cerrar(); });
  // Con la ventana abierta las flechas son del video: no tienen que pasar de página.
  ventanaVideo.addEventListener('keydown', evento => {
    evento.stopPropagation();
    if (evento.key === 'Escape') cerrar();
  });
}
