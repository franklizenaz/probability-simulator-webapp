// Configuración de cada experimento
const EXPERIMENTOS = {
  moneda: {
    resultados: ["Cara", "Cruz"],
    teorica: 0.5,
    generar: () => (Math.random() < 0.5 ? "Cara" : "Cruz"),
  },
  dado: {
    resultados: ["1", "2", "3", "4", "5", "6"],
    teorica: 1 / 6,
    generar: () => String(Math.floor(Math.random() * 6) + 1),
  },
};

// Elementos de la página
const formulario = document.getElementById("formulario");
const campoExperimento = document.getElementById("experimento");
const campoSimulaciones = document.getElementById("simulaciones");
const mensajeError = document.getElementById("error");
const seccionResultados = document.getElementById("resultados");
const elementoTotal = document.getElementById("total");
const contenedorResultados = document.getElementById("filas");
const figuraMoneda = document.getElementById("figura-moneda");
const figuraDado = document.getElementById("figura-dado");

// Formatea un número como porcentaje con máximo dos decimales
function porcentaje(valor) {
  return (valor * 100).toFixed(2) + "%";
}

function mostrarError(texto) {
  mensajeError.textContent = texto;
  mensajeError.hidden = false;
  seccionResultados.hidden = true;
}

// Icono de una moneda (cara o cruz)
function iconoMoneda(resultado) {
  if (resultado === "Cara") {
    return `<svg class="icono" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="20" class="moneda"></circle>
      <circle cx="17.5" cy="21" r="2.4" class="ojo"></circle>
      <circle cx="30.5" cy="21" r="2.4" class="ojo"></circle>
      <path d="M16 29 q8 7 16 0" class="trazo"></path>
    </svg>`;
  }
  return `<svg class="icono" viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="20" class="moneda"></circle>
    <path d="M16 16 L32 32 M32 16 L16 32" class="trazo"></path>
  </svg>`;
}

// Icono de un dado con las pipas del número correspondiente
function iconoDado(numero) {
  const posiciones = {
    1: [[24, 24]],
    2: [[16, 16], [32, 32]],
    3: [[16, 16], [24, 24], [32, 32]],
    4: [[16, 16], [32, 16], [16, 32], [32, 32]],
    5: [[16, 16], [32, 16], [24, 24], [16, 32], [32, 32]],
    6: [[16, 16], [32, 16], [16, 24], [32, 24], [16, 32], [32, 32]],
  };

  const pipas = posiciones[numero]
    .map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.6" class="pipa"></circle>`)
    .join("");

  return `<svg class="icono" viewBox="0 0 48 48" aria-hidden="true">
    <rect x="6" y="6" width="36" height="36" rx="9" class="dado"></rect>
    ${pipas}
  </svg>`;
}

// Devuelve el icono adecuado para cada resultado
function iconoResultado(resultado) {
  if (resultado === "Cara" || resultado === "Cruz") {
    return iconoMoneda(resultado);
  }
  return iconoDado(Number(resultado));
}

function mostrarResultados(experimento, conteos, total) {
  elementoTotal.textContent = total;
  contenedorResultados.innerHTML = "";

  experimento.resultados.forEach((resultado) => {
    const cantidad = conteos[resultado];
    const experimental = cantidad / total;
    const veces = cantidad === 1 ? "vez" : "veces";

    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-resultado";
    tarjeta.innerHTML = `
      <div class="resultado-cabecera">
        <span class="resultado-icono">${iconoResultado(resultado)}</span>
        <h3 class="resultado-nombre">${resultado}</h3>
        <p class="resultado-cantidad">${cantidad} <span>${veces}</span></p>
      </div>
      <div class="resultado-porcentajes">
        <span>Teórica: <strong>${porcentaje(experimento.teorica)}</strong></span>
        <span>Experimental: <strong>${porcentaje(experimental)}</strong></span>
      </div>
      <div class="barra">
        <div class="barra-relleno" style="--ancho: ${porcentaje(experimental)}"></div>
        <span class="marco-teorica" style="--pos: ${porcentaje(experimento.teorica)}"></span>
      </div>
    `;

    contenedorResultados.appendChild(tarjeta);
  });

  mensajeError.hidden = true;
  seccionResultados.hidden = false;
}

function simular() {
  const experimento = EXPERIMENTOS[campoExperimento.value];
  const numeroTexto = campoSimulaciones.value.trim();
  const numero = Number(numeroTexto);

  // Validaciones
  if (numeroTexto === "" || !Number.isInteger(numero) || numero <= 0) {
    mostrarError("Introduce un número entero mayor que 0.");
    return;
  }

  const conteos = {};
  experimento.resultados.forEach((resultado) => {
    conteos[resultado] = 0;
  });

  for (let i = 0; i < numero; i++) {
    const resultado = experimento.generar();
    conteos[resultado]++;
  }

  mostrarResultados(experimento, conteos, numero);
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  simular();
});

// Muestra en la cabecera la ilustración del experimento elegido
campoExperimento.addEventListener("change", () => {
  const esMoneda = campoExperimento.value === "moneda";
  figuraMoneda.classList.toggle("activa", esMoneda);
  figuraDado.classList.toggle("activa", !esMoneda);
});
