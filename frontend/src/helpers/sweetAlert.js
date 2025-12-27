import Swal from "sweetalert2";

export function showErrorAlert(title, text) {
  Swal.fire({
    icon: "error",
    title: title,
    html: text,
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#d33",
  });
}

export function showSuccessAlert(title, text) {
  Swal.fire({
    icon: "success",
    title: title,
    text: text,
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#3085d6",
    timer: 3000,
  });
}

export function deleteDataAlert(onConfirm) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}

export function showInfoAlert(title, text) {
  Swal.fire({
    icon: "info", // Icono de información ("i")
    title: title,
    text: text,
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#3085d6", // Azul (color estándar de info)
  });
}

export function showHtmlAlert(title, html) {
  Swal.fire({
    icon: "info",
    title,
    html,
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#3085d6",
  });
}

export function showSelectAlert(title, text, options) {
  return Swal.fire({
    title,
    text,
    input: "select",
    inputOptions: options,
    inputPlaceholder: "Selecciona una opción",
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
  });
}

export function customAlert(options) {
  return Swal.fire(options);
}

// el html  para rechazar
export async function showRejectFormAlert() {
  return Swal.fire({
    title: "Rechazar Solicitud",
    html: `
      <p style="margin-bottom:10px; text-align:left; font-size: 0.9em; color:#555;">
        Indique el motivo y quién debe corregir:
      </p>
      
      <textarea id="swal-input1" class="swal2-textarea" 
        placeholder="Escriba aquí las observaciones..." 
        style="margin: 0 0 15px 0; width: 100%;">
      </textarea>
      
      <div style="text-align: left; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <label style="display:block; margin-bottom:8px; font-weight:bold; font-size:0.9em; color:#374151;">
          ¿A quién notificar el error?
        </label>
        
        <label style="display:flex; align-items:center; margin-bottom:6px; cursor:pointer;">
          <input type="radio" name="destinatario" value="alumno" checked style="margin-right:8px;">
          <span style="font-size:0.9em;">Alumno (Datos personales, documentos)</span>
        </label>
        
        <label style="display:flex; align-items:center; margin-bottom:6px; cursor:pointer;">
          <input type="radio" name="destinatario" value="empresa" style="margin-right:8px;">
          <span style="font-size:0.9em;">Empresa (Datos supervisor, funciones)</span>
        </label>
        
        <label style="display:flex; align-items:center; cursor:pointer;">
          <input type="radio" name="destinatario" value="ambos" style="margin-right:8px;">
          <span style="font-size:0.9em;">Ambos (Error general)</span>
        </label>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Rechazar",
    preConfirm: () => {
      const motivo = document.getElementById("swal-input1").value;
      const radio = document.querySelector(
        'input[name="destinatario"]:checked'
      );

      if (!motivo) {
        Swal.showValidationMessage("¡Debes escribir una observación!");
        return false;
      }

      return { motivo, destinatario: radio.value };
    },
  });
}

export function showConfirmAlert(title, text) {
  return Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
  });
}
