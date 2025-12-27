/**
 * CONTROLADOR DE INTERACCIÓN CON EMPRESAS EXTERNAS
 * Maneja el acceso seguro mediante tokens JWT para representantes de empresas
 */
import { AppDataSource } from "../config/configDb.js";
import { EmpresaToken } from "../entities/empresaToken.entity.js";
import { Practica } from "../entities/practica.entity.js";
import jwt from "jsonwebtoken";
import {
  handleSuccess,
  handleErrorServer,
  handleErrorClient,
} from "../Handlers/responseHandlers.js";
import {
  validarTokenEmpresa,
  confirmarInicioPracticaService,
  guardarEvaluacionEmpresa,
} from "../services/empresa.service.js";

/**
 * 1. GENERAR TOKEN EMPRESA
 * Crea un acceso único y duradero para que la empresa gestione la práctica del alumno
 */
export const generarTokenEmpresa = async (req, res) => {
  try {
    const { empresaNombre, empresaCorreo, alumnoId } = req.body;

    /// Se firma un JWT que identifica al alumno y el rol 'empresa'
    const token = jwt.sign(
      { alumnoId, tipo: "empresa" },
      process.env.JWT_SECRET,
      { expiresIn: "180d" } // El acceso es válido por 6 meses
    );

    const repo = AppDataSource.getRepository(EmpresaToken);

    // Guardamos el token en la base de datos para auditoría y control de expiración
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

/**
 * 2. VER FORMULARIO
 * Permite a la empresa visualizar el formulario asignado al alumno
 */
export const verFormulario = async (req, res) => {
  try {
    // más adelante traeremos el formulario del alumno
    return res.json({
      message: "Aquí se mostrará el formulario asignado al alumno.",
    });
  } catch (error) {
    console.error("Error al obtener formulario:", error);
    return handleErrorClient(res, 500, "Error interno al obtener formulario.");
  }
};

/**
 * 3. ENVIAR EVALUACIÓN
 * Permite a la empresa guardar los resultados de la evaluación del desempeño del alumno
 */
export const enviarEvaluacion = async (req, res) => {
  try {
    const { token, respuestas } = req.body;
    if (!token) return handleErrorClient(res, 400, "Falta token.");

    // El servicio se encarga de buscar la práctica asociada al token y guardar las respuestas
    const resultado = await guardarEvaluacionEmpresa(token, respuestas);
    return handleSuccess(res, 200, "Evaluación registrada.", resultado);
  } catch (error) {
    console.error("Error al enviar evaluación:", error);
    return handleErrorClient(
      res,
      400,
      error.message || "Error interno al enviar evaluación."
    );
  }
};

/**
 * 3. VALIDAR TOKEN
 * Endpoint que usa el frontend de la empresa al cargar la página para verificar si el link es válido
 */
export const validarToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Verifica que el token no haya expirado y que exista en la bdd
    const tokenData = await validarTokenEmpresa(token);

    // Retorna información esencial para que la empresa sepa qué alumno está evaluando
    return handleSuccess(res, 200, "Token de empresa validado.", {
      practicaId: tokenData.practicaId,
      alumnoNombre: tokenData.alumnoNombre,
      empresaNombre: tokenData.empresaNombre,
      estado: tokenData.estado,
      formularioRespuestas: tokenData.formularioRespuestas,
    });
  } catch (error) {
    console.error("Error al validar token:", error.message);
    return handleErrorClient(res, 400, error.message);
  }
};

/**
 * 4. CONFIRMAR INICIO DE PRÁCTICA
 * Paso donde la empresa valida que el alumno efectivamente comenzó su práctica
 */
export const confirmarInicioPractica = async (req, res) => {
  try {
    // El frontend envía: { token: '...', confirmacion: true, respuestas: { ... } }
    const { token, confirmacion, respuestas } = req.body;

    if (!token) {
      return handleErrorClient(res, 400, "Falta el token de acceso.");
    }

    // Cambia el estado de la práctica y registra los datos iniciales (fechas, supervisor, etc.)
    const resultado = await confirmarInicioPracticaService(
      token,
      confirmacion,
      respuestas
    );

    return handleSuccess(res, 200, "Confirmación exitosa.", resultado);
  } catch (error) {
    console.error("Error al confirmar inicio:", error);
    return handleErrorServer(
      res,
      500,
      "Error al procesar la solicitud",
      error.message
    );
  }
};

/**
 * 5. OBTENER FORMULARIO POR TOKEN
 * Recupera el contenido de formularios específicos (Postulación o Evaluaciones) usando el token
 */
export const getFormularioByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { tipo } = req.query; // Ej: 'postulacion', 'evaluacion_pr1', 'evaluacion_pr2'

    if (!token) {
      return handleErrorClient(res, 400, "Token requerido.");
    }

    // Validación del token y su relación con la práctica
    const tokenRepo = AppDataSource.getRepository(EmpresaToken);
    const practicaRepo = AppDataSource.getRepository(Practica);

    const tokenData = await tokenRepo.findOne({
      where: { token },
      relations: ["practica"],
    });

    if (!tokenData || !tokenData.practica) {
      return handleErrorClient(
        res,
        404,
        "Token inválido o práctica no encontrada."
      );
    }

    if (tokenData.expiracion < new Date()) {
      return handleErrorClient(res, 401, "Token expirado.");
    }

    // Obtenemos la práctica completa con sus respuestas
    const practica = await practicaRepo.findOne({
      where: { id: tokenData.practica.id },
      relations: [
        "formularioRespuestas",
        "formularioRespuestas.plantilla",
        "student",
      ],
    });

    if (!practica) {
      return handleErrorClient(res, 404, "Práctica no encontrada.");
    }

    // LÓGICA DE FILTRADO:
    // Si no se pide un tipo específico, devolvemos un resumen de todos los formularios completados
    if (!tipo) {
      const formularios = (practica.formularioRespuestas || [])
        .filter(
          (r) =>
            ["postulacion", "evaluacion_pr1", "evaluacion_pr2"].includes(
              r.plantilla?.tipo
            ) && ["enviado", "aprobado"].includes(r.estado) // Formularios ya completados
        )
        .map((r) => ({
          id: r.id,
          tipo: r.plantilla?.tipo,
          titulo: r.plantilla?.titulo,
          estado: r.estado,
          fechaEnvio: r.fecha_envio,
        }));

      return handleSuccess(res, 200, "Formularios de la práctica", {
        formularios,
      });
    }

    // Si se pide un tipo (ej. 'postulacion'), buscamos ese formulario específico
    const respuesta = practica.formularioRespuestas?.find(
      (r) => r.plantilla?.tipo === tipo
    );

    if (!respuesta) {
      return handleErrorClient(
        res,
        404,
        `No se encontró formulario de tipo '${tipo}'.`
      );
    }

    return handleSuccess(res, 200, "Formulario obtenido", {
      id: respuesta.id,
      datos: respuesta.datos,
      estado: respuesta.estado,
      fechaEnvio: respuesta.fecha_envio,
      plantilla: respuesta.plantilla,
    });
  } catch (error) {
    console.error("Error al obtener formulario:", error);
    return handleErrorServer(res, 500, "Error interno", error.message);
  }
};
