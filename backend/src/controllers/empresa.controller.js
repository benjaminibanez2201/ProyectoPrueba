import { AppDataSource } from "../config/configDb.js";
import { EmpresaToken } from "../entities/empresaToken.entity.js";
import jwt from "jsonwebtoken";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../Handlers/responseHandlers.js";
import { validarTokenEmpresa } from "../services/empresa.service.js";

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

// --- Validar Token (empresa) ---
export const validarToken = async (req, res) => {
  try {
    const { token } = req.params;
    const tokenData = await validarTokenEmpresa(token);

    const practica = tokenData.practica; 
    const alumno = practica.student; 

    return handleSuccess(res, 200, "Token de empresa validado.", {
      practicaId: practica.id, 
      alumnoNombre: alumno.name, 
      tipoPractica: practica.tipoPractica, 
      empresaNombre: tokenData.empresaNombre, 
    });
  } catch (error) {
    console.error("Error al validar token:", error.message);
    return handleErrorClient(res, 400, error.message);
  }
};

// confirmar inicio de práctica
export const confirmarInicioPractica = async (req, res) => {
  try {
    const { token, confirmacion } = req.body; // token enviado por la empresa y confirmación frontend

    //revalidar token para asegurar vigencia
    const tokenData = await validarTokenEmpresa(token);

    if (!confirmacion) {
      return handleSuccess(res, 200, "Acción cancelada por la empresa.");
    }

    const practicaRepo = AppDataSource.getRepository(Practica);
    const practica = tokenData.practica;

    if (practica.estado == 'pendiente') {
      practica.estado = 'en_curso'; // actualizar estado
      practica.fechaInicio = new Date(); // registrar fecha de inicio
      await practicaRepo.save(practica);

      return handleSuccess(res, 200, `Práctica ${practica.id} iniciada y en curso.`, practica);
    }

    return handleSuccess(res, 200, "La práctica ya ha sido iniciada anteriormente.");

  } catch (error) {
    console.error("Error al confirmar inicio de práctica:", error);
    return handleErrorClient(res, 400, error.message)
  }
};
