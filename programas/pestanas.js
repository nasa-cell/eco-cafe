// Al tocar una pestaña se muestra su panel y se ocultan los demás del mismo grupo.
document.addEventListener('click', evento => {
  const pestana = evento.target.closest('[data-pestana]');
  if (!pestana) return;
  const grupo = pestana.closest('.grupo');
  grupo.querySelectorAll('[data-pestana]').forEach(p => p.setAttribute('aria-selected', p === pestana));
  grupo.querySelectorAll('[data-panel]').forEach(panel => {
    panel.hidden = panel.dataset.panel !== pestana.dataset.pestana;
    if (!panel.hidden) entrar(panel);
  });
});
