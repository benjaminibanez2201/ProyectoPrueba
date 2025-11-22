import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "./user.service.js";

export async function loginUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Credenciales incorrectas");
  }

  // LSTA LÍNEA DEBE TENER AWAIT
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

  const payload = { 
    sub: user.id, 
    email: user.email,
    role: user.role 
  };
  
  // GENERAR TOKEN
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  // ELIMINAR PASSWORD ANTES DE RETORNAR
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;

  return { user: userWithoutPassword, token };
}

export async function registerUser(userData) {

  const newUser = await createUser(userData);
  
  //se devuelve el usuario sin la contraseña
  const {password,... userWithoutPassword} = newUser;
  return userWithoutPassword;
}