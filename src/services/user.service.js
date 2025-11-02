import { AppDataSource } from "../config/configDB.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(User);

export async function createUser(data) {
  // VALIDAR CAMPOS REQUERIDOS EN EL SERVICIO
  if (!data.name || !data.email || !data.password) {
    throw new Error("Nombre, email y contraseña son requeridos");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  // INCLUIR TODOS LOS CAMPOS NECESARIOS
  const newUser = userRepository.create({
    name: data.name,        // ¡ESTE ERA EL PROBLEMA!
    email: data.email,
    password: hashedPassword,
    role: data.role || 'alumno'
  });

  return await userRepository.save(newUser);
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