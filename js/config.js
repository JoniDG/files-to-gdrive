// Configuración de la página. Completá API_URL con la URL de tu web app
// (la que termina en /exec, ver src/backend/Conceptos.js en guide-appscript).
// La URL no es secreta; el token SÍ, por eso no va acá: se ingresa en la página.
const CONFIG = {
  API_URL: "PEGA_ACA_LA_URL_DE_TU_WEB_APP/exec",

  // Tienen que coincidir con los de la API (src/backend/Archivos.js), así la
  // página avisa antes de mandar algo que la API va a rechazar.
  MAX_MB: 10,
  TIPOS_PERMITIDOS: [
    "image/png",
    "image/jpeg",
    "application/pdf",
    "text/plain",
    "text/csv",
  ],

  // Cuántos archivos se suben a la vez: Apps Script tiene un límite de
  // ejecuciones simultáneas (~30 por usuario), y conviene no acercarse.
  SUBIDAS_EN_PARALELO: 3,

  CIUDADES: [
    "Buenos Aires",
    "Córdoba",
    "La Plata",
    "Mar del Plata",
    "Mendoza",
    "Neuquén",
    "Rosario",
    "Salta",
  ],
};
