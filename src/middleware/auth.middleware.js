import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/configEnv.js";
import { handleErrorClient } from "../Handlers/responseHandlers.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return handleErrorClient(res, 401, "Acceso denegado. No se proporcionó token.");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return handleErrorClient(res, 401, "Acceso denegado. Token malformado.");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return handleErrorClient(res, 401, "Token inválido o expirado.");
  }
}

//para revisar la autenticacion, que el token jwt sea valido
export const checkAuth = (req, res, next) => {
  try{
  //busca el token en el header
  const token = req.headers.authorization?.split(" ").pop();

  if (!token) {
    return handleErrorClient(res, 401, "Acceso denegado. No se proporcionó token.");
  }

  //verifica el token
  const payload = jwt.verify(token, JWT_SECRET);
  req.user = payload;//guarda la info 
  next();
} catch (error) {
  return handleErrorClient(res, 401, "Token inválido o expirado.");
}
};

//para revisar si el usuario es coordinador
export const isCoordinador = (rolesPermitidos) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!rolesPermitidos.includes(userRole)) {
      return handleErrorClient(res, 403, "Acceso denegado. No tienes permisos para realizar esta acción.");
    }
    next();//si es coordinador
  };
};