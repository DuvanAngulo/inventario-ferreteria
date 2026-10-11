// ============ DETECTAR QUÉ BODEGA MOSTRAR ============
const params = new URLSearchParams(window.location.search);
const numBodega = params.get('b') || '1';   // por defecto bodega 1
const archivoJSON = `data/bodega${numBodega}.json`;

// Actualizamos títulos según la bodega
document.getElementById('titulo-bodega').textContent = `🏢 Bodega ${numBodega}`;
document.title = `Bodega ${numBodega} - Ferretería`;

// ============ VARIABLES GLOBALES ============
let items = [];
let filtroActual = 'todos';

// ============ CARGAR EL JSON ============
fetch(archivoJSON)
  .then(respuesta => {
    if (!respuesta.ok) throw new Error(`No se encontró ${archivoJSON}`);
    return respuesta.json();
  })
  .then(datos => {
    items = datos;

    // Mostramos el nombre real de la bodega si viene en los datos
    const nombreBodega = items.find(i => i.bodega)?.bodega || '';
    if (nombreBodega) {
      document.getElementById('subtitulo-bodega').textContent = nombreBodega;
    } else {
      document.getElementById('subtitulo-bodega').textContent =
        `${items.length} productos en inventario`;
    }

    document.getElementById('contador').textContent =
      `Total: ${items.length} registros`;

    renderizar(items);
  })
  .catch(error => {
    document.getElementById('listaBodega').innerHTML =
      `<p class="vacio-msg">❌ Error cargando inventario: ${error.message}</p>`;
  });

// ============ RENDERIZAR LISTA ============
function renderizar(lista) {
  const contenedor = document.getElementById('listaBodega');

  if (lista.length === 0) {
    contenedor.innerHTML = '<p class="vacio-msg">🔍 No se encontraron productos</p>';
    return;
  }

  // Agrupamos por código para no repetir el mismo producto en varias líneas
  const agrupados = agruparPorCodigo(lista);

  contenedor.innerHTML = agrupados.map(item => {
    const esVacio = esNombreVacio(item.nombre);

    // Sumamos saldos si hay varios lotes del mismo código
    const saldoTotal = item.lotes.reduce((suma, l) => suma + l.saldo, 0);
    const saldoClass = saldoTotal < 0 ? 'stock negativo' : 'stock';

    const etiqueta = esVacio ? '<span class="etiqueta vacio">sin nombre</span>' : '';

    // Si hay más de un lote, mostramos el detalle
    let detalleLotes = '';
    if (item.lotes.length > 1) {
      detalleLotes = `
        <div class="filas-precio" style="margin-top:0.5rem;">
          ${item.lotes.map(l => `
            <div class="precio-linea">
              <span class="stock">Lote</span>
              <span class="${l.saldo < 0 ? 'stock negativo' : 'stock'}">${formatearNumero(l.saldo)}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    return `
      <div class="card-item${esVacio ? ' es-vacio' : ''}">
        <div class="codigo">${item.codigo || '(sin código)'}</div>
        <div class="nombre">${item.nombre || '(sin nombre)'}${etiqueta}</div>
        <div class="filas-precio">
          <div class="precio-linea">
            <span class="stock">Saldo total</span>
            <span class="${saldoClass}">${formatearNumero(saldoTotal)}</span>
          </div>
        </div>
        ${detalleLotes}
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
      saldo: p.saldo
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

  let filtrados = items;

  // 1. Filtro por texto
  if (texto) {
    filtrados = filtrados.filter(p =>
      (p.nombre || '').toLowerCase().includes(texto) ||
      (p.codigo || '').toLowerCase().includes(texto)
    );
  }

  // 2. Filtro por chip
  if (filtroActual === 'con-saldo') {
    filtrados = filtrados.filter(p => p.saldo > 0);
  } else if (filtroActual === 'sin-saldo') {
    filtrados = filtrados.filter(p => p.saldo <= 0);
  } else if (filtroActual === 'negativo') {
    filtrados = filtrados.filter(p => p.saldo < 0);
  }

  document.getElementById('contador').textContent =
    `Mostrando: ${filtrados.length} de ${items.length} registros`;

  renderizar(filtrados);
}

// ============ UTILIDADES ============
function formatearNumero(num) {
  if (num === 0 || num === null || num === undefined) return '0';
  return new Intl.NumberFormat('es-CO').format(num);
}

function esNombreVacio(nombre) {
  if (!nombre) return true;
  const limpio = nombre.toLowerCase().trim();
  return limpio === 'vacio' || limpio === 'vacío';
}