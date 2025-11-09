import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "./user.service.js";

export async function loginUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Credenciales incorrectas");
  }

<<<<<<< HEAD
  // ✅ ESTA LÍNEA DEBE TENER AWAIT
=======
  // LSTA LÍNEA DEBE TENER AWAIT
>>>>>>> origin/main
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

  const payload = { 
    sub: user.id, 
    email: user.email,
    role: user.role 
  };
  
<<<<<<< HEAD
  // ✅ GENERAR TOKEN
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  // ✅ ELIMINAR PASSWORD ANTES DE RETORNAR
=======
  // GENERAR TOKEN
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  // ELIMINAR PASSWORD ANTES DE RETORNAR
>>>>>>> origin/main
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;

  return { user: userWithoutPassword, token };
}