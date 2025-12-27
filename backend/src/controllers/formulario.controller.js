/**
 * CONTROLADOR DE FORMULARIOS Y PLANTILLAS
 * Gestiona tanto la estructura de los formularios (admin) como el envío de respuestas (alumnos)
 */
import { AppDataSource } from "../config/configDb.js";
import { FormularioPlantilla } from "../entities/FormularioPlantilla.entity.js";
import {
  handleSuccess,
  handleErrorServer,
  handleErrorClient,
} from "../Handlers/responseHandlers.js";
import { saveBitacoraResponse } from "../services/formulario.service.js";
import { getRespuestaById } from "../services/formulario.service.js";
import { corregirPostulacionRespuesta } from "../services/formulario.service.js";
import { deleteBitacoraRespuesta } from "../services/formulario.service.js";

const plantillaRepository = AppDataSource.getRepository(FormularioPlantilla);

export class FormularioController {
  /**
   * Obtiene la estructura de un formulario específico por su código único (tipo)
   */
  async getPlantillaByTipo(req, res) {
    try {
      const { tipo } = req.params;
      const plantilla = await plantillaRepository.findOne({
        where: { tipo: tipo },
      });

      if (!plantilla) {
        return handleErrorClient(
          res,
          404,
          "Plantilla de formulario no encontrada"
        );
      }
      handleSuccess(res, 200, "Plantilla obtenida", plantilla);
    } catch (error) {
      handleErrorServer(
        res,
        500,
        "Error al obtener la plantilla",
        error.message
      );
    }
  }

  /**
   * Lista todas las plantillas disponibles.
   * Incluye el esquema (JSON) para edición en el panel de administrador
   */
  async getAllPlantillas(req, res) {
    try {
      const plantillas = await plantillaRepository.find({
        select: [
          "id",
          "titulo",
          "tipo",
          "descripcion",
          "actualizadoEn",
          "esquema",
        ],
        order: { tipo: "ASC" },
      });
      handleSuccess(res, 200, "Lista de plantillas", plantillas);
    } catch (error) {
      handleErrorServer(res, 500, "Error al listar plantillas", error.message);
    }
  }

  /**
   * Permite al administrador modificar el título, descripción o las preguntas (esquema) de un formulario existente
   */
  async updatePlantilla(req, res) {
    try {
      const { id } = req.params;
      const { titulo, descripcion, esquema } = req.body;
      const plantilla = await plantillaRepository.findOne({
        where: { id: Number(id) },
      });

      if (!plantilla)
        return handleErrorClient(res, 404, "Plantilla no encontrada");

      if (titulo) plantilla.titulo = titulo;
      if (descripcion) plantilla.descripcion = descripcion;
      if (esquema) plantilla.esquema = esquema;

      await plantillaRepository.save(plantilla);

      handleSuccess(res, 200, "Plantilla actualizada correctamente", plantilla);
    } catch (error) {
      handleErrorServer(
        res,
        500,
        "Error al actualizar plantilla",
        error.message
      );
    }
  }

  /**
   * Crea una nueva estructura de formulario
   * Valida que el 'tipo' sea único para evitar conflictos de sistema
   */
  async createPlantilla(req, res) {
    try {
      const { titulo, descripcion, tipo, esquema } = req.body;

      const existe = await plantillaRepository.findOne({ where: { tipo } });
      if (existe) {
        return handleErrorClient(
          res,
          400,
          "Ya existe un formulario con ese código (tipo)."
        );
      }

      const nueva = plantillaRepository.create({
        titulo,
        descripcion,
        tipo,
        esquema: esquema || [],
      });

      await plantillaRepository.save(nueva);
      handleSuccess(res, 201, "Formulario creado exitosamente", nueva);
    } catch (error) {
      handleErrorServer(res, 500, "Error al crear formulario", error.message);
    }
  }

  /**
   * Elimina una plantilla del sistema
   * Impide borrar formularios críticos (postulación, bitácora) para evitar romper el flujo
   */
  async deletePlantilla(req, res) {
    try {
      const { id } = req.params;

      const plantilla = await plantillaRepository.findOneBy({ id: Number(id) });
      if (!plantilla) {
        return handleErrorClient(res, 404, "Formulario no encontrado");
      }

      // Estos tipos son requeridos por la lógica del Backend
      const protegidos = [
        "postulacion",
        "bitacora",
        "evaluacion_pr1",
        "evaluacion_pr2",
      ];
      if (protegidos.includes(plantilla.tipo)) {
        return handleErrorClient(
          res,
          403,
          "No puedes eliminar formularios base del sistema."
        );
      }

      await plantillaRepository.remove(plantilla);
      handleSuccess(res, 200, "Formulario eliminado correctamente", { id });
    } catch (error) {
      handleErrorServer(
        res,
        500,
        "Error al eliminar formulario",
        error.message
      );
    }
  }
}

/**
 * ENVÍO DE BITÁCORA
 * El alumno envía su reporte periódico. Se vincula automáticamente a su ID de usuario
 */
export async function submitBitacora(req, res) {
  try {
    const userId = req.user.id;
    const { practicaId, respuestas } = req.body;

    const result = await saveBitacoraResponse(practicaId, userId, respuestas);
    handleSuccess(res, 201, "Bitácora guardada exitosamente.", result);
  } catch (error) {
    console.error("Error al guardar bitácora:", error);
    handleErrorServer(
      res,
      500,
      error.message || "Error interno al procesar la bitácora."
    );
  }
}

/**
 * OBTENER UNA RESPUESTA ESPECÍFICA
 * Un alumno no puede ver las respuestas de otro
 */
export const getRespuesta = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const respuesta = await getRespuestaById(Number(id));

    if (!respuesta) {
      return res.status(404).json({ message: "Respuesta no encontrada" });
    }

    // El Coordinador tiene permiso de lectura global
    if (user.role === "coordinador") {
      return res.status(200).json(respuesta);
    }

    // Validación de seguridad para Alumnos (solo ve sus propias respuestas)
    const esDueño = String(respuesta.practica.student.id) === String(user.id);
    if (!esDueño) return res.status(403).json({ message: "Acceso denegado." });

    return res.status(200).json(respuesta);
  } catch (error) {
    console.error("Error en getRespuesta:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

/**
 * OBTENER TODAS LAS PLANTILLAS
 * Lista todas las plantillas de formularios disponibles en el sistema
 */
export const getTodasLasPlantillas = async (req, res) => {
  try {
    const plantillaRepo = AppDataSource.getRepository(FormularioPlantilla);
    const plantillas = await plantillaRepo.find({
      order: {
        id: "ASC",
      },
    });

    handleSuccess(res, 200, "Lista de plantillas obtenida", plantillas);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener plantillas", error.message);
  }
};

/**
 * RE-ENVÍO DE POSTULACIÓN
 * Permite al alumno corregir su postulación inicial después de un rechazo del coordinador
 */
export const corregirPostulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { respuestas } = req.body;
    const alumnoId = req.user.id;
    const result = await corregirPostulacionRespuesta(id, alumnoId, respuestas);

    return handleSuccess(
      res,
      200,
      "Postulación corregida exitosamente",
      result
    );
  } catch (error) {
    console.error("Error en corregirPostulacion:", error);
    return handleErrorServer(res, 500, error.message || "Error al corregir");
  }
};

/**
 * ELIMINAR BITÁCORA
 * Permite al alumno borrar un reporte de bitácora específico
 */
export const deleteBitacora = async (req, res) => {
  try {
    const { id } = req.params;
    const alumnoId = req.user.id;
    const result = await deleteBitacoraRespuesta(id, alumnoId);

    return handleSuccess(res, 200, "Bitácora eliminada exitosamente", result);
  } catch (error) {
    console.error("Error al eliminar bitácora:", error);
    return handleErrorServer(
      res,
      500,
      error.message || "Error al eliminar bitácora"
    );
  }
};
