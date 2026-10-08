# EcoCafé

Página web del emprendimiento **EcoCafé**: un envase de acero inoxidable con diseño único para tomar tus bebidas sin generar basura.

- Envase: S/ 15, pago único.
- Café con tu envase: S/ 6.
- Pedidos por WhatsApp: 970 293 037.

## Páginas

| Página | Archivo |
|---|---|
| Inicio | `index.html` |
| Nosotros | `paginas/nosotros.html` |
| Impacto | `paginas/impacto.html` |
| Lugares | `paginas/lugares.html` |
| Diseños | `paginas/disenos.html` |
| Pasos | `paginas/pasos.html` |
| Precios y pedido | `paginas/pedir.html` |
| Opiniones | `paginas/opiniones.html` |

## Carpetas

- `paginas/`: las páginas internas.
- `estilos/`: colores, menú, cuadros y adaptación a celular.
- `programas/`: animaciones, pestañas, teclado, fondo de hojas, opiniones y el puente para manejar la página desde el celular con Conexiones.
- `imagenes/`: logo, fotos de los envases, emoticones y fotos de perfil de las opiniones de ejemplo.
- `videos/`: el logo animado y el envase girando que se ven en la portada.

## Opiniones

En la página Opiniones cualquiera deja su nombre o apodo, estrellas, comentario y, si quiere, una foto que puede acomodar. Antes de publicar se revisa el largo del texto, que no haya enlaces ni palabras ofensivas, y se espera un minuto entre opiniones.

- Las opiniones se guardan en Firestore (Firebase). Los datos del proyecto van en `programas/conexion-opiniones.js`; si están vacíos, la página funciona en modo de prueba y guarda solo en el navegador.
- `programas/opiniones-ejemplo.js` trae opiniones de muestra, marcadas con la etiqueta «Ejemplo». Para quitarlas se deja la lista vacía.
- Las fotos de `imagenes/perfiles/` vienen de Wikimedia Commons y son de dominio público o CC0.

## Cómo verla

Abre `index.html` en el navegador. No necesita instalación.

En computadora cada página entra en una pantalla, sin bajar con el ratón. Las flechas izquierda y derecha del teclado pasan de página, útil para exponer. En celular las piezas se apilan y se baja con el dedo.
