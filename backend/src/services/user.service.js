import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(User);

export async function createUser(data) {
  // VALIDAR CAMPOS REQUERIDOS EN EL SERVICIO
  if (!data.name || !data.email || !data.password || !data.role) {//añadi role
    throw new Error("Nombre, email, rol y contraseña son requeridos");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  // INCLUIR TODOS LOS CAMPOS NECESARIOS
  const newUser = userRepository.create({
    name: data.name,        // ¡ESTE ERA EL PROBLEMA!
    email: data.email,
    password: hashedPassword,
    role: data.role || 'alumno',
    tipo_practica: data.tipo_practica || null,//como en el req puse tipo de practica
  });

  try {
    return await userRepository.save(newUser); 
  } catch (error) {
    if (error.code === '23505') { 
      throw new Error("El correo ya está registrado."); 
    }
    throw error; 
  }

}

export async function findUserByEmail(email) {
  return await userRepository.findOneBy({ email });
}

export async function findUsers() {
  return await userRepository.find();
}

export async function findUserById(id) {
  const user = await userRepository.findOne({ where: { id } });
  if (!user) throw new Error("Usuario no encontrado");
  return user;
}

export async function updateUser(id, changes) {
  const user = await findUserById(id);
  userRepository.merge(user, changes);
  return await userRepository.save(user);
}

export async function deleteUser(id) {
  const user = await findUserById(id);
  return await userRepository.remove(user);
}

//para buscar los usarios alumnos (¡ESTA ES LA FUNCIÓN ARREGLADA!)
export async function findAlumnos() {
  // Le decimos a TypeORM que cargue la relación
  return await userRepository.find({ 
    where: { role: 'alumno' }, 
    relations: ['practicasComoAlumno'] // <-- ¡ESTE ES EL ARREGLO!
  });
}

// para obtener los detalles completos de un alumno por su ID
export const getDetallesAlumnos = async (userId, rol) => {

    if (rol !== 'coordinador') {
        throw new Error("Acceso denegado: Solo coordinadores pueden acceder a esta información.");
    }

    try {
        const userRepository = AppDataSource.getRepository(User);

        const detallesCompletos = await userRepository.findOne({
            where: { id: userId },
            relations: [
                "practicasComoAlumno",
                "practicasComoAlumno.documentos",
            ],
        });

        //si no existe o si el usuario no es 'alumno'
        if (!detallesCompletos || detallesCompletos.role !== 'alumno') {
            throw new Error("Usuario no encontrado o no es un alumno.");
        } return detallesCompletos;
    } catch (error) {
        throw new Error("Error al obtener los detalles del alumno: " + error.message);
    }
}
