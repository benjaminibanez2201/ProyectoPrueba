/**
 * CONTROLADOR DE COMUNICACIÓN
 * Maneja la lógica de mensajería entre empresas y coordinadores
 */
import {
  enviarMensajeService,
  obtenerConversacionService,
  obtenerBandejaEntradaService,
  obtenerMensajesEnviadosService,
  marcarComoLeidoService,
  contarNoLeidosService,
} from "../services/comunicacion.service.js";
import { validarTokenEmpresa } from "../services/empresa.service.js";
import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";
import { Mensaje } from "../entities/mensaje.entity.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../Handlers/responseHandlers.js";
import { User } from "../entities/user.entity.js";

/**
 * 1. Envía un mensaje nuevo.
 * Puede ser enviado por una empresa (usando token) o un coordinador (sesión activa)
 */
export const enviarMensaje = async (req, res) => {
  try {
    const { asunto, contenido, practicaId, token, destinatarioId } = req.body;
    const practicaRepo = AppDataSource.getRepository(Practica);
    const userRepo = AppDataSource.getRepository(User);

    // Variables para el remitente y destinatario
    let remitenteTipo, remitenteNombre, remitenteEmail, coordinadorId;
    let destinatarioTipo, destinatarioNombre, destinatarioEmail;
    let practicaIdFinal;

    // Localizamos al coordinador general para asignar destinatario o remitente según el caso
    const coordinador = await userRepo.findOne({
      where: { role: "coordinador" },
    });

    // Caso 1: El remitente es una empresa
    if (token) {
      const tokenData = await validarTokenEmpresa(token);

      // Intentamos obtener el ID de la práctica desde el token o el body
      practicaIdFinal =
        tokenData.practica?.id || tokenData.practicaId || practicaId;

      if (!practicaIdFinal) {
        return handleErrorClient(
          res,
          400,
          "No se pudo determinar el ID de la práctica. Verifique que el token sea válido para esta práctica."
        );
      }
      // Buscamos la práctica para extraer datos reales de la empresa
      const practica = await practicaRepo.findOne({
        where: { id: practicaIdFinal },
        relations: ["empresa", "empresaToken"],
      });

      if (!practica)
        return handleErrorClient(res, 404, "Práctica no encontrada");

      // Configuración del remitente (empresa)
      remitenteTipo = "empresa";
      remitenteNombre =
        practica.empresaToken?.empresaNombre ||
        practica.empresa?.name ||
        "Representante Empresa";
      remitenteEmail =
        practica.empresaToken?.empresaCorreo ||
        practica.empresa?.email ||
        "empresa@correo.com";

      // Configuración del destinatario (coordinador)
      destinatarioTipo = "coordinador";
      destinatarioNombre = coordinador?.name || "Coordinador de Prácticas";
      destinatarioEmail = coordinador?.email || "coordinador@u.cl";
      coordinadorId = coordinador?.id;
    }
    // Caso 2: El remitente es el coordinador
    else {
      practicaIdFinal = practicaId;

      if (!practicaIdFinal) {
        return handleErrorClient(
          res,
          400,
          "No se pudo determinar el ID de la práctica."
        );
      }

      const practica = await practicaRepo.findOne({
        where: { id: Number(practicaIdFinal) },
        relations: ["empresa", "empresaToken"],
      });

      if (!practica)
        return handleErrorClient(res, 404, "Práctica no encontrada");

      // Configuración del remitente (coordinador sacado de req.user)
      remitenteTipo = "coordinador";
      remitenteNombre = req.user?.name || "Coordinador";
      remitenteEmail = req.user?.email || "coordinador@u.cl";
      coordinadorId = req.user?.id || null;

      // Configuración del destinatario (empresa)
      destinatarioTipo = "empresa";
      destinatarioNombre =
        practica.empresaToken?.empresaNombre ||
        practica.empresa?.name ||
        "Empresa";

      // Prioridad para el correo de la empresa: Input manual > Token de empresa > Registro entidad Empresa
      destinatarioEmail =
        destinatarioId ||
        practica.empresaToken?.empresaCorreo ||
        practica.empresa?.email;

      if (!destinatarioEmail) {
        return handleErrorClient(
          res,
          400,
          "No se pudo obtener el email de la empresa. Verifique que la práctica tenga una empresa asociada."
        );
      }
    }

    // Antes de llamar al servicio, nos aseguramos de que practicaIdFinal tenga valor
    if (!practicaIdFinal) {
      return handleErrorClient(
        res,
        400,
        "No se pudo determinar el ID de la práctica."
      );
    }

    // Ejecución del servicio de persistencia de mensajes
    const mensaje = await enviarMensajeService({
      practicaId: practicaIdFinal,
      asunto,
      contenido,
      remitenteTipo,
      remitenteNombre,
      remitenteEmail,
      destinatarioTipo,
      destinatarioNombre,
      destinatarioEmail,
      coordinadorId,
    });

    return handleSuccess(res, 201, "Mensaje enviado exitosamente", mensaje);
  } catch (error) {
    console.error("Error:", error);
    return handleErrorServer(res, 500, error.message);
  }
};

/**
 * Recupera el historial de mensajes (hilo) entre empresa y coordinador para una práctica específica
 */
export const getConversacion = async (req, res) => {
  try {
    const { practicaId } = req.params;
    const token = req.query.token;
    let emailUsuario;

    // Si hay token, validamos que la empresa tiene acceso a esta conversación
    if (token) {
      const tokenData = await validarTokenEmpresa(token);
      const practicaRepo = AppDataSource.getRepository(Practica);
      const practica = await practicaRepo.findOne({
        where: { id: parseInt(practicaId) },
        relations: ["empresaToken", "empresa", "student"],
      });

      if (!practica) {
        return handleErrorClient(res, 404, "Práctica no encontrada");
      }

      emailUsuario =
        practica.empresa?.email ||
        practica.empresaToken?.empresaCorreo ||
        tokenData.empresaCorreo;

      if (!emailUsuario) {
        return handleErrorClient(
          res,
          400,
          "No se pudo identificar el email de la empresa."
        );
      }
    } else if (req.user) {
      // Si es coordinador, usamos su email de sesión
      emailUsuario = req.user.email;
    } else {
      return handleErrorClient(res, 401, "No autorizado");
    }

    const conversacion = await obtenerConversacionService(
      practicaId,
      emailUsuario
    );

    return handleSuccess(res, 200, "Conversación obtenida", conversacion);
  } catch (error) {
    console.error("Error al obtener conversación:", error);
    return handleErrorServer(res, 500, error.message);
  }
};

/**
 * Obtiene todos los mensajes recibidos por el coordinador logueado
 */
export const getBandejaEntrada = async (req, res) => {
  try {
    const coordinadorId = req.user.id;
    const bandeja = await obtenerBandejaEntradaService(coordinadorId);
    return handleSuccess(res, 200, "Bandeja de entrada obtenida", bandeja);
  } catch (error) {
    console.error("Error al obtener bandeja:", error);
    return handleErrorServer(res, 500, error.message);
  }
};

/**
 * Obtiene los mensajes que el coordinador ha enviado
 */
export const getMensajesEnviados = async (req, res) => {
  try {
    const coordinadorId = req.user.id;
    const mensajes = await obtenerMensajesEnviadosService(coordinadorId);
    return handleSuccess(res, 200, "Mensajes enviados obtenidos", mensajes);
  } catch (error) {
    console.error("Error al obtener enviados:", error);
    return handleErrorServer(res, 500, error.message);
  }
};

/**
 * Cambia el estado de un mensaje de 'no leído' a 'leído'
 */
export const marcarLeido = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.query.token;
    let emailUsuario;

    // Determinamos quién intenta marcar como leído para validar autoría
    if (token) {
      // Validar token
      const tokenData = await validarTokenEmpresa(token);
      const practicaRepo = AppDataSource.getRepository(Practica);
      const practica = await practicaRepo.findOne({
        where: { id: tokenData.practicaId },
        relations: ["empresaToken", "empresa"],
      });
      emailUsuario =
        practica?.empresa?.email ||
        practica?.empresaToken?.empresaCorreo ||
        tokenData.empresaCorreo;
    } else if (req.user) {
      emailUsuario = req.user.email;
    } else {
      return handleErrorClient(res, 401, "No autorizado");
    }

    const mensaje = await marcarComoLeidoService(id, emailUsuario);
    return handleSuccess(res, 200, "Mensaje marcado como leído", mensaje);
  } catch (error) {
    console.error("Error al marcar leído:", error);
    return handleErrorServer(res, 500, error.message);
  }
};

/**
 * Retorna el contador de mensajes sin leer para el coordinador
 */
export const getNoLeidos = async (req, res) => {
  try {
    const coordinadorId = req.user.id;
    const count = await contarNoLeidosService(coordinadorId);
    return handleSuccess(res, 200, "No leídos obtenidos", { noLeidos: count });
  } catch (error) {
    console.error("Error al contar no leídos:", error);
    return handleErrorServer(res, 500, error.message);
  }
};

/**
 * Retorna el contador de mensajes sin leer específicos para una Empresa en una práctica
 */
export const getNoLeidosEmpresa = async (req, res) => {
  try {
    const { practicaId } = req.params;
    const token = req.query.token;

    if (!token) return handleErrorClient(res, 401, "Token requerido");

    // Validación de identidad de la empresa
    const tokenData = await validarTokenEmpresa(token);
    const practicaRepo = AppDataSource.getRepository(Practica);
    const practica = await practicaRepo.findOne({
      where: { id: parseInt(practicaId) },
      relations: ["empresaToken", "empresa"],
    });

    if (!practica) {
      return handleErrorClient(res, 404, "Práctica no encontrada");
    }

    const emailEmpresa =
      practica.empresa?.email ||
      practica.empresaToken?.empresaCorreo ||
      tokenData.empresaCorreo;

    if (!emailEmpresa) {
      return handleSuccess(res, 200, "No leídos obtenidos", { noLeidos: 0 });
    }

    // Consulta directa a la base de datos para contar mensajes no leídos del destinatario actual
    const mensajeRepo = AppDataSource.getRepository(Mensaje);
    const count = await mensajeRepo.count({
      where: {
        practica: { id: parseInt(practicaId) },
        destinatario_email: emailEmpresa,
        leido: false,
      },
    });

    return handleSuccess(res, 200, "No leídos obtenidos", { noLeidos: count });
  } catch (error) {
    console.error("Error al contar no leídos empresa:", error);
    return handleErrorServer(res, 500, error.message);
  }
};
