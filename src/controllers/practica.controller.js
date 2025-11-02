import {
  findPracticas,
  findPracticaById,
  createPractica,
  updatePractica,
  deletePractica,
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
}
