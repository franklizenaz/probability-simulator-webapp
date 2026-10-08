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
const cuerpoTabla = document.getElementById("filas");

// Formatea un número como porcentaje con máximo dos decimales
function porcentaje(valor) {
  return (valor * 100).toFixed(2) + "%";
}

function mostrarError(texto) {
  mensajeError.textContent = texto;
  mensajeError.hidden = false;
  seccionResultados.hidden = true;
}

function mostrarResultados(experimento, conteos, total) {
  elementoTotal.textContent = total;
  cuerpoTabla.innerHTML = "";

  experimento.resultados.forEach((resultado) => {
    const cantidad = conteos[resultado];
    const fila = document.createElement("tr");

    const celdaResultado = document.createElement("td");
    celdaResultado.textContent = resultado;

    const celdaCantidad = document.createElement("td");
    celdaCantidad.textContent = cantidad;

    const celdaTeorica = document.createElement("td");
    celdaTeorica.textContent = porcentaje(experimento.teorica);

    const celdaExperimental = document.createElement("td");
    celdaExperimental.textContent = porcentaje(cantidad / total);

    fila.append(celdaResultado, celdaCantidad, celdaTeorica, celdaExperimental);
    cuerpoTabla.appendChild(fila);
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
