// Función para validar RUT Chileno (Formato y Dígito Verificador)
export const validarRut = (rut) => {
  if (!rut) return true; // Si está vacío, que HTML required lo controle

  const valor = rut.replace(/\./g, "").replace(/-/g, "");
  const cuerpo = valor.slice(0, -1);
  const dv = valor.slice(-1).toUpperCase();

  if (cuerpo.length < 7) return false;

  let suma = 0;
  let multiplo = 2;
  for (let i = 1; i <= cuerpo.length; i++) {
    const index = multiplo * parseInt(cuerpo.charAt(cuerpo.length - i), 10);
    suma += index;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado =
    dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

  return dvCalculado === dv;
};

export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarTelefono = (fono) => {
  // Acepta números, espacios y símbolo +
  const regex = /^[0-9+\s]+$/;
  return regex.test(fono);
};

export const validarNombre = (name) => {
  const limpio = name.trim();

  // Evita doble espacio
  if (/\s{2,}/.test(limpio)) return false;

  // Letras + acentos + ñ + ü + espacios + guion SOLO entre letras
  const regex =
    /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:-[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:-[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*)*$/;

  return regex.test(limpio);
};

export const validarTexto = (value) => {
  const regex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
  return regex.test(value.trim());
};
