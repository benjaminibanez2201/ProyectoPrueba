import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";

const practicaRepository = AppDataSource.getRepository(Practica);

// Obtener todas las prácticas
export async function findPracticas() {
  // ¡¡¡AQUÍ ESTÁ EL ARREGLO!!!
  // Le ordenamos a TypeORM que cargue la relación 'student'.
  // Esto soluciona el bug de 'eager: true' que no funciona.
  return await practicaRepository.find({
    relations: ['student']
  });
}

// Obtener práctica por ID
export async function findPracticaById(id) {
  // ¡BONUS! También lo agregamos aquí.
  const practica = await practicaRepository.findOne({ 
    where: { id },
    relations: ['student'] // <-- SOLO STUDENT
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

// Eliminar una práctica (No cambia)
export async function deletePractica(id) {
  const practica = await findPracticaById(id);
  return await practicaRepository.remove(practica);
}