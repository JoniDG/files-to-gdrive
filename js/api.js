// Cliente de la API de guide-appscript (src/backend/Router.js).
//
// Reglas que impone Apps Script y que este helper resuelve:
// - La ruta va en ?ruta=... y no en el path: Google manda al login a los
//   pedidos anónimos a /exec/<path>.
// - El JSON se manda como text/plain: con application/json el navegador
//   hace un "preflight" CORS que Apps Script no responde.
// - La respuesta llega después de una redirección a
//   script.googleusercontent.com (fetch la sigue sola).
// - La respuesta HTTP es siempre 200: el resultado real viene en el JSON
//   { ok, status, data | error }.
// - Si la ejecución falla fuera del código de la API (cuota, permisos,
//   implementación inexistente), Google devuelve HTML en vez de JSON.

// Solo /exec: la URL /dev exige iniciar sesión, y desde esta página los
// pedidos van sin cookies de Google.
function apiConfigurada() {
  return /^https:\/\/script\.google\.com\/.+\/exec$/.test(CONFIG.API_URL);
}

async function llamarApi(ruta, { metodo = "GET", cuerpo = null } = {}) {
  if (!apiConfigurada()) {
    throw new Error(
      "Falta configurar API_URL en js/config.js (la URL del web app que termina en /exec).",
    );
  }
  const url = new URL(CONFIG.API_URL);
  url.search = new URLSearchParams({ ruta }).toString();

  const opciones = { method: metodo };
  if (metodo === "POST") {
    opciones.headers = { "Content-Type": "text/plain;charset=utf-8" };
    opciones.body = JSON.stringify(cuerpo ?? {});
  }

  let texto;
  try {
    const respuesta = await fetch(url, opciones);
    texto = await respuesta.text();
  } catch (error) {
    throw new Error(
      `No se pudo conectar con la API (${error.message}). Revisá la URL en js/config.js, que el web app esté ` +
        `publicado con acceso "Cualquier persona" y tu conexión.`,
    );
  }

  let json;
  try {
    json = JSON.parse(texto);
  } catch {
    throw new Error(
      "La API no devolvió JSON (Google respondió una página de error). Revisá que la URL sea la de /exec y que la implementación exista.",
    );
  }
  if (!json?.ok) {
    throw new Error(json?.error || `Error ${json?.status}`);
  }
  return json.data;
}
