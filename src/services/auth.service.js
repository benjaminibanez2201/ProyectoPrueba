import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "./user.service.js";

export async function loginUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Credenciales incorrectas");
  }

  // ✅ ESTA LÍNEA DEBE TENER AWAIT
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

  const payload = { 
    sub: user.id, 
    email: user.email,
    role: user.role 
  };
  
  // ✅ GENERAR TOKEN
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  // ✅ ELIMINAR PASSWORD ANTES DE RETORNAR
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;

  return { user: userWithoutPassword, token };
}