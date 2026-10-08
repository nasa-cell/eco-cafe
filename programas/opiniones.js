// Opiniones: se guardan en Firestore (Google) y se leen de ahí, sin servidor propio.
const { proyecto, llave } = CONEXION_OPINIONES;
const enLinea = Boolean(proyecto);
const direccion = `https://firestore.googleapis.com/v1/projects/${proyecto}/databases/(default)/documents`;
const emoticones = new URL('../imagenes/emoticones/', document.currentScript.src);
const perfiles = new URL('../imagenes/perfiles/', document.currentScript.src);

const OSITOS = ['oso', 'panda', 'oso-polar'];
const POR_HOJA = 3;
const MAXIMO = 100;
const NOMBRE = { minimo: 2, maximo: 20 };
const TEXTO = { minimo: 10, maximo: 200 };
const ESPERA = 60000;
const LADO_FOTO = 128;
const INICIO_FOTO = 'data:image/jpeg;base64,';
const UN_DIA = 86400000;
const TIEMPO_ENVIO = 12000;
const PAUSAS = [1000, 3000];
const ESPERA_EJEMPLOS = 1500;
const LETRAS_CLAVE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const AVISOS = {
  'sin-internet': 'No hay conexión a internet. Tu opinión no se borró: conéctate y toca Publicar.',
  lento: 'El internet está muy lento y no se pudo enviar. Tu opinión no se borró: toca Publicar otra vez.',
  ocupado: 'El servicio está ocupado. Espera un momento y toca Publicar otra vez.',
  rechazado: 'No se pudo guardar esta opinión. Prueba sin foto o cambia un poco el texto.'
};

// Las palabras que no se publican van en clave para que no se lean a simple vista en el código.
// Para cambiar la lista: escribirlas separadas por comas, sin tildes, y pasarlas a base64.
const PROHIBIDAS = new Set(atob('cHV0YSxwdXRvLHB1dGFzLHB1dG9zLHB1dGl0YSxwdXRpdG8sbWllcmRhLG1pZXJkYXMsY2FyYWpvLGNvanVkbyxjb2p1ZGEsY29qdWRvcyxjb2p1ZGFzLGNvanVkZXosaHVldm9uLGh1ZXZvbmEsaHVldm9uZXMsd2Vib24sd2VvbixndWV2b24sY3RtLGNzbSxjdG1yLGhkcCxwZW5kZWpvLHBlbmRlamEscGVuZGVqb3MscGVuZGVqYXMscGluZ2EsdmVyZ2EsdmVyZ2FzLHBlbmUscGVuZXMsdmFnaW5hLGNodWNoYSxjYWJyb24sY2Ficm9uYSxjYWJyb25lcyxtYXJpY29uLG1hcmljb25lcyxtYXJpY2EsY2FjaGVybyxjYWNoZXJhLGltYmVjaWwsaW1iZWNpbGVzLGlkaW90YSxpZGlvdGFzLGVzdHVwaWRvLGVzdHVwaWRhLGVzdHVwaWRvcyxlc3R1cGlkYXMsdGFyYWRvLHRhcmFkYSxiYWJvc28sYmFib3NhLG1vbmdvbCxtb25nb2xvLHJldHJhc2FkbyxyZXRyYXNhZGEsY3VsbyxjdWxvcyxjdWxlcm8sdGV0YSx0ZXRhcyxqb2Rlcixqb2RldGUsam9kaWRvLGpvZGlkYSxtYWxwYXJpZG8sbWFscGFyaWRhLGhpanVlcHV0YSxnaWxpcG9sbGFzLHBhamVybyxwYWplcmEsc2V4byxwb3JubyxuYXppLGZ1Y2ssZnVja2luZyxzaGl0LGJpdGNoLGFzc2hvbGUsZGljayxwdXNzeQ==').split(','));
const FRASES = atob('Y29uY2hhdHVtYWRyZSxjb25jaGF0dW1hcmUsY29uY2hhc3VtYWRyZSxjb25jaGFzdW1hcmUsY29uY2hhZGV0dW1hZHJlLGNvbmNoYWRlc3VtYWRyZSxoaWpvZGVwdXRhLGhpamFkZXB1dGE=').split(',');
const DISFRAZ = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's' };

const elemento = selector => document.querySelector(selector);
const cuadro = elemento('[data-cuadro]'), formulario = cuadro.querySelector('form');
const campoNombre = elemento('[data-nombre]'), campoTexto = elemento('[data-texto]'), campoFoto = elemento('[data-foto]');
const botonSubir = elemento('[data-subir]'), aviso = elemento('[data-aviso]'), botonPublicar = elemento('[data-publicar]');
const cajaAjuste = elemento('[data-ajuste]'), lienzoFoto = elemento('[data-lienzo-foto]'), campoAcercar = elemento('[data-acercar]');
const botonesOsito = [...document.querySelectorAll('[data-osito]')];
const botonesEstrella = [...document.querySelectorAll('[data-poner] button')];
const botonesOrden = [...document.querySelectorAll('[data-orden]')];
const tarjetas = elemento('[data-tarjetas]'), paso = elemento('[data-paso]'), puntos = elemento('[data-puntos]');

let opiniones = [], hoja = 0, orden = 'recientes';
let elegido = { osito: 'oso', foto: '', estrellas: 0 };
let fotoOriginal = null, ajuste = { x: 0, y: 0, zoom: 1 };
let publicando = false, claveEnvio = '', cargaPendiente = false;

// --- condiciones antes de publicar ---

function tieneGroseria(frase) {
  const limpia = frase.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[013457@$]/g, signo => DISFRAZ[signo]);
  const palabras = limpia.replace(/[^a-z]+/g, ' ').trim().split(' ');
  // "p u t a" o "p.u.t.a": las letras sueltas seguidas se juntan en una palabra
  const sueltas = limpia.replace(/[^a-z ]+/g, ' ').replace(/\b([a-z]) (?=[a-z]\b)/g, '$1').split(' ');
  const hay = lista => lista.some(palabra => PROHIBIDAS.has(palabra) || PROHIBIDAS.has(palabra.replace(/(.)\1+/g, '$1')));
  const pegada = limpia.replace(/[^a-z]+/g, '');
  return hay(palabras) || hay(sueltas) || FRASES.some(mala => pegada.includes(mala));
}

function revisar({ nombre, texto, estrellas }) {
  if (nombre.length < NOMBRE.minimo) return `Escribe tu nombre o apodo (mínimo ${NOMBRE.minimo} letras).`;
  if (nombre.length > NOMBRE.maximo) return `El nombre puede tener hasta ${NOMBRE.maximo} letras.`;
  if (!/^[\p{L}\p{N} ._-]+$/u.test(nombre) || (nombre.match(/\p{L}/gu) ?? []).length < 2) return 'El nombre lleva letras; puede tener números, pero no símbolos.';
  if (!(estrellas >= 1 && estrellas <= 5)) return 'Marca tus estrellas, de 1 a 5.';
  if (texto.length < TEXTO.minimo) return `Tu opinión es muy corta (mínimo ${TEXTO.minimo} letras).`;
  if (texto.length > TEXTO.maximo) return `Tu opinión puede tener hasta ${TEXTO.maximo} letras.`;
  if (/https?:|www\.|\.(com|net|org|pe|io)\b/i.test(texto + ' ' + nombre)) return 'No se permiten enlaces.';
  if (/(\p{L})\1{4,}/u.test(texto) || /(\p{L})\1{3,}/u.test(nombre)) return 'Hay letras repetidas de más.';
  if (tieneGroseria(nombre) || tieneGroseria(texto)) return 'Hay palabras que no se pueden publicar. Cámbialas, por favor.';
  return '';
}

// Lo que llega guardado se vuelve a revisar: si alguien se saltó el formulario, su opinión no se muestra.
function ordenar(opinion) {
  const fecha = new Date(opinion.fecha);
  const limpia = {
    nombre: String(opinion.nombre ?? '').trim(),
    texto: String(opinion.texto ?? '').trim(),
    estrellas: Math.round(Number(opinion.estrellas)),
    osito: OSITOS.includes(opinion.osito) ? opinion.osito : 'oso',
    foto: String(opinion.foto ?? '').startsWith(INICIO_FOTO) ? opinion.foto : '',
    fecha: isNaN(fecha) ? 0 : fecha.getTime()
  };
  return revisar(limpia) ? null : limpia;
}

function ejemplos() {
  return OPINIONES_EJEMPLO.map(ejemplo => {
    const limpia = ordenar({ ...ejemplo, fecha: ejemplo.fecha + 'T12:00:00' });
    if (!limpia) return null;
    if (/^[a-z-]+$/.test(ejemplo.perfil ?? '')) limpia.foto = new URL(ejemplo.perfil + '.jpg', perfiles).href;
    limpia.ejemplo = true;
    return limpia;
  }).filter(Boolean);
}

// --- guardar y leer ---

function leerLocal(clave, respaldo) {
  try { return JSON.parse(localStorage.getItem(clave)) ?? respaldo; } catch { return respaldo; }
}
function guardarLocal(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin espacio o en modo privado */ }
}

const fallo = tipo => Object.assign(new Error(tipo), { tipo });

async function pedirUnaVez(ruta, cuerpo, parametros) {
  const consulta = new URLSearchParams({ ...parametros, ...(llave && { key: llave }) }).toString();
  const corte = new AbortController();
  const reloj = setTimeout(() => corte.abort(), TIEMPO_ENVIO);
  try {
    const respuesta = await fetch(direccion + ruta + (consulta ? `?${consulta}` : ''), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo), signal: corte.signal
    });
    if (respuesta.ok) return await respuesta.json();
    if (respuesta.status === 409) throw fallo('repetido');
    throw fallo(respuesta.status === 429 || respuesta.status >= 500 ? 'ocupado' : 'rechazado');
  } catch (error) {
    if (error.tipo) throw error;
    throw fallo(error.name === 'AbortError' ? 'lento' : 'sin-internet');
  } finally {
    clearTimeout(reloj);
  }
}

// Si el internet está lento o se corta un momento, se vuelve a intentar solo antes de avisar.
// Lo que el servidor rechaza no se reintenta: volvería a fallar igual.
async function pedir(ruta, cuerpo, parametros = {}, alReintentar = () => {}) {
  for (let intento = 0; ; intento++) {
    try {
      return await pedirUnaVez(ruta, cuerpo, parametros);
    } catch (error) {
      if (error.tipo === 'rechazado' || error.tipo === 'repetido' || intento >= PAUSAS.length) throw error;
      alReintentar();
      await new Promise(listo => setTimeout(listo, PAUSAS[intento]));
    }
  }
}

async function leerOpiniones() {
  if (!enLinea) return leerLocal('opiniones-prueba', []);
  const filas = await pedir(':runQuery', { structuredQuery: {
    from: [{ collectionId: 'opiniones' }],
    orderBy: [{ field: { fieldPath: 'fecha' }, direction: 'DESCENDING' }],
    limit: MAXIMO
  } });
  return filas.filter(fila => fila.document).map(({ document: { fields: campos } }) => ({
    nombre: campos.nombre?.stringValue, texto: campos.texto?.stringValue, estrellas: campos.estrellas?.integerValue,
    osito: campos.osito?.stringValue, foto: campos.foto?.stringValue, fecha: campos.fecha?.timestampValue
  }));
}

// Cada opinión viaja con una clave propia. Si un envío llegó pero su respuesta se perdió en el camino,
// el reintento choca con esa clave («repetido») y se sabe que ya estaba guardada: no sale dos veces.
async function guardarOpinion(opinion, clave, alReintentar) {
  if (!enLinea) return guardarLocal('opiniones-prueba', [opinion, ...leerLocal('opiniones-prueba', [])].slice(0, MAXIMO));
  try {
    await pedir('/opiniones', { fields: {
      nombre: { stringValue: opinion.nombre }, texto: { stringValue: opinion.texto },
      estrellas: { integerValue: String(opinion.estrellas) }, osito: { stringValue: opinion.osito },
      foto: { stringValue: opinion.foto }, fecha: { timestampValue: new Date(opinion.fecha).toISOString() }
    } }, { documentId: clave }, alReintentar);
  } catch (error) {
    if (error.tipo !== 'repetido') throw error;
  }
}

// --- mostrar ---

function hace(fecha) {
  const medianoche = momento => new Date(momento).setHours(0, 0, 0, 0);
  const dias = Math.round((medianoche(Date.now()) - medianoche(fecha)) / UN_DIA);
  const plural = (cuantos, uno, varios) => `hace ${cuantos} ${cuantos === 1 ? uno : varios}`;
  if (dias < 1) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 7) return plural(dias, 'día', 'días');
  if (dias < 30) return plural(Math.floor(dias / 7), 'semana', 'semanas');
  if (dias < 365) return plural(Math.floor(dias / 30), 'mes', 'meses');
  return plural(Math.floor(dias / 365), 'año', 'años');
}

function pintarEstrellas(caja, cuantas) {
  caja.textContent = '';
  caja.setAttribute('role', 'img');
  caja.setAttribute('aria-label', `${cuantas} de 5 estrellas`);
  for (let i = 1; i <= 5; i++) {
    const estrella = document.createElement('span');
    estrella.textContent = '★';
    if (i > cuantas) estrella.className = 'vacia';
    caja.append(estrella);
  }
}

function crear(etiqueta, clase, texto) {
  const pieza = document.createElement(etiqueta);
  if (clase) pieza.className = clase;
  if (texto) pieza.textContent = texto;
  return pieza;
}

function tarjeta(opinion, lugar) {
  const caja = crear('div', 'caja tarjeta' + (lugar % 3 === 1 ? ' naranja' : '') + (opinion.texto.length > 160 ? ' muy-larga' : opinion.texto.length > 110 ? ' larga' : ''));
  const rostro = crear('img', opinion.foto ? 'rostro foto' : 'rostro');
  rostro.src = opinion.foto || new URL(opinion.osito + '.png', emoticones);
  rostro.alt = '';
  const estrellas = crear('span', 'estrellas');
  pintarEstrellas(estrellas, opinion.estrellas);
  const cuando = crear('small', 'cuando', opinion.fecha ? hace(opinion.fecha) : '');
  caja.append(rostro, crear('h3', '', opinion.nombre), estrellas, cuando, crear('p', '', opinion.texto));
  return caja;
}

function mostrarResumen() {
  const total = opiniones.length;
  const promedio = total ? opiniones.reduce((suma, opinion) => suma + opinion.estrellas, 0) / total : 0;
  elemento('[data-promedio]').textContent = promedio.toFixed(1).replace('.', ',');
  pintarEstrellas(elemento('[data-estrellas-promedio]'), Math.round(promedio));
  const cuenta = elemento('[data-total]'), deEjemplo = opiniones.filter(opinion => opinion.ejemplo).length;
  cuenta.textContent = total === 1 ? '1 opinión' : `${total} opiniones`;
  if (deEjemplo) cuenta.append(crear('br'), crear('span', 'nota-chica', 'Incluye opiniones del tema'));
  const barras = elemento('[data-barras]');
  barras.textContent = '';
  for (let nota = 5; nota >= 1; nota--) {
    const fila = crear('div', '', String(nota)), barra = crear('i');
    const parte = total ? opiniones.filter(opinion => opinion.estrellas === nota).length / total : 0;
    barra.style.setProperty('--p', `${Math.round(parte * 100)}%`);
    fila.append(barra);
    barras.append(fila);
  }
}

function enOrden() {
  const porFecha = (a, b) => b.fecha - a.fecha;
  return [...opiniones].sort(orden === 'mejores' ? (a, b) => b.estrellas - a.estrellas || porFecha(a, b) : porFecha);
}

function mostrarHoja() {
  const hojas = Math.max(1, Math.ceil(opiniones.length / POR_HOJA));
  hoja = Math.min(Math.max(hoja, 0), hojas - 1);
  tarjetas.textContent = '';
  if (!opiniones.length) {
    const vacio = crear('div', 'caja pila sin-opiniones');
    const oso = crear('img', 'emo');
    oso.src = new URL('oso-polar.png', emoticones);
    oso.alt = '';
    vacio.append(oso, crear('h3', '', 'Todavía no hay opiniones'), crear('p', '', 'Sé la primera persona en dejar la suya.'));
    tarjetas.append(vacio);
  }
  enOrden().slice(hoja * POR_HOJA, hoja * POR_HOJA + POR_HOJA).forEach((opinion, lugar) => {
    const caja = tarjeta(opinion, lugar);
    tarjetas.append(caja);
    entrar(caja);
  });

  paso.hidden = hojas < 2;
  elemento('[data-anterior]').disabled = hoja === 0;
  elemento('[data-siguiente]').disabled = hoja === hojas - 1;
  puntos.textContent = '';
  if (hojas > 7) puntos.textContent = `${hoja + 1} de ${hojas}`;
  else for (let i = 0; i < hojas; i++) puntos.append(crear('span', i === hoja ? 'aqui' : ''));
}

function mostrarTodo() {
  mostrarResumen();
  mostrarHoja();
}

// --- cuadro para escribir ---

function avisar(mensaje) {
  aviso.textContent = mensaje;
  aviso.hidden = !mensaje;
}

function marcarRostro() {
  botonSubir.classList.toggle('elegido', Boolean(elegido.foto));
  botonSubir.classList.toggle('con-foto', Boolean(elegido.foto));
  botonSubir.style.backgroundImage = elegido.foto ? `url(${elegido.foto})` : '';
  botonesOsito.forEach(boton => boton.classList.toggle('elegido', !elegido.foto && boton.dataset.osito === elegido.osito));
  cajaAjuste.hidden = !fotoOriginal;
}

function marcarEstrellas() {
  botonesEstrella.forEach((boton, i) => {
    boton.classList.toggle('llena', i < elegido.estrellas);
    boton.setAttribute('aria-pressed', String(i + 1 === elegido.estrellas));
  });
}

function contarLetras() {
  elemento('[data-cuenta]').textContent = `${campoTexto.value.trim().length} / ${TEXTO.maximo} letras`;
}

// La foto se guarda achicada para que pese poco y quepa junto a la opinión.
// Primero se reduce a un tamaño cómodo para moverla; el recorte final sale del círculo de vista previa.
function abrirFoto(archivo) {
  return new Promise((listo, fallo) => {
    const imagen = new Image();
    imagen.onload = () => {
      const reduccion = Math.min(1, 512 / Math.min(imagen.naturalWidth, imagen.naturalHeight));
      const copia = document.createElement('canvas');
      copia.width = Math.round(imagen.naturalWidth * reduccion);
      copia.height = Math.round(imagen.naturalHeight * reduccion);
      copia.getContext('2d').drawImage(imagen, 0, 0, copia.width, copia.height);
      URL.revokeObjectURL(imagen.src);
      listo(copia);
    };
    imagen.onerror = () => { URL.revokeObjectURL(imagen.src); fallo(new Error('No es una imagen')); };
    imagen.src = URL.createObjectURL(archivo);
  });
}

const escalaFoto = zoom => LADO_FOTO / Math.min(fotoOriginal.width, fotoOriginal.height) * zoom;

function dibujarFoto() {
  const escala = escalaFoto(ajuste.zoom), ancho = fotoOriginal.width * escala, alto = fotoOriginal.height * escala;
  ajuste.x = Math.min(0, Math.max(LADO_FOTO - ancho, ajuste.x));
  ajuste.y = Math.min(0, Math.max(LADO_FOTO - alto, ajuste.y));
  const pincel = lienzoFoto.getContext('2d');
  pincel.fillStyle = '#fff';
  pincel.fillRect(0, 0, LADO_FOTO, LADO_FOTO);
  pincel.drawImage(fotoOriginal, ajuste.x, ajuste.y, ancho, alto);
}

function fijarFoto() {
  elegido.foto = lienzoFoto.toDataURL('image/jpeg', 0.78);
  marcarRostro();
}

function moverFoto(dx, dy) {
  ajuste.x += dx;
  ajuste.y += dy;
  dibujarFoto();
}

// Al acercar o alejar, el punto que está al centro del círculo se queda en su sitio.
function acercarFoto(zoom) {
  const antes = escalaFoto(ajuste.zoom), despues = escalaFoto(zoom), centro = LADO_FOTO / 2;
  ajuste.x = centro - (centro - ajuste.x) / antes * despues;
  ajuste.y = centro - (centro - ajuste.y) / antes * despues;
  ajuste.zoom = zoom;
  dibujarFoto();
}

function quitarFoto() {
  fotoOriginal = null;
  elegido.foto = '';
  campoFoto.value = '';
}

async function ponerFoto(archivo) {
  if (!archivo) return;
  if (!archivo.type.startsWith('image/')) return avisar('Ese archivo no es una foto.');
  try {
    fotoOriginal = await abrirFoto(archivo);
  } catch {
    return avisar('No se pudo abrir esa foto. Prueba con otra.');
  }
  const escala = escalaFoto(1);
  ajuste = { x: (LADO_FOTO - fotoOriginal.width * escala) / 2, y: (LADO_FOTO - fotoOriginal.height * escala) / 2, zoom: 1 };
  campoAcercar.value = 1;
  avisar('');
  dibujarFoto();
  fijarFoto();
}

function abrirCuadro() {
  formulario.reset();
  quitarFoto();
  elegido = { osito: 'oso', foto: '', estrellas: 0 };
  claveEnvio = Array.from(crypto.getRandomValues(new Uint8Array(20)), numero => LETRAS_CLAVE[numero % LETRAS_CLAVE.length]).join('');
  avisar('');
  marcarRostro();
  marcarEstrellas();
  contarLetras();
  cuadro.showModal();
}

async function publicar(evento) {
  evento.preventDefault();
  if (publicando) return;
  const opinion = { nombre: campoNombre.value.trim().replace(/\s+/g, ' '), texto: campoTexto.value.trim().replace(/\s+/g, ' '), ...elegido, fecha: Date.now() };
  const falta = revisar(opinion);
  if (falta) return avisar(falta);
  const resta = ESPERA - (Date.now() - leerLocal('opinion-ultima', 0));
  if (resta > 0) return avisar(`Espera ${Math.ceil(resta / 1000)} segundos para publicar otra opinión.`);

  publicando = true;
  botonPublicar.disabled = true;
  botonPublicar.textContent = 'Publicando…';
  avisar('');
  try {
    await guardarOpinion(opinion, claveEnvio, () => { botonPublicar.textContent = 'Reintentando…'; });
    guardarLocal('opinion-ultima', Date.now());
    opiniones.unshift(opinion);
    hoja = 0;
    elegirOrden('recientes');
    mostrarTodo();
    cuadro.close();
  } catch (error) {
    avisar(AVISOS[error.tipo] ?? AVISOS['sin-internet']);
  }
  publicando = false;
  botonPublicar.disabled = false;
  botonPublicar.textContent = 'Publicar';
}

function elegirOrden(nuevo) {
  orden = nuevo;
  botonesOrden.forEach(boton => boton.setAttribute('aria-pressed', String(boton.dataset.orden === orden)));
}

elemento('[data-abrir]').addEventListener('click', abrirCuadro);
elemento('[data-cancelar]').addEventListener('click', () => cuadro.close());
elemento('[data-anterior]').addEventListener('click', () => { hoja--; mostrarHoja(); });
elemento('[data-siguiente]').addEventListener('click', () => { hoja++; mostrarHoja(); });
botonesOrden.forEach(boton => boton.addEventListener('click', () => {
  elegirOrden(boton.dataset.orden);
  hoja = 0;
  mostrarHoja();
}));
formulario.addEventListener('submit', publicar);
campoTexto.addEventListener('input', contarLetras);
campoFoto.addEventListener('change', () => ponerFoto(campoFoto.files[0]));
botonesOsito.forEach(boton => boton.addEventListener('click', () => {
  quitarFoto();
  elegido.osito = boton.dataset.osito;
  marcarRostro();
}));
botonesEstrella.forEach((boton, i) => boton.addEventListener('click', () => {
  elegido.estrellas = i + 1;
  marcarEstrellas();
}));

// La foto también se puede soltar encima del círculo.
['dragenter', 'dragover'].forEach(tipo => botonSubir.addEventListener(tipo, evento => {
  evento.preventDefault();
  botonSubir.classList.add('encima');
}));
['dragleave', 'drop'].forEach(tipo => botonSubir.addEventListener(tipo, () => botonSubir.classList.remove('encima')));
botonSubir.addEventListener('drop', evento => {
  evento.preventDefault();
  ponerFoto(evento.dataTransfer.files[0]);
});

// Acomodar la foto: arrastrándola con el dedo o el ratón, o con las flechas y la barra de acercar.
let agarre = null;
lienzoFoto.addEventListener('pointerdown', evento => {
  lienzoFoto.setPointerCapture(evento.pointerId);
  agarre = { x: evento.clientX, y: evento.clientY };
});
lienzoFoto.addEventListener('pointermove', evento => {
  if (!agarre || !lienzoFoto.hasPointerCapture(evento.pointerId)) return;
  const medida = LADO_FOTO / lienzoFoto.getBoundingClientRect().width;
  moverFoto((evento.clientX - agarre.x) * medida, (evento.clientY - agarre.y) * medida);
  agarre = { x: evento.clientX, y: evento.clientY };
});
lienzoFoto.addEventListener('pointerup', fijarFoto);
lienzoFoto.addEventListener('pointercancel', fijarFoto);
campoAcercar.addEventListener('input', () => { acercarFoto(Number(campoAcercar.value)); fijarFoto(); });
document.querySelectorAll('[data-mover]').forEach(boton => boton.addEventListener('click', () => {
  const [dx, dy] = boton.dataset.mover.split(',').map(Number);
  moverFoto(dx * 10, dy * 10);
  fijarFoto();
}));

// Dentro del cuadro las flechas mueven el cursor al escribir; no deben pasar de página.
cuadro.addEventListener('keydown', evento => evento.stopPropagation());

// Si las opiniones guardadas tardan en llegar, se muestran primero las de ejemplo para no dejar la página vacía.
// Si no llegan, se vuelven a pedir en cuanto regresa el internet.
async function cargar() {
  const avisoCarga = elemento('[data-aviso-carga]');
  const mostrar = lista => {
    const propias = opiniones.filter(opinion => !opinion.ejemplo && !lista.some(otra => otra.fecha === opinion.fecha && otra.nombre === opinion.nombre));
    opiniones = [...propias, ...lista, ...ejemplos()];
    mostrarTodo();
  };
  const sinPintar = () => !tarjetas.childElementCount;
  const reloj = setTimeout(() => mostrar([]), sinPintar() ? ESPERA_EJEMPLOS : 2 ** 31 - 1);
  try {
    const lista = (await leerOpiniones()).map(ordenar).filter(Boolean);
    clearTimeout(reloj);
    cargaPendiente = false;
    avisoCarga.hidden = true;
    mostrar(lista);
  } catch {
    clearTimeout(reloj);
    cargaPendiente = true;
    avisoCarga.hidden = false;
    if (sinPintar()) mostrar([]);
  }
}

window.addEventListener('online', () => { if (cargaPendiente) cargar(); });
cargar();
