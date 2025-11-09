import Swal from 'sweetalert2';

export function showErrorAlert(title, text) {
  Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#d33'
  });
}

export function showSuccessAlert(title, text) {
  Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#3085d6',
    timer: 3000
  });
}

export function deleteDataAlert(onConfirm) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}
