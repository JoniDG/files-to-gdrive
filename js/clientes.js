// Alta de cliente: POST ?ruta=clientes. La API valida todo (y es la que
// manda); acá validamos lo básico solo para avisar rápido.

function iniciarAltaDeCliente() {
  const ciudad = document.getElementById("ciudad");
  for (const nombre of CONFIG.CIUDADES) {
    ciudad.append(new Option(nombre, nombre));
  }

  const formulario = document.getElementById("formCliente");
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    ocultarAviso("avisoCliente");

    const token = tokenActual();
    if (!token) {
      mostrarAviso("avisoCliente", "Pegá el token de la API arriba.", "error");
      return;
    }
    // valueAsNumber da NaN si el campo está vacío; ahí mandamos 0.
    const monto = document.getElementById("monto").valueAsNumber;
    const cliente = {
      nombre: document.getElementById("nombre").value.trim(),
      email: document.getElementById("email").value.trim(),
      ciudad: ciudad.value,
      monto: Number.isNaN(monto) ? 0 : monto,
      activo: document.getElementById("activo").checked,
    };
    if (
      cliente.nombre.length < 2 ||
      !cliente.email.includes("@") ||
      !cliente.ciudad
    ) {
      mostrarAviso(
        "avisoCliente",
        "Completá nombre, un email válido y la ciudad.",
        "error",
      );
      return;
    }

    const boton = document.getElementById("botonCliente");
    boton.disabled = true;
    try {
      const creado = await llamarApi("clientes", {
        metodo: "POST",
        cuerpo: { token, ...cliente },
      });
      mostrarAviso(
        "avisoCliente",
        `Cliente ${creado.id} creado: ${creado.nombre}.`,
        "exito",
      );
      formulario.reset();
    } catch (error) {
      mostrarAviso("avisoCliente", error.message, "error");
    } finally {
      boton.disabled = false;
    }
  });
}
