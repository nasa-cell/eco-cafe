// Opiniones de muestra para que la página no se vea vacía al exponer.
// «perfil» es una foto de la carpeta imagenes/perfiles o, si no hay, se usa el osito.
// Para quitarlas, dejar la lista vacía: [].
const OPINIONES_EJEMPLO = [
  { nombre: 'Xiomara Ccori', estrellas: 5, perfil: 'anime-naranja', fecha: '2026-10-01', texto: 'Lo llevo a la universidad todos los días y ya no boto ni un vaso. El oso panda se roba las miradas en clase.' },
  { nombre: 'Thiaguito', estrellas: 5, perfil: 'zorro', fecha: '2026-09-27', texto: 'Bacán la idea. Café rico y cero basura.' },
  { nombre: 'May Ticona', estrellas: 4, perfil: 'rosa', fecha: '2026-09-19', texto: 'Los diseños están hermosos, me costó elegir uno. Le quito una estrella porque quisiera más colores de tapa.' },
  { nombre: 'Gianfranco Poma', estrellas: 5, perfil: 'perrito', fecha: '2026-09-12', texto: 'Trabajo en oficina y el café me dura caliente hasta media mañana. Antes botaba dos vasos diarios, ahora ninguno.' },
  { nombre: 'Yadi', estrellas: 5, perfil: 'anime-azul', fecha: '2026-09-04', texto: 'Yo no tomo café y igual lo uso: emoliente en la mañana y chicha helada en la tarde. No se le queda el olor.' },
  { nombre: 'Brayan Y', estrellas: 3, osito: 'oso-polar', fecha: '2026-08-29', texto: 'Cumple, pero para mí es chico. Si sacan uno de más capacidad lo compro al toque.' },
  { nombre: 'Nayeli Chávez', estrellas: 5, perfil: 'mariposa', fecha: '2026-08-22', texto: 'Hice la cuenta: un vaso por día son más de trescientos al año. Con el envase me los ahorro todos.' },
  { nombre: 'Renzo Altamirano', estrellas: 4, perfil: 'loro', fecha: '2026-08-14', texto: 'Se me cayó dos veces de la carpeta y sigue enterito. El acero aguanta, solo se rayó un poco el dibujo.' },
  { nombre: 'Kiki', estrellas: 5, perfil: 'conejo', fecha: '2026-08-07', texto: 'Se lo regalé a mi hermana por su cumple y ahora lo lleva a todos lados. Buen regalo y útil.' },
  { nombre: 'El Jhona', estrellas: 5, osito: 'oso', fecha: '2026-07-30', texto: 'En el instituto ya somos varios con envase. Los tachos del pasillo se llenan menos, se nota.' },
  { nombre: 'Milagros Sulca', estrellas: 5, perfil: 'cerezo', fecha: '2026-07-24', texto: 'Mi mamá se adueñó del mío para su manzanilla, así que tuve que pedir otro. Ahora tenemos dos en casa.' },
  { nombre: 'Aldair22', estrellas: 4, perfil: 'gato', fecha: '2026-07-18', texto: 'Fácil de lavar, no gotea en la mochila. Me gustaría que tuviera una correa para colgarlo.' },
  { nombre: 'Fiorella Huanca', estrellas: 5, perfil: 'anime-coletas', fecha: '2026-07-11', texto: 'Me da gusto apoyar algo que piensa en el planeta. Pequeño cambio, pero suma.' },
  { nombre: 'Gerson Limachi', estrellas: 4, perfil: 'colibri', fecha: '2026-07-05', texto: 'Al inicio se me olvidaba traerlo. Ya es costumbre, como llevar las llaves.' },
  { nombre: 'Tefi Rojas', estrellas: 5, perfil: 'girasol', fecha: '2026-06-28', texto: 'Lo recargo en casa antes de salir y llego a clases con mi bebida lista. Cero plástico, cero sorbetes.' }
];
