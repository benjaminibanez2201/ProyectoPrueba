import { AppDataSource } from "../config/configDB.js";
import { EmpresaToken } from "../entities/empresaToken.entity.js";
import jwt from "jsonwebtoken";
import { handleErrorClient } from "../Handlers/responseHandlers.js"; // si no lo tienes, no pasa nada

// --- Generar Token ---
export const generarTokenEmpresa = async (req, res) => {
  try {
    const { empresaNombre, empresaCorreo, alumnoId } = req.body;

    // Generar token único con JWT
    const token = jwt.sign(
      { alumnoId, tipo: "empresa" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // dura 7 días
    );

    const repo = AppDataSource.getRepository(EmpresaToken);
    const nuevoToken = repo.create({
      token,
      empresaNombre,
      empresaCorreo,
      alumnoId,
      expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await repo.save(nuevoToken);

    return res.json({
      message: "Token generado exitosamente",
      token,
    });
  } catch (error) {
    console.error("Error generando token:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// --- Ver Formulario (empresa) ---
export const verFormulario = async (req, res) => {
  try {
    // más adelante traeremos el formulario del alumno
    return res.json({ message: "Aquí se mostrará el formulario asignado al alumno." });
  } catch (error) {
    console.error("Error al obtener formulario:", error);
    return handleErrorClient(res, 500, "Error interno al obtener formulario.");
  }
};

// --- Enviar Evaluación (empresa) ---
export const enviarEvaluacion = async (req, res) => {
  try {
    // más adelante procesaremos la evaluación enviada
    return res.json({ message: "Aquí se recibirá la evaluación enviada por la empresa." });
  } catch (error) {
    console.error("Error al enviar evaluación:", error);
    return handleErrorClient(res, 500, "Error interno al enviar evaluación.");
  }
};

