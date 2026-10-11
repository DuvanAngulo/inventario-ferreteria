// ============ VARIABLES GLOBALES ============
let productos = [];        // Todos los productos tal cual vienen del JSON
let filtroActual = 'todos';

// ============ CARGAR EL JSON ============
fetch('data/productos.json')
  .then(respuesta => {
    if (!respuesta.ok) throw new Error('No se encontró productos.json');
    return respuesta.json();
  })
  .then(datos => {
    productos = datos;
    document.getElementById('contador').textContent =
      `Total: ${productos.length} registros`;
    renderizar(productos);
  })
  .catch(error => {
    document.getElementById('listaProductos').innerHTML =
      `<p class="vacio-msg">❌ Error cargando productos: ${error.message}</p>`;
  });

// ============ RENDERIZAR LISTA ============
function renderizar(lista) {
  const contenedor = document.getElementById('listaProductos');

  if (lista.length === 0) {
    contenedor.innerHTML = '<p class="vacio-msg">🔍 No se encontraron productos</p>';
    return;
  }

  // Agrupamos por código para mostrar los lotes juntos
  const agrupados = agruparPorCodigo(lista);

  contenedor.innerHTML = agrupados.map(item => {
    const esVacio = esNombreVacio(item.nombre);
    const esSistema = esProductoSistema(item.nombre);

    // Clases extra según el tipo
    let clasesExtra = '';
    let etiqueta = '';

    if (esVacio) {
      clasesExtra = ' es-vacio';
      etiqueta = '<span class="etiqueta vacio">sin nombre</span>';
    } else if (esSistema) {
      clasesExtra = ' es-vacio';
      etiqueta = '<span class="etiqueta sistema">no es producto</span>';
    }

    // Generamos las filas de lotes (precio + stock)
    const filas = item.lotes.map(lote => {
      const precioClass = lote.precio === 0 ? 'precio cero' : 'precio';
      const stockClass = lote.stock < 0 ? 'stock negativo' : 'stock';

      return `
        <div class="precio-linea">
          <span class="${precioClass}">$${formatearNumero(lote.precio)}</span>
          <span class="${stockClass}">Stock: ${formatearNumero(lote.stock)}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="card-item${clasesExtra}">
        <div class="codigo">${item.codigo || '(sin código)'}</div>
        <div class="nombre">${item.nombre || '(sin nombre)'}${etiqueta}</div>
        <div class="filas-precio">${filas}</div>
      </div>
    `;
  }).join('');
}

// ============ AGRUPAR POR CÓDIGO ============
function agruparPorCodigo(lista) {
  const mapa = new Map();

  lista.forEach(p => {
    const clave = p.codigo || '(sin-codigo)';
    if (!mapa.has(clave)) {
      mapa.set(clave, {
        codigo: p.codigo,
        nombre: p.nombre,
        lotes: []
      });
    }
    mapa.get(clave).lotes.push({
      precio: p.precio,
      stock: p.stock
    });
  });

  return Array.from(mapa.values());
}

// ============ FILTROS ============
document.querySelectorAll('.filtro-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filtro-chip').forEach(c => c.classList.remove('activo'));
    chip.classList.add('activo');
    filtroActual = chip.dataset.filtro;
    aplicarFiltros();
  });
});

// ============ BUSCADOR ============
document.getElementById('buscador').addEventListener('input', aplicarFiltros);

function aplicarFiltros() {
  const texto = document.getElementById('buscador').value.toLowerCase().trim();

  let filtrados = productos;

  // 1. Filtro por texto
  if (texto) {
    filtrados = filtrados.filter(p =>
      (p.nombre || '').toLowerCase().includes(texto) ||
      (p.codigo || '').toLowerCase().includes(texto)
    );
  }

  // 2. Filtro por chip
  if (filtroActual === 'con-stock') {
    filtrados = filtrados.filter(p => p.stock > 0);
  } else if (filtroActual === 'sin-stock') {
    filtrados = filtrados.filter(p => p.stock <= 0);
  } else if (filtroActual === 'precio-cero') {
    filtrados = filtrados.filter(p => p.precio === 0);
  }

  // Actualizamos contador
  document.getElementById('contador').textContent =
    `Mostrando: ${filtrados.length} de ${productos.length} registros`;

  renderizar(filtrados);
}

// ============ UTILIDADES ============
function formatearNumero(num) {
  if (num === 0 || num === null || num === undefined) return '0';
  // Formato colombiano con puntos de miles
  return new Intl.NumberFormat('es-CO').format(num);
}

function esNombreVacio(nombre) {
  if (!nombre) return true;
  const limpio = nombre.toLowerCase().trim();
  return limpio === 'vacio' || limpio === 'vacío' || limpio === 'vacio';
}

function esProductoSistema(nombre) {
  if (!nombre) return false;
  const n = nombre.toLowerCase();
  return (
    n.includes('productogenericonube') ||
    n.includes('registromanual') ||
    n.includes('registro manual') ||
    n.includes('transporte') ||
    n.includes('eventos comerciales') ||
    n.includes('aviso ayda') ||
    n.includes('servicios profesionales')
  );
}