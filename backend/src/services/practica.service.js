import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";

const practicaRepository = AppDataSource.getRepository(Practica);

// Obtener todas las prácticas
export async function findPracticas() {
  return await practicaRepository.find();
}

// Obtener práctica por ID
export async function findPracticaById(id) {
  const practica = await practicaRepository.findOne({ where: { id } });
  if (!practica) throw new Error("Práctica no encontrada");
  return practica;
}

// Crear nueva práctica
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

// Eliminar una práctica
export async function deletePractica(id) {
  const practica = await findPracticaById(id);
  return await practicaRepository.remove(practica);
}
