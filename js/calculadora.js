// ============ REFERENCIAS ============
const inputNombre     = document.getElementById('nombreProducto');
const inputRendimiento = document.getElementById('rendimiento');
const selectUnidad     = document.getElementById('unidad');
const inputRequerido   = document.getElementById('requerido');
const inputPrecioCaja  = document.getElementById('precioCaja');
const resultadoDiv     = document.getElementById('resultado');
const btnLimpiar       = document.getElementById('btnLimpiar');
const btnCopiar        = document.getElementById('btnCopiar');

// ============ CALCULAR EN TIEMPO REAL ============
[inputRendimiento, inputRequerido, inputPrecioCaja].forEach(input => {
  input.addEventListener('input', calcular);
});
selectUnidad.addEventListener('change', calcular);
inputNombre.addEventListener('input', calcular);

// ============ FUNCIÓN PRINCIPAL ============
function calcular() {
  const rendimiento = parseFloat(inputRendimiento.value);
  const requerido   = parseFloat(inputRequerido.value);
  const precioCaja  = parseFloat(inputPrecioCaja.value);
  const unidad      = selectUnidad.value;
  const nombre      = inputNombre.value.trim();

  // Validación mínima
  if (!rendimiento || !requerido || rendimiento <= 0 || requerido <= 0) {
    resultadoDiv.classList.remove('con-resultado');
    resultadoDiv.innerHTML =
      '<p class="placeholder-resultado">Ingresa rendimiento y cantidad para ver el resultado</p>';
    return;
  }

  // Cálculo: siempre redondeamos hacia arriba
  const cajas = Math.ceil(requerido / rendimiento);
  const cubre = cajas * rendimiento;
  const sobra = cubre - requerido;
  const total = precioCaja ? cajas * precioCaja : null;

  // Armamos el HTML del resultado
  let html = `
    <div class="resultado-principal">
      📦 ${cajas} caja${cajas !== 1 ? 's' : ''}
    </div>
    <div class="resultado-detalle">
  `;

  if (nombre) {
    html += `
      <div class="resultado-linea">
        <span class="label">Producto</span>
        <span class="valor">${nombre}</span>
      </div>
    `;
  }

  html += `
      <div class="resultado-linea">
        <span class="label">Rendimiento por caja</span>
        <span class="valor">${formatearNumero(rendimiento)} ${unidad}</span>
      </div>
      <div class="resultado-linea">
        <span class="label">Necesita</span>
        <span class="valor">${formatearNumero(requerido)} ${unidad}</span>
      </div>
      <div class="resultado-linea">
        <span class="label">Cubre con ${cajas} caja${cajas !== 1 ? 's' : ''}</span>
        <span class="valor">${formatearNumero(cubre)} ${unidad}</span>
      </div>
      <div class="resultado-linea">
        <span class="label">Sobra</span>
        <span class="valor">${formatearNumero(sobra)} ${unidad}</span>
      </div>
  `;

  if (total !== null) {
    html += `
      <div class="resultado-linea">
        <span class="label">Precio por caja</span>
        <span class="valor">$${formatearNumero(precioCaja)}</span>
      </div>
      <div class="resultado-linea total">
        <span class="label">TOTAL A COBRAR</span>
        <span class="valor">$${formatearNumero(total)}</span>
      </div>
    `;
  }

  html += `</div>`;

  resultadoDiv.classList.add('con-resultado');
  resultadoDiv.innerHTML = html;
}

// ============ BOTÓN LIMPIAR ============
btnLimpiar.addEventListener('click', () => {
  inputNombre.value = '';
  inputRendimiento.value = '';
  inputRequerido.value = '';
  inputPrecioCaja.value = '';
  selectUnidad.value = 'm²';
  calcular();
  inputRendimiento.focus();
});

// ============ BOTÓN COPIAR ============
btnCopiar.addEventListener('click', async () => {
  const rendimiento = parseFloat(inputRendimiento.value);
  const requerido   = parseFloat(inputRequerido.value);
  if (!rendimiento || !requerido) return;

  const unidad     = selectUnidad.value;
  const nombre     = inputNombre.value.trim();
  const precioCaja = parseFloat(inputPrecioCaja.value);

  const cajas = Math.ceil(requerido / rendimiento);
  const cubre = cajas * rendimiento;
  const sobra = cubre - requerido;
  const total = precioCaja ? cajas * precioCaja : null;

  let texto = '';
  if (nombre) texto += `Producto: ${nombre}\n`;
  texto += `Necesita: ${formatearNumero(requerido)} ${unidad}\n`;
  texto += `Cajas: ${cajas}\n`;
  texto += `Cubre: ${formatearNumero(cubre)} ${unidad}\n`;
  texto += `Sobra: ${formatearNumero(sobra)} ${unidad}\n`;
  if (total !== null) texto += `Total: $${formatearNumero(total)}\n`;

  try {
    await navigator.clipboard.writeText(texto);
    btnCopiar.textContent = '✓ Copiado';
    btnCopiar.classList.add('copiado');
    setTimeout(() => {
      btnCopiar.textContent = 'Copiar resultado';
      btnCopiar.classList.remove('copiado');
    }, 1500);
  } catch {
    alert('No se pudo copiar. Aquí está el resultado:\n\n' + texto);
  }
});

// ============ UTILIDADES ============
function formatearNumero(num) {
  if (num === 0 || num === null || num === undefined) return '0';
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 2
  }).format(num);
}

// ============ INICIALIZAR ============
calcular();