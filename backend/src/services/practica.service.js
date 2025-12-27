/**
 * SERVICIO DE PRÁCTICAS
 * Gestiona la lógica principal del sistema, incluyendo postulaciones,
 * estados de flujo y la integración con correos y formularios
 */
import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";
import { EmpresaToken } from "../entities/empresaToken.entity.js";
import { User } from "../entities/user.entity.js";
import { FormularioRespuesta } from "../entities/FormularioRespuesta.entity.js";
import { FormularioPlantilla } from "../entities/FormularioPlantilla.entity.js";
import {
  sendTokenEmail,
  sendSolicitudEvaluacionEmail,
} from "./email.service.js";
import crypto from "crypto";
import { In } from "typeorm";

const practicaRepository = AppDataSource.getRepository(Practica);
const tokenRepository = AppDataSource.getRepository(EmpresaToken);
const userRepository = AppDataSource.getRepository(User);
const respuestaRepository = AppDataSource.getRepository(FormularioRespuesta);
const plantillaRepository = AppDataSource.getRepository(FormularioPlantilla);

/**
 * OBTENER TODAS LAS PRÁCTICAS
 * Recupera la lista completa con relaciones clave para el panel del coordinador
 */
export async function findPracticas() {
  return await practicaRepository.find({
    relations: [
      "student",
      "empresaToken",
      "formularioRespuestas",
      "formularioRespuestas.plantilla",
    ],
  });
}

/**
 * OBTENER PRÁCTICA POR ID (CON UNIFICACIÓN DE DOCUMENTOS)
 * Recupera una práctica y transforma las respuestas de bitácoras y evaluaciones
 * en objetos tipo "documento" para que el frontend los muestre en una sola lista
 */
export async function findPracticaById(id) {
  const practica = await practicaRepository.findOne({
    where: { id },
    relations: [
      "student",
      "empresaToken",
      "documentos",
      "formularioRespuestas",
      "formularioRespuestas.plantilla",
    ],
  });
  if (!practica) throw new Error("Práctica no encontrada");
  const documentosArchivos = practica.documentos || [];

  // Transformamos respuestas de formularios en formato compatible con documentos
  const bitacoraRespuestas = practica.formularioRespuestas
    .filter((respuesta) => respuesta.plantilla?.tipo === "bitacora")
    .map((respuesta) => ({
      id: respuesta.id,
      tipo: "bitacora",
      fecha_creacion: respuesta.fecha_envio,
      estado: "enviado",
      es_respuesta_formulario: true,
    }));

  const evaluacionRespuestas = practica.formularioRespuestas
    .filter(
      (respuesta) =>
        respuesta.plantilla?.tipo === "evaluacion_pr1" ||
        respuesta.plantilla?.tipo === "evaluacion_pr2"
    )
    .map((respuesta) => ({
      id: respuesta.id,
      tipo: "evaluacion",
      subtipo: respuesta.plantilla?.tipo,
      fecha_creacion: respuesta.fecha_envio,
      estado: "enviado",
      es_respuesta_formulario: true,
    }));

  // Unificamos archivos físicos (.pdf, .docx) con las respuestas dinámicas
  practica.documentos = [
    ...documentosArchivos,
    ...bitacoraRespuestas,
    ...evaluacionRespuestas,
  ];
  return practica;
}

// Crear nueva práctica (Admin)
export async function createPractica(data) {
  const nueva = practicaRepository.create(data);
  return await practicaRepository.save(nueva);
}
// Actualizar práctica
export async function updatePractica(id, changes) {
  const practica = await findPracticaById(id);
  practicaRepository.merge(practica, changes);
  return await practicaRepository.save(practica);
}

/**
 * CREAR POSTULACIÓN (Proceso crítico)
 * Valida que el alumno no tenga prácticas activas, crea el registro,
 * genera el token de empresa y envía el correo inicial
 */
export async function createPostulacion(data, studentId) {
  const estadosActivos = [
    "enviada_a_empresa",
    "pendiente_validacion",
    "en_curso",
    "finalizada",
    "evaluada",
  ];
  const existingPractica = await practicaRepository.findOne({
    where: {
      student: { id: studentId },
      estado: In(estadosActivos),
    },
  });
  // Un alumno no puede postular si ya tiene un proceso en curso
  if (existingPractica) {
    throw new Error(
      `Ya tienes una práctica activa (Estado: ${existingPractica.estado}).`
    );
  }

  const alumno = await userRepository.findOneBy({ id: studentId });
  if (!alumno) throw new Error("Usuario alumno no encontrado");

  const plantillaPostulacion = await plantillaRepository.findOne({
    where: { tipo: "postulacion" },
  });

  if (!plantillaPostulacion) {
    throw new Error(
      "Error del sistema: No existe la plantilla de 'postulacion'. Contacte al soporte."
    );
  }

  const practicaData = practicaRepository.create({
    estado: "enviada_a_empresa",
    student: alumno,
  });
  const newPractica = await practicaRepository.save(practicaData);

  const nuevaRespuesta = respuestaRepository.create({
    datos: data,
    estado: "enviado",
    fecha_envio: new Date(),
    plantilla: plantillaPostulacion,
    practica: newPractica,
  });
  await respuestaRepository.save(nuevaRespuesta);

  const token = crypto.randomBytes(20).toString("hex");
  const fechaExpiracion = new Date();
  fechaExpiracion.setDate(fechaExpiracion.getDate() + 30);

  const tokenData = tokenRepository.create({
    token: token,
    empresaNombre: data.nombreEmpresa,
    empresaCorreo: data.emailEmpresa,
    expiracion: fechaExpiracion,
    practica: newPractica,
  });

  await tokenRepository.save(tokenData);

  try {
    await sendTokenEmail(
      data.emailEmpresa,
      data.nombreRepresentante,
      tokenData.token,
      alumno.name || "Un Estudiante"
    );
  } catch (emailError) {
    console.error("La postulación se creó pero el correo falló:", emailError);
  }

  return await findPracticaById(newPractica.id);
}

export async function deletePractica(id) {
  const practica = await findPracticaById(id);
  return await practicaRepository.remove(practica);
}

export async function findPracticaByStudentId(studentId) {
  if (!studentId) return null;

  const practica = await practicaRepository.findOne({
    where: { student: { id: studentId } },
    relations: [
      "student",
      "empresaToken",
      "documentos",
      "formularioRespuestas",
      "formularioRespuestas.plantilla",
    ],
  });
  if (!practica) return null;
  const documentosArchivos = practica.documentos || [];
  const bitacoraRespuestas = practica.formularioRespuestas
    .filter((respuesta) => respuesta.plantilla?.tipo === "bitacora")
    .map((respuesta) => ({
      id: respuesta.id,
      tipo: "bitacora",
      fecha_creacion: respuesta.fecha_envio,
      estado: "enviado",
      es_respuesta_formulario: true,
    }));

  const evaluacionRespuestas = practica.formularioRespuestas
    .filter(
      (respuesta) =>
        respuesta.plantilla?.tipo === "evaluacion_pr1" ||
        respuesta.plantilla?.tipo === "evaluacion_pr2"
    )
    .map((respuesta) => ({
      id: respuesta.id,
      tipo: "evaluacion",
      subtipo: respuesta.plantilla?.tipo,
      fecha_creacion: respuesta.fecha_envio,
      estado: "enviado",
      es_respuesta_formulario: true,
    }));

  // d) Unificar la lista
  practica.documentos = [
    ...documentosArchivos,
    ...bitacoraRespuestas,
    ...evaluacionRespuestas,
  ];
  return practica;
}

/**
 * ACTUALIZAR ESTADO (Con limpieza en cascada)
 * Si el coordinador devuelve a "pendiente", el sistema borra el rastro de la práctica
 * para que el alumno pueda corregir desde cero
 */
export async function actualizarEstadoPractica(id, nuevoEstado) {
  const practica = await practicaRepository.findOne({ where: { id } });

  if (!practica) {
    throw new Error("Práctica no encontrada");
  }

  // Si se vuelve a "pendiente", se eliminan práctica y datos asociados
  if (nuevoEstado === "pendiente") {
    const token = await tokenRepository.findOne({
      where: { practica: { id } },
    });
    if (token) await tokenRepository.remove(token);

    const respuestas = await respuestaRepository.find({
      where: { practica: { id } },
    });
    if (respuestas.length > 0) await respuestaRepository.remove(respuestas);

    await practicaRepository.remove(practica);

    return { practica: null, eliminada: true };
  }

  practica.estado = nuevoEstado;
  const updated = await practicaRepository.save(practica);

  return { practica: updated, eliminada: false };
}

// Finalizar práctica por parte del alumno
export async function finalizarPracticaAlumno(practicaId, alumnoId) {
  const practica = await practicaRepository.findOne({
    where: { id: practicaId },
    relations: [
      "student",
      "empresaToken",
      "formularioRespuestas",
      "formularioRespuestas.plantilla",
    ],
  });

  if (!practica) {
    throw new Error("Práctica no encontrada");
  }

  if (practica.student?.id !== alumnoId) {
    throw new Error("No autorizado");
  }

  if (practica.estado !== "en_curso" && practica.estado !== "finalizada") {
    throw new Error("La práctica debe estar en curso para finalizar.");
  }

  const postResp = practica.formularioRespuestas?.find(
    (r) => r.plantilla?.tipo === "postulacion"
  );
  const tipoPractica = postResp?.datos?.tipo_practica;
  practica.nivel = tipoPractica === "Profesional II" ? "pr2" : "pr1";

  practica.estado = "finalizada";
  practica.evaluacion_pendiente = true;

  let tokenValue = practica.empresaToken?.token;
  if (!tokenValue) {
    tokenValue = crypto.randomBytes(20).toString("hex");
    const fechaExp = new Date();
    fechaExp.setDate(fechaExp.getDate() + 30);

    const nuevoToken = tokenRepository.create({
      token: tokenValue,
      empresaNombre:
        practica.empresa?.name || practica.empresaToken?.empresaNombre || null,
      empresaCorreo:
        practica.empresa?.email || practica.empresaToken?.empresaCorreo || null,
      expiracion: fechaExp,
      practica,
    });
    await tokenRepository.save(nuevoToken);
  }

  await practicaRepository.save(practica);

  // Enviar correo de solicitud de evaluación a la empresa/supervisor
  try {
    const post = practica.formularioRespuestas?.find(
      (r) => r.plantilla?.tipo === "postulacion"
    );
    const correo =
      post?.datos?.correo_supervisor ||
      practica.empresa?.email ||
      practica.empresaToken?.empresaCorreo;
    const nombreRep =
      post?.datos?.nombre_supervisor ||
      practica.empresa?.name ||
      practica.empresaToken?.empresaNombre ||
      "Supervisor";
    if (correo) {
      const nivelTexto =
        practica.nivel === "pr2" ? "Profesional II" : "Profesional I";
      await sendSolicitudEvaluacionEmail(
        correo,
        nombreRep,
        tokenValue,
        practica.student?.name || "Alumno",
        nivelTexto
      );
    }
  } catch (e) {
    console.warn("No se pudo enviar correo de evaluación:", e.message);
  }

  return {
    id: practica.id,
    estado: practica.estado,
    evaluacion_pendiente: practica.evaluacion_pendiente,
  };
}
