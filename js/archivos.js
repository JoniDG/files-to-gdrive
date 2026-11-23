// Subida de archivos: UN pedido por archivo a POST ?ruta=archivos, con el
// archivo en base64 dentro del JSON (Apps Script no interpreta multipart).
// Un pedido por archivo: cada uno tiene su propio límite de tamaño y de
// tiempo, y si uno falla los demás siguen.

// El tipo que informa el navegador no es confiable: en Windows con Excel un
// .csv llega como "application/vnd.ms-excel", y las extensiones que el
// sistema no conoce llegan sin tipo. Por eso, si el tipo no está entre los
// permitidos, lo deducimos por la extensión.
const TIPO_POR_EXTENSION = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  pdf: "application/pdf",
  txt: "text/plain",
  csv: "text/csv",
};

function tipoDeArchivo(archivo) {
  if (CONFIG.TIPOS_PERMITIDOS.includes(archivo.type)) {
    return archivo.type;
  }
  const extension = archivo.name.split(".").pop().toLowerCase();
  return (
    TIPO_POR_EXTENSION[extension] || archivo.type || "application/octet-stream"
  );
}

function extensionesPermitidas() {
  return Object.keys(TIPO_POR_EXTENSION).filter((ext) =>
    CONFIG.TIPOS_PERMITIDOS.includes(TIPO_POR_EXTENSION[ext]),
  );
}

function leerComoBase64(archivo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(String(lector.result).split(",")[1]);
    lector.onerror = () => rechazar(lector.error);
    lector.readAsDataURL(archivo);
  });
}

function problemaAntesDeSubir(archivo, tipo) {
  if (!CONFIG.TIPOS_PERMITIDOS.includes(tipo)) {
    return `tipo no permitido (${tipo})`;
  }
  if (archivo.size === 0) {
    return "el archivo está vacío";
  }
  if (archivo.size > CONFIG.MAX_MB * 1024 * 1024) {
    return `pesa ${(archivo.size / 1024 / 1024).toFixed(1)} MB (máximo ${CONFIG.MAX_MB} MB)`;
  }
  return null;
}

function filaDeEstado(archivo) {
  const fila = document.createElement("li");
  const nombre = document.createElement("span");
  nombre.className = "archivo-nombre";
  nombre.textContent = archivo.name;
  const estado = document.createElement("span");
  estado.className = "archivo-estado";
  fila.append(nombre, estado);
  document.getElementById("listaArchivos").append(fila);

  return (tipo, contenido) => {
    fila.className = tipo;
    estado.replaceChildren(contenido);
  };
}

async function subirUno(archivo, token, mostrar) {
  const tipo = tipoDeArchivo(archivo);
  const problema = problemaAntesDeSubir(archivo, tipo);
  if (problema) {
    mostrar("error", `No se sube: ${problema}`);
    return false;
  }
  mostrar("pendiente", "Subiendo…");
  try {
    const datos = await llamarApi("archivos", {
      metodo: "POST",
      cuerpo: {
        token,
        nombre: archivo.name,
        mimeType: tipo,
        contenido: await leerComoBase64(archivo),
      },
    });
    // El link viene del servidor: solo lo usamos si es https (un
    // "javascript:..." en un href sería un agujero de seguridad).
    if (new URL(datos.url).protocol !== "https:") {
      throw new Error("La API devolvió un link inválido");
    }
    const link = document.createElement("a");
    link.href = datos.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Abrir en Drive";
    mostrar("ok", link);
    return true;
  } catch (error) {
    mostrar("error", error.message);
    return false;
  }
}

async function enParalelo(tareas, limite) {
  const resultados = [];
  let siguiente = 0;
  const trabajador = async () => {
    while (siguiente < tareas.length) {
      const indice = siguiente++;
      resultados[indice] = await tareas[indice]();
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limite, tareas.length) }, trabajador),
  );
  return resultados;
}

function iniciarSubidaDeArchivos() {
  const formulario = document.getElementById("formArchivos");
  const entrada = document.getElementById("archivos");
  const extensiones = extensionesPermitidas();
  // Tipos y extensiones: así el selector muestra los .csv aunque el sistema
  // los reconozca con otro tipo.
  entrada.accept = [
    ...CONFIG.TIPOS_PERMITIDOS,
    ...extensiones.map((ext) => `.${ext}`),
  ].join(",");
  document.getElementById("ayudaArchivos").textContent =
    `Tipos: ${extensiones.map((ext) => ext.toUpperCase()).join(", ")}. Máximo ${CONFIG.MAX_MB} MB por archivo.`;

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const token = tokenActual();
    if (!token) {
      mostrarAviso("avisoArchivos", "Pegá el token de la API arriba.", "error");
      return;
    }
    const archivos = [...entrada.files];
    if (archivos.length === 0) {
      mostrarAviso("avisoArchivos", "Elegí al menos un archivo.", "error");
      return;
    }

    ocultarAviso("avisoArchivos");
    document.getElementById("listaArchivos").replaceChildren();
    const boton = document.getElementById("botonSubir");
    boton.disabled = true;
    try {
      const tareas = archivos.map((archivo) => {
        const mostrar = filaDeEstado(archivo);
        mostrar("pendiente", "En espera…");
        return () => subirUno(archivo, token, mostrar);
      });
      const subidos = (
        await enParalelo(tareas, CONFIG.SUBIDAS_EN_PARALELO)
      ).filter(Boolean).length;
      const todos = subidos === archivos.length;
      mostrarAviso(
        "avisoArchivos",
        todos
          ? `${subidos} archivo(s) subido(s).`
          : `${subidos} de ${archivos.length} archivo(s) subido(s). Para reintentar, elegí de nuevo solo los que fallaron.`,
        todos ? "exito" : "error",
      );
    } finally {
      // Siempre vaciamos la selección: si no, al tocar "Subir" otra vez se
      // volverían a subir (y duplicar en Drive) los que ya subieron.
      formulario.reset();
      boton.disabled = false;
    }
  });
}
