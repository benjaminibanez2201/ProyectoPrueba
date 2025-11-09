import jwt from "jsonwebtoken";
import { handleErrorClient } from "../Handlers/responseHandlers.js";

export const authMiddleware = (allowedRoles = null) => (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return handleErrorClient(res, 401, "Acceso denegado. No se proporcionó token.");

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return handleErrorClient(res, 401, "Token malformado.");
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // payload debe incluir { sub/id, email, role, ... }

    // Si se pasaron roles permitidos, verificar que el rol del token esté entre ellos
    if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
      if (!payload.role || !allowedRoles.includes(payload.role)) {
        return handleErrorClient(res, 403, "No tiene permiso para acceder a este recurso.");
      }
    }

    next();
  } catch (err) {
    return handleErrorClient(res, 401, "Token inválido o expirado.", err.message);
  }
};
