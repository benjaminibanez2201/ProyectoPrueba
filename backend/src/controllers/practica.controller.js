import {
  findPracticas,
  findPracticaById,
  createPractica,
  updatePractica,
  deletePractica,
  findPracticaByStudentId,
  createPostulacion,
} from "../services/practica.service.js";

import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export class PracticaController {
  async getAll(req, res) {
    try {
      const practicas = await findPracticas();
      handleSuccess(res, 200, "Prácticas obtenidas correctamente", practicas);
    } catch (error) {
      handleErrorServer(res, 500, "Error al obtener prácticas", error.message);
    }
  }

async getMyPractica(req, res) {
    try {
      const studentId = req.user.id || req.user.sub; 
      if (!studentId) {
        return handleErrorClient(res, 400, "No se pudo identificar al usuario");
      }
      const practica = await findPracticaByStudentId(studentId);
      
      if (!practica) {
        return handleSuccess(res, 200, "El alumno aún no tiene una práctica inscrita", null);
      }
      
      handleSuccess(res, 200, "Práctica del alumno obtenida", practica);

    } catch (error) {
      handleErrorServer(res, 500, "Error al obtener la práctica del alumno", error.message);
    }
  }
  async postularPractica(req, res) {
    try {
      const studentId = req.user.id; // ID del alumno logueado
      const data = req.body; // Datos del formulario (nombreEmpresa, etc.)

      // Validamos datos (simple)
      if (!data.nombreEmpresa || !data.emailEmpresa || !data.nombreRepresentante) {
        return handleErrorClient(res, 400, "Faltan datos de la empresa (nombre, email y representante)");
      }
      
      const nuevaPractica = await createPostulacion(data, studentId);
      
      handleSuccess(res, 201, "Postulación enviada. El token se ha generado.", nuevaPractica);

    } catch (error) {
      // Manejamos el error de "práctica duplicada"
      if (error.message.includes("Ya tienes una postulación")) {
        return handleErrorClient(res, 409, error.message); // 409 Conflict
      }
      handleErrorServer(res, 500, "Error al crear la postulación", error.message);
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const practica = await findPracticaById(id);
      handleSuccess(res, 200, "Práctica encontrada", practica);
    } catch (error) {
      handleErrorClient(res, 404, error.message);
    }
  }

  async create(req, res) {
    try {
      const data = req.body;
      if (!data.student || !data.empresa) {
        return handleErrorClient(res, 400, "Faltan campos requeridos");
      }
      const nueva = await createPractica(data);
      handleSuccess(res, 201, "Práctica creada correctamente", nueva);
    } catch (error) {
      handleErrorServer(res, 500, "Error al crear práctica", error.message);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const changes = req.body;
      const updated = await updatePractica(id, changes);
      handleSuccess(res, 200, "Práctica actualizada", updated);
    } catch (error) {
      handleErrorClient(res, 404, error.message);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await deletePractica(id);
      handleSuccess(res, 200, "Práctica eliminada correctamente", { id });
    } catch (error) {
      handleErrorClient(res, 404, error.message);
    }
  }

  async actualizarEstado(req, res) { // permite actualizar el estado con ciertos valores
    try {
      const { id } = req.params;
      const { nuevoEstado } = req.body;

      const estadosPermitidos = ["pendiente", "en_curso", "finalizada", "evaluada"];
      if (!estadosPermitidos.includes(nuevoEstado)) {
        return handleErrorClient(res, 400, "Estado no válido");
      }

      const practica = await findPracticaById(id);
      if (!practica) {
        return handleErrorClient(res, 404, "Práctica no encontrada");
      }

      practica.estado = nuevoEstado;
      const updated = await updatePractica(id, practica);

      handleSuccess(res, 200, "Estado de práctica actualizado correctamente", updated);
    } catch (error) {
      handleErrorServer(res, 500, "Error al actualizar estado de práctica", error.message);
    }
  }

  async cerrarPractica(req, res) { // valida el rol, el estado previo y guarda la fecha del cierre para trazabilidad.
    try {
      const { id } = req.params;
      const userRole = req.user?.role; // Se obtiene desde el middleware de autenticación

      if (userRole !== "coordinador") {
        return handleErrorClient(res, 403, "Solo el coordinador puede cerrar prácticas");
      }

      const practica = await findPracticaById(id);
      if (!practica) {
        return handleErrorClient(res, 404, "Práctica no encontrada");
      }

      if (practica.estado !== "evaluada") {
        return handleErrorClient(res, 400, "Solo se pueden cerrar prácticas que ya estén evaluadas");
      }

      practica.estado = "cerrada";
      practica.fecha_fin = new Date();

      const updated = await updatePractica(id, practica);

      handleSuccess(res, 200, "Práctica cerrada correctamente", {
        id: practica.id,
        fecha_cierre: practica.fecha_fin,
        estado: practica.estado,
      });
    } catch (error) {
      handleErrorServer(res, 500, "Error al cerrar práctica", error.message);
    }
  }

}
