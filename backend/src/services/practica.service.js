import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";
import { EmpresaToken } from "../entities/empresaToken.entity.js";
import { User } from "../entities/user.entity.js";
// 👇 1. IMPORTACIONES NUEVAS
import { FormularioRespuesta } from "../entities/FormularioRespuesta.entity.js";
import { FormularioPlantilla } from "../entities/FormularioPlantilla.entity.js";
import { sendTokenEmail } from "./email.service.js";
import crypto from 'crypto';
import { In } from "typeorm";

const practicaRepository = AppDataSource.getRepository(Practica);
const tokenRepository = AppDataSource.getRepository(EmpresaToken);
const userRepository = AppDataSource.getRepository(User);
// 👇 2. REPOSITORIOS NUEVOS
const respuestaRepository = AppDataSource.getRepository(FormularioRespuesta);
const plantillaRepository = AppDataSource.getRepository(FormularioPlantilla);

// Obtener todas las prácticas
export async function findPracticas() {
  return await practicaRepository.find({
    // Agregamos formularioRespuestas para que el admin pueda verlas si quiere
    relations: ['student', 'empresaToken', 'formularioRespuestas', 'formularioRespuestas.plantilla']
  });
}

// Obtener práctica por ID
export async function findPracticaById(id) {
  const practica = await practicaRepository.findOne({ 
    where: { id },
    // 👇 Vital: Traer las respuestas para mostrarlas en el modal del Coordinador
    relations: ['student', 'empresaToken','documentos', 'formularioRespuestas', 'formularioRespuestas.plantilla'] 
  });
  if (!practica) throw new Error("Práctica no encontrada");
  // --- 2. LÓGICA DE UNIFICACIÓN (Bitácoras + Documentos) ---   
  // a) Documentos de Archivo (Informes, CV, etc.)
  const documentosArchivos = practica.documentos || [];
  
  // b) Mapear las Respuestas de Bitácora a un formato de Documento
  const bitacoraRespuestas = practica.formularioRespuestas
      // Filtramos solo las respuestas que sean de tipo 'bitacora'
      .filter(respuesta => respuesta.plantilla?.tipo === 'bitacora')
      .map(respuesta => ({
          // Usamos el ID de la Respuesta de Formulario para seguimiento
          id: respuesta.id, 
          tipo: "bitacora", // Nombre legible para el Frontend/Tracker
          fecha_creacion: respuesta.fecha_envio, // Usamos la fecha de envío
          // Asumimos que toda bitácora guardada está 'enviada' para el tracker
          estado: 'enviado', 
          // Esto es crucial para que el Front pueda distinguir la Bitácora real del Documento
          es_respuesta_formulario: true 
      }));

  // c) Unificar la lista para el Frontend
  practica.documentos = [...documentosArchivos, ...bitacoraRespuestas]; 
  return practica;
}

// Crear nueva práctica (Admin)
export async function createPractica(data) {
  const nueva = practicaRepository.create(data);
  return await practicaRepository.save(nueva);
}

// Actualizar una práctica
export async function updatePractica(id, changes) {
  const practica = await findPracticaById(id);
  practicaRepository.merge(practica, changes);
  return await practicaRepository.save(practica);
}

// --- FUNCIÓN "MOTOR" PARA EL RF13 (ACTUALIZADA CON RESPUESTAS) ---
export async function createPostulacion(data, studentId) {
  
  // A. Verificamos si el alumno ya tiene una práctica ACTIVA
  const estadosActivos = [
      "enviada_a_empresa", 
      "pendiente_validacion", 
      "en_curso", 
      "finalizada", 
      "evaluada"
  ];
  const existingPractica = await practicaRepository.findOne({
    where: {
      student: { id: studentId },
      estado: In(estadosActivos)
    }
  });
  if (existingPractica) {
    throw new Error(`Ya tienes una práctica activa (Estado: ${existingPractica.estado}).`);
  }

  // B. Buscamos al usuario real
  const alumno = await userRepository.findOneBy({ id: studentId });
  if (!alumno) throw new Error("Usuario alumno no encontrado");

  // C. 👇 BUSCAR LA PLANTILLA DE POSTULACIÓN
  // Esto es vital. Asumimos que tienes una plantilla con tipo 'postulacion'
  const plantillaPostulacion = await plantillaRepository.findOne({ where: { tipo: 'postulacion' } });
  
  if (!plantillaPostulacion) {
     // Si esto falla, es porque no corriste el seeder de formularios
     throw new Error("Error del sistema: No existe la plantilla de 'postulacion'. Contacte al soporte.");
  }

  // D. Creamos la Práctica (Limpia, sin columna 'datos')
  const practicaData = practicaRepository.create({
    estado: 'enviada_a_empresa', 
    student: alumno, 
  });
  const newPractica = await practicaRepository.save(practicaData);

  // E. 👇 GUARDAR LA RESPUESTA EN LA TABLA SEPARADA
  const nuevaRespuesta = respuestaRepository.create({
      datos: data, // Aquí va el JSON completo del formulario
      estado: 'enviado',
      fecha_envio: new Date(),
      plantilla: plantillaPostulacion, // Relación con la plantilla
      practica: newPractica            // Relación con la práctica
  });
  await respuestaRepository.save(nuevaRespuesta);

  // F. Generamos el token
  const token = crypto.randomBytes(20).toString('hex');
  const fechaExpiracion = new Date();
  fechaExpiracion.setDate(fechaExpiracion.getDate() + 30);

  // G. Creamos el Token de Empresa
  const tokenData = tokenRepository.create({
    token: token,
    empresaNombre: data.nombreEmpresa,
    empresaCorreo: data.emailEmpresa,
    expiracion: fechaExpiracion,
    practica: newPractica, 
  });
  
  await tokenRepository.save(tokenData);

  // H. Envío de Correo
  try {
    await sendTokenEmail(
      data.emailEmpresa, 
      data.nombreRepresentante, 
      tokenData.token, 
      alumno.name || "Un Estudiante"
    );
  } catch (emailError) {
    console.error("⚠️ La postulación se creó pero el correo falló:", emailError);
  }

  // I. Devolvemos la práctica completa (re-consultando para traer relaciones)
  return await findPracticaById(newPractica.id);
}

// Eliminar una práctica 
export async function deletePractica(id) {
  const practica = await findPracticaById(id);
  return await practicaRepository.remove(practica);
}

// Buscar la practica del alumno por su id de usuario
export async function findPracticaByStudentId(studentId) {
  if (!studentId) return null; 

  const practica = await practicaRepository.findOne({
    where: { student: { id: studentId } },
    // 👇 Agregamos las relaciones aquí también para que el alumno vea sus respuestas si quiere
    relations: ['student','empresaToken', 'documentos', 'formularioRespuestas', 'formularioRespuestas.plantilla'] 
  });
  if (!practica) return null;
  // --- 2. LÓGICA DE UNIFICACIÓN (Bitácoras + Documentos) ---
  // a) Documentos de Archivo (Informes, CV, etc.)
  const documentosArchivos = practica.documentos || [];
  // b) Mapear las Respuestas de Bitácora a un formato de Documento
  const bitacoraRespuestas = practica.formularioRespuestas
    // Filtramos solo las respuestas que sean de tipo 'bitacora'
    .filter(respuesta => respuesta.plantilla?.tipo === 'bitacora')
    .map(respuesta => ({
      id: respuesta.id, 
      tipo: "bitacora", 
      fecha_creacion: respuesta.fecha_envio, 
      estado: 'enviado', 
      // PROPIEDAD CLAVE QUE EL FRONTEND DEBE USAR PARA CONTAR
      es_respuesta_formulario: true 
  }));

    // c) Unificar la lista
    practica.documentos = [...documentosArchivos, ...bitacoraRespuestas]; 
  return practica; 
}