/**
 * SERVICIO DE FORMULARIOS
 * Gestiona el guardado, recuperación, corrección y eliminación de respuestas
 * de los formularios dinámicos (Bitácoras, Postulaciones, etc.)
 */
import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";
import { FormularioRespuesta } from "../entities/FormularioRespuesta.entity.js";
import { FormularioPlantilla } from "../entities/FormularioPlantilla.entity.js";
import { sendTokenEmail } from "./email.service.js";

// Repositorios necesarios
const practicaRepository = AppDataSource.getRepository(Practica);
const respuestaRepository = AppDataSource.getRepository(FormularioRespuesta);
const plantillaRepository = AppDataSource.getRepository(FormularioPlantilla);

/**
 * GUARDAR BITÁCORA
 * Registra un nuevo reporte semanal del alumno vinculado a su práctica activa
 */
export async function saveBitacoraResponse(practicaId, userId, respuestas) {
  // El tipo de formulario que buscamos en la base de datos
  const formType = "bitacora";

  // 1. Encontrar la Práctica y la Plantilla
  const practica = await practicaRepository.findOneBy({ id: practicaId });
  const plantilla = await plantillaRepository.findOneBy({ tipo: formType });

  if (!practica || !plantilla) {
    throw new Error(
      "Error de referencia: Práctica o plantilla no encontradas."
    );
  }

  // 2. Crear y Guardar la Respuesta
  const newResponse = respuestaRepository.create({
    datos: respuestas, // Datos JSON del formulario
    estado: "enviado",
    fecha_envio: new Date(),
    plantilla: plantilla,
    practica: practica,
    respondido_por: { id: userId },
  });

  return await respuestaRepository.save(newResponse);
}

/**
 * Función auxiliar para obtener plantillas
 */
export async function getPlantilla(tipo) {
  const plantilla = await plantillaRepository.findOne({ where: { tipo } });
  if (!plantilla) throw new Error("Plantilla de formulario no encontrada.");
  return plantilla;
}

/**
 * RECUPERAR RESPUESTA POR ID
 * Obtiene una respuesta específica incluyendo los datos de la plantilla y el alumno
 */
export async function getRespuestaById(id) {
  const respuesta = await respuestaRepository.findOne({
    where: { id },
    // Traer la plantilla para que el Front sepa cómo dibujar el formulario
    relations: ["plantilla", "practica", "practica.student"],
  });
  if (!respuesta) {
    throw new Error("Respuesta de formulario no encontrada.");
    error.status = 404;
    throw error;
  }
  return respuesta;
}

/**
 * CORREGIR POSTULACIÓN (Alumno)
 * Permite al alumno editar su postulación después de que el coordinador la "observó".
 * Gestiona el flujo: si es corrección mutua, envía el aviso a la empresa; si no, al coordinador.
 */
export async function corregirPostulacionRespuesta(
  respuestaId,
  alumnoId,
  nuevosDatos
) {
  const respuesta = await respuestaRepository.findOne({
    where: { id: Number(respuestaId) },
    relations: [
      "practica",
      "practica.student",
      "practica.empresaToken",
      "plantilla",
    ],
  });
  if (!respuesta) throw new Error("Respuesta no encontrada");
  if (respuesta.plantilla?.tipo !== "postulacion")
    throw new Error("Solo se puede corregir postulación");
  if (String(respuesta.practica.student.id) !== String(alumnoId))
    throw new Error("No autorizado");
  // Actualizamos sólo la porción del alumno dentro de la estructura original
  // Si la empresa aún no corrige, reflejamos los cambios del alumno también en raíz
  const prevDatos = respuesta.datos || {};
  let nextDatos = {
    ...prevDatos,
    datosFormulario: nuevosDatos,
    ...nuevosDatos,
  };
  respuesta.estado = "enviado";
  // Avanzamos estado de la práctica según a quién se pidió corrección
  const practica = await practicaRepository.findOne({
    where: { id: respuesta.practica.id },
    relations: ["empresaToken"],
  });
  if (!practica) throw new Error("Práctica no encontrada");
  // Siempre reflejamos los cambios del alumno al nivel raíz para visibilidad en todas las vistas
  respuesta.datos = nextDatos;
  await respuestaRepository.save(respuesta);
  // Marcar corrección del alumno realizada
  practica.correccion_alumno_hecha = true;
  if (practica.correccion_destinatario === "alumno") {
    practica.estado = "pendiente_validacion";
  } else if (practica.correccion_destinatario === "ambos") {
    // Alumno primero → enviar a empresa
    practica.estado = "enviada_a_empresa";
    // Disparar correo a la empresa con token para completar su parte
    try {
      const emailEmpresa = practica.empresaToken?.empresaCorreo;
      const nombreSupervisor =
        practica.empresaToken?.empresaNombre || "Supervisor";
      const token = practica.empresaToken?.token;
      const nombreAlumno = respuesta.practica?.student?.name || "Alumno";
      if (emailEmpresa && token) {
        await sendTokenEmail(
          emailEmpresa,
          nombreSupervisor,
          token,
          nombreAlumno
        );
      }
    } catch (e) {
      console.warn(
        "No se pudo enviar correo a empresa tras corrección del alumno:",
        e?.message
      );
    }
  } // si era 'empresa', no cambiamos el estado en corrección del alumno
  await practicaRepository.save(practica);
  return { respuesta, practica };
}

/**
 * ELIMINAR BITÁCORA
 * Borrado físico de un reporte semanal. Valida que solo el dueño pueda hacerlo
 */
export async function deleteBitacoraRespuesta(respuestaId, alumnoId) {
  const respuesta = await respuestaRepository.findOne({
    where: { id: Number(respuestaId) },
    relations: ["practica", "practica.student", "plantilla"],
  });

  if (!respuesta) {
    throw new Error("Bitácora no encontrada");
  }

  // Verificar que sea una bitácora
  if (respuesta.plantilla?.tipo !== "bitacora") {
    throw new Error("Solo se pueden eliminar bitácoras");
  }

  // Verificar que el alumno sea el dueño
  if (String(respuesta.practica.student.id) !== String(alumnoId)) {
    throw new Error("No autorizado para eliminar esta bitácora");
  }

  await respuestaRepository.remove(respuesta);

  return { message: "Bitácora eliminada correctamente" };
}
