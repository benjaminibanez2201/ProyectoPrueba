import * as yup from "yup";

export const registerValidationSchema = yup.object({
  name: yup
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .required("El nombre es obligatorio"),
  email: yup
    .string()
    .email("Debe ser un correo electrónico válido")
    .required("El email es obligatorio"),
  password: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .matches(/[A-Za-z]/, "La contraseña debe contener al menos una letra")
    .matches(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .required("La contraseña es obligatoria"),
  role: yup
    .string()
    .oneOf(["alumno", "coordinador"], "Rol no válido")
    .default("alumno"),
  tipo_practica: yup
    .string()
    .nullable()
    .optional(),
});
