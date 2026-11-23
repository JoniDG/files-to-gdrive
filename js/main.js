function mostrarAviso(id, texto, tipo) {
  const aviso = document.getElementById(id);
  aviso.textContent = texto;
  aviso.className = `aviso visible ${tipo}`;
}

function ocultarAviso(id) {
  document.getElementById(id).className = "aviso";
}

document.addEventListener("DOMContentLoaded", () => {
  if (!apiConfigurada()) {
    mostrarAviso(
      "avisoConfig",
      "Falta configurar la URL de la API en js/config.js (la que termina en /exec).",
      "error",
    );
  }
  iniciarCampoDeToken();
  iniciarSubidaDeArchivos();
  iniciarAltaDeCliente();
});
