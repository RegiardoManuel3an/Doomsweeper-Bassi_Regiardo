function validarFormulario() {
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const mensaje = document.getElementById("mensaje").value.trim();

  const nombreValido = /^[a-zA-Z0-9\s]+$/.test(nombre);
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const mensajeValido = mensaje.length > 5;

  if (!nombreValido) {
    alert("El nombre debe ser alfanumérico.");
    return false;
  }

  if (!emailValido) {
    alert("El correo electrónico no es válido.");
    return false;
  }

  if (!mensajeValido) {
    alert("El mensaje debe tener más de 5 caracteres.");
    return false;
  }

  const asunto = encodeURIComponent("Formulario de Contacto de " + nombre);
  const cuerpo = encodeURIComponent(
    "Nombre: " + nombre + "\nEmail: " + email + "\nMensaje:\n" + mensaje
  );

  window.location.href = `mailto:?subject=${asunto}&body=${cuerpo}`;
  return false;
}

// Esto conecta el evento submit del formulario con la función
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formularioContacto");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevenir envío automático
      validarFormulario();
    });
  }
});

function activarCampo(idFondo, idCampo) {
  const fondo = document.getElementById(idFondo);
  const campo = document.getElementById(idCampo);

  fondo.addEventListener("click", () => {
    campo.style.display = "block";
    campo.focus();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  activarCampo("fondoNombre", "nombre");
  activarCampo("fondoEmail", "email");
  activarCampo("fondoMensaje", "mensaje");
});