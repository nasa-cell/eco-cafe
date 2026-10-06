// Hojas del fondo, puestas en los bordes para no tapar el contenido: [izquierda %, arriba %, imagen].
const hojas = [[-2, 14, 'hoja'], [95, 26, 'hoja-larga'], [-2.5, 52, 'menta'], [95.5, 60, 'hoja'], [36, -5, 'hoja-larga'],
  [70, -4, 'menta'], [18, 91, 'hoja'], [58, 92, 'hoja-larga'], [-2, 84, 'hoja-larga'], [95, 88, 'menta']];

// La carpeta de imágenes se ubica a partir de este archivo, así sirve para index.html y para las páginas de la carpeta "paginas".
const carpeta = new URL('../imagenes/emoticones/', document.currentScript.src);
const fondo = document.querySelector('.fondo');

hojas.forEach(([x, y, imagen], i) => {
  const hoja = document.createElement('img');
  hoja.src = new URL(imagen + '.png', carpeta);
  hoja.alt = '';
  hoja.style.cssText = `left:${x}%;top:${y}%;width:${5 + i % 3}vw;--giro:${i * 47 % 360}deg;--tiempo:${5 + i % 4}s;animation-delay:-${i * 0.7}s`;
  fondo.append(hoja);
});
