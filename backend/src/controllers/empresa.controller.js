import { AppDataSource } from "../config/configDb.js";
import { EmpresaToken } from "../entities/empresaToken.entity.js";
import { Practica } from "../entities/practica.entity.js";
import jwt from "jsonwebtoken";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../Handlers/responseHandlers.js";
import { validarTokenEmpresa, confirmarInicioPracticaService } from "../services/empresa.service.js";

// --- Generar Token ---
export const generarTokenEmpresa = async (req, res) => {
  try {
    const { empresaNombre, empresaCorreo, alumnoId } = req.body;

    // Generar token único con JWT
    const token = jwt.sign(
      { alumnoId, tipo: "empresa" },
      process.env.JWT_SECRET,
      { expiresIn: "180d" } // dura 6 meses aprox
    );

    const repo = AppDataSource.getRepository(EmpresaToken);
    const nuevoToken = repo.create({
      token,
      empresaNombre,
      empresaCorreo,
      alumnoId,
      expiracion: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
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

//Validar Token (empresa)
export const validarToken = async (req, res) => {
  try {
    const { token } = req.params;

    // tokenData viene del servicio -> NO tiene practica, NO tiene student
    const tokenData = await validarTokenEmpresa(token);

    return handleSuccess(res, 200, "Token de empresa validado.", {
      practicaId: tokenData.practicaId,
      alumnoNombre: tokenData.alumnoNombre,
      empresaNombre: tokenData.empresaNombre,
      estado: tokenData.estado,
      formularioRespuestas: tokenData.formularioRespuestas
    });

  } catch (error) {
    console.error("Error al validar token:", error.message);
    return handleErrorClient(res, 400, error.message);
  }
};

//confirmar inicio de práctica
export const confirmarInicioPractica = async (req, res) => {
  try {
    // El frontend envía: { token: '...', confirmacion: true, respuestas: { ... } }
    const { token, confirmacion, respuestas } = req.body; 

    console.log("DATOS RECIBIDOS DESDE FRONTEND (EMPRESA):", respuestas);

    if (!token) {
        return handleErrorClient(res, 400, "Falta el token de acceso.");
    }

    // Llamamos al servicio que maneja la confirmación
    const resultado = await confirmarInicioPracticaService(token, confirmacion, respuestas);

    return handleSuccess(res, 200, "Confirmación exitosa.", resultado);

  } catch (error) {
    console.error("Error al confirmar inicio:", error);
    return handleErrorServer(res, 500, "Error al procesar la solicitud", error.message);
  }
};
