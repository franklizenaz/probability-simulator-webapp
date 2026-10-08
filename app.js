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

// Colores disponibles en la urna (nombre → color de relleno)
const COLORES = {
  Rojo: "#e5484d",
  Azul: "#3e63dd",
  Verde: "#30a46c",
  Amarillo: "#f5b93f",
  Naranja: "#e8813a",
  Morado: "#8e4ec6",
};

// Elementos de la página
const formulario = document.getElementById("formulario");
const campoExperimento = document.getElementById("experimento");
const campoSimulaciones = document.getElementById("simulaciones");
const mensajeError = document.getElementById("error");
const seccionResultados = document.getElementById("resultados");
const elementoTotal = document.getElementById("total");
const contenedorResultados = document.getElementById("filas");
const seccionUrna = document.getElementById("urna");
const figuras = document.querySelectorAll(".figura");

// Formatea un número como porcentaje con máximo dos decimales
function porcentaje(valor) {
  return (valor * 100).toFixed(2) + "%";
}

// Devuelve la probabilidad teórica de un resultado:
// un número si todos los resultados son equiprobables, o el mapa si cada uno tiene la suya
function probabilidadTeorica(experimento, resultado) {
  if (typeof experimento.teorica === "number") {
    return experimento.teorica;
  }
  return experimento.teorica[resultado];
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

// Icono de una bola del color indicado
function iconoPelota(color) {
  return `<svg class="icono" viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="18" class="bola" style="fill: ${COLORES[color]}"></circle>
    <ellipse cx="18" cy="17" rx="5" ry="3.5" class="brillo" transform="rotate(-30 18 17)"></ellipse>
  </svg>`;
}

// Devuelve el icono adecuado para cada resultado
function iconoResultado(resultado) {
  if (resultado === "Cara" || resultado === "Cruz") {
    return iconoMoneda(resultado);
  }
  if (COLORES[resultado]) {
    return iconoPelota(resultado);
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
        <span>Teórica: <strong>${porcentaje(probabilidadTeorica(experimento, resultado))}</strong></span>
        <span>Experimental: <strong>${porcentaje(experimental)}</strong></span>
      </div>
      <div class="barra">
        <div class="barra-relleno" style="--ancho: ${porcentaje(experimental)}"></div>
        <span class="marco-teorica" style="--pos: ${porcentaje(probabilidadTeorica(experimento, resultado))}"></span>
      </div>
    `;

    contenedorResultados.appendChild(tarjeta);
  });

  mensajeError.hidden = true;
  seccionResultados.hidden = false;
}

// Saca una bola al azar de la urna (con reposición: cada ensayo es independiente)
function extraerBola(conteos, total) {
  let numero = Math.floor(Math.random() * total);

  for (const color of Object.keys(conteos)) {
    if (numero < conteos[color]) {
      return color;
    }
    numero -= conteos[color];
  }

  return Object.keys(conteos)[0];
}

// Lee la composición de la urna del formulario y devuelve el experimento listo,
// o un mensaje de error si la composición no es válida
function prepararUrna() {
  const campos = document.querySelectorAll("#urna input");
  const conteos = {};
  let total = 0;

  for (const campo of campos) {
    const cantidad = Number(campo.value);

    if (campo.value.trim() === "" || !Number.isInteger(cantidad) || cantidad < 0) {
      return { error: "La urna necesita números enteros mayores o iguales que 0." };
    }

    if (cantidad > 0) {
      conteos[campo.dataset.color] = cantidad;
      total += cantidad;
    }
  }

  if (total === 0) {
    return { error: "Añade al menos una bola a la urna." };
  }

  const resultados = Object.keys(conteos);
  const teorica = {};

  for (const color of resultados) {
    teorica[color] = conteos[color] / total;
  }

  return {
    experimento: {
      resultados: resultados,
      teorica: teorica,
      generar: () => extraerBola(conteos, total),
    },
  };
}

function simular() {
  const numeroTexto = campoSimulaciones.value.trim();
  const numero = Number(numeroTexto);

  // Validaciones
  if (numeroTexto === "" || !Number.isInteger(numero) || numero <= 0) {
    mostrarError("Introduce un número entero mayor que 0.");
    return;
  }

  // La urna depende de los campos del formulario; el resto son fijos
  let experimento = EXPERIMENTOS[campoExperimento.value];

  if (campoExperimento.value === "urna") {
    const urna = prepararUrna();
    if (urna.error) {
      mostrarError(urna.error);
      return;
    }
    experimento = urna.experimento;
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
// y la composición de la urna solo cuando toca
campoExperimento.addEventListener("change", () => {
  const valor = campoExperimento.value;

  figuras.forEach((figura) => {
    figura.classList.toggle("activa", figura.id === "figura-" + valor);
  });

  seccionUrna.hidden = valor !== "urna";
});
