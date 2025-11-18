import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";
import { EmpresaToken } from "../entities/empresaToken.entity.js";
import { User } from "../entities/user.entity.js"; // 1. Importamos User
import crypto from 'crypto';
import { In } from "typeorm"; // ¡Importamos 'In' para el chequeo!

const practicaRepository = AppDataSource.getRepository(Practica);
const tokenRepository = AppDataSource.getRepository(EmpresaToken);
const userRepository = AppDataSource.getRepository(User); // 2. Repositorio de usuarios

// Obtener todas las prácticas
export async function findPracticas() {
  return await practicaRepository.find({
    relations: ['student', 'empresaToken']
  });
}

// Obtener práctica por ID
export async function findPracticaById(id) {
  const practica = await practicaRepository.findOne({ 
    where: { id },
    relations: ['student', 'empresaToken'] 
  });
  if (!practica) throw new Error("Práctica no encontrada");
  return practica;
}

// Crear nueva práctica (No cambia)
export async function createPractica(data) {
  const nueva = practicaRepository.create(data);
  return await practicaRepository.save(nueva);
}

// Actualizar una práctica (No cambia)
export async function updatePractica(id, changes) {
  const practica = await findPracticaById(id);
  practicaRepository.merge(practica, changes);
  return await practicaRepository.save(practica);
}

// --- FUNCIÓN "MOTOR" PARA EL RF13 (CORREGIDA) ---
export async function createPostulacion(data, studentId) {
  
  // 1. Verificamos si el alumno ya tiene una práctica ACTIVA
  const estadosActivos = ["pendiente_revision", "en_curso"];
  const existingPractica = await practicaRepository.findOne({
    where: {
      student: { id: studentId },
      estado: In(estadosActivos)
    }
  });
  if (existingPractica) {
    throw new Error(`Ya tienes una práctica en estado: ${existingPractica.estado}.`);
  }

  // 2. ¡ARREGLO CLAVE! Buscamos al usuario real en la BD
  // Esto evita que student_id quede null.
  const alumno = await userRepository.findOneBy({ id: studentId });
  if (!alumno) throw new Error("Usuario alumno no encontrado");

  // 3. Creamos la Práctica
  const practicaData = practicaRepository.create({
    estado: 'pendiente_revision', 
    student: alumno, // <-- ¡Le pasamos el objeto completo!
  });
  
  // 4. Guardamos la práctica
  const newPractica = await practicaRepository.save(practicaData);

  // 5. Generamos el token
  const token = crypto.randomBytes(20).toString('hex');

  // 6. Calculamos la fecha de expiración
  const fechaExpiracion = new Date();
  fechaExpiracion.setDate(fechaExpiracion.getDate() + 30);

  // 7. Creamos el Token de Empresa
  const tokenData = tokenRepository.create({
    token: token,
    empresaNombre: data.nombreEmpresa,
    empresaCorreo: data.emailEmpresa,
    expiracion: fechaExpiracion,
    
    practica: newPractica, // Vinculación
  });
  
  // 8. Guardamos el Token
  await tokenRepository.save(tokenData);

  // 9. Devolvemos la práctica completa
  const practicaCompleta = await findPracticaById(newPractica.id);
  return practicaCompleta;
}

// Eliminar una práctica 
export async function deletePractica(id) {
  const practica = await findPracticaById(id);
  return await practicaRepository.remove(practica);
}

// Buscar la practica del alumno por su id de usuario
export async function findPracticaByStudentId(studentId) {
  const practica = await practicaRepository.findOne({
    where: {
      student: { id: studentId } 
    },
    // Añadimos esto para asegurar que el token llegue al DashboardAlumno
    relations: ['empresaToken'] 
  });
  return practica; 
}