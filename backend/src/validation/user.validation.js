import * as yup from "yup";

export const registerValidationSchema = yup.object({
  name: yup
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .matches(/^[A-Za-záéíóúÁÉÍÓÚÑñÜü\s-]+$/,"El nombre solo puede contener letras, tildes, espacios y guiones.")
    .required("El nombre es obligatorio."),
  email: yup
    .string()
    .email("Debe ser un correo institucional válido.")
    .required("El email es obligatorio."),
  password: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres.")
    .matches(/[A-Z]/, "La contraseña debe contener al menos una mayúscula.")
    .matches(/[0-9]/, "La contraseña debe contener al menos un número.")
    .required("La contraseña es obligatoria."),
  role: yup
    .string()
    .oneOf(["alumno", "coordinador"], "Rol no válido")
    .default("alumno"),
  tipo_practica: yup
    .string()
    .nullable()
    .optional(),
});
