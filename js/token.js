// El token de la API (API_TOKEN de guide-appscript). Nunca va en el código:
// se pega en la página y, si la persona quiere, se recuerda SOLO en este
// navegador (localStorage). localStorage puede no estar disponible (modo
// privado, cookies bloqueadas): por eso cada acceso va en try/catch.
const CLAVE_TOKEN = "files-to-gdrive.token";

function leerTokenGuardado() {
  try {
    return localStorage.getItem(CLAVE_TOKEN) || "";
  } catch {
    return "";
  }
}

function guardarToken(token) {
  try {
    localStorage.setItem(CLAVE_TOKEN, token);
  } catch {
    // Sin localStorage, el token vale solo mientras la página esté abierta.
  }
}

function olvidarToken() {
  try {
    localStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // Nada que borrar.
  }
}

function tokenActual() {
  return document.getElementById("token").value.trim();
}

function iniciarCampoDeToken() {
  const campo = document.getElementById("token");
  const recordar = document.getElementById("recordarToken");
  const guardado = leerTokenGuardado();
  campo.value = guardado;
  recordar.checked = guardado !== "";

  const sincronizar = () => {
    if (recordar.checked && campo.value.trim()) {
      guardarToken(campo.value.trim());
    } else {
      olvidarToken();
    }
  };
  campo.addEventListener("change", sincronizar);
  recordar.addEventListener("change", sincronizar);
}
