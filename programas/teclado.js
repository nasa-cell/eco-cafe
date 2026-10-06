// Flechas izquierda y derecha para pasar de página al exponer, siguiendo el orden del menú.
addEventListener('keydown', evento => {
  if (evento.key !== 'ArrowRight' && evento.key !== 'ArrowLeft') return;
  if (evento.target.closest('[role="tablist"]')) return;
  const enlaces = [...document.querySelectorAll('.menu nav a')];
  const actual = enlaces.findIndex(enlace => enlace.hasAttribute('aria-current'));
  const destino = enlaces[actual + (evento.key === 'ArrowRight' ? 1 : -1)];
  if (destino) location.href = destino.href;
});
