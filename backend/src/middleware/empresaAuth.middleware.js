import { AppDataSource } from "../config/configDb.js";
import { EmpresaToken } from "../entities/empresaToken.entity.js";
import { handleErrorClient } from "../Handlers/responseHandlers.js";

export const validarTokenEmpresa = async (req, res, next) => {
  try {
    // El token viene desde la URL o el header
    const token = req.headers.authorization?.split(" ")[1] || req.query.token;

    if (!token) {
      return handleErrorClient(res, 401, "Token de empresa no proporcionado.");
    }

    const repo = AppDataSource.getRepository(EmpresaToken);
    const registro = await repo.findOne({
      where: { token },
    });

    if (!registro) {
      return handleErrorClient(res, 404, "Token de empresa no encontrado.");
    }

    const ahora = new Date();
    if (ahora > new Date(registro.expires_at)) {
      return handleErrorClient(res, 403, "El token de empresa ha expirado.");
    }

    // Guardamos el id del alumno vinculado al token
    req.alumnoId = registro.alumnoId;
    req.tokenEmpresa = registro;
    next();
  } catch (error) {
    console.error("Error validando token de empresa:", error);
    return handleErrorClient(
      res,
      500,
      "Error interno al validar token de empresa."
    );
  }
};
