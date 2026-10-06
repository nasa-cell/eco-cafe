const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

function entrar(elemento) {
  if (sinMovimiento) return;
  elemento.animate(
    [{ opacity: 0, transform: 'translateY(.6em)' }, { opacity: 1, transform: 'none' }],
    { duration: 240, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
}

// Los números de impacto cuentan desde cero al abrir la página.
function contar(numero) {
  const fin = Number(numero.dataset.contar), inicio = performance.now();
  const cuadro = ahora => {
    const avance = Math.min((ahora - inicio) / 1400, 1);
    numero.textContent = Math.round(fin * (1 - Math.pow(1 - avance, 4))).toLocaleString('en-US');
    if (avance < 1) requestAnimationFrame(cuadro);
  };
  requestAnimationFrame(cuadro);
}

if (!sinMovimiento) document.querySelectorAll('[data-contar]').forEach(contar);
