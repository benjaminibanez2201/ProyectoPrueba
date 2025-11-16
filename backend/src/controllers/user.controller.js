import { getDetallesAlumnos, findAlumnos } from "../services/user.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export class NotasController {
  async getAllNotas(req, res) {
    try {
      const notas = await findNotas();
      handleSuccess(res, 200, "Notas obtenidas exitosamente", notas);
    } catch (error) {
      handleErrorServer(res, 500, "Error al obtener las notas", error.message);
    }
  }

  async getNotaById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return handleErrorClient(res, 400, "ID de nota inválido");
      }
      
      const nota = await findNotaById(id);
      handleSuccess(res, 200, "Nota obtenida exitosamente", nota);
    } catch (error) {
      handleErrorClient(res, 404, error.message);
    }
  }

  async createNota(req, res) {
    try {
      const data = req.body;
      
      if (!data || Object.keys(data).length === 0) {
        return handleErrorClient(res, 400, "Datos de la nota son requeridos");
      }
      
      const nuevaNota = await createNota(data);
      handleSuccess(res, 201, "Nota creada exitosamente", nuevaNota);
    } catch (error) {
      handleErrorServer(res, 500, "Error al crear la nota", error.message);
    }
  }

  async updateNota(req, res) {
    try {
      const { id } = req.params;
      const changes = req.body;
      
      if (!id || isNaN(id)) {
        return handleErrorClient(res, 400, "ID de nota inválido");
      }
      
      if (!changes || Object.keys(changes).length === 0) {
        return handleErrorClient(res, 400, "Datos para actualizar son requeridos");
      }
      
      const notaActualizada = await updateNota(id, changes);
      handleSuccess(res, 200, "Nota actualizada exitosamente", notaActualizada);
    } catch (error) {
      handleErrorClient(res, 404, error.message);
    }
  }

  async deleteNota(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return handleErrorClient(res, 400, "ID de nota inválido");
      }
      
      await deleteNota(id);
      handleSuccess(res, 200, "Nota eliminada exitosamente", { id });
    } catch (error) {
      handleErrorClient(res, 404, error.message);
    }
  }
}

//para revisar el listado de alumnos(funcion del coordinador de practica)
export async function getAlumnos(req, res) {
  try {
    const alumnos = await findAlumnos();
    handleSuccess(res, 200, "Lista de alumnos obtenida exitosamente", alumnos);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener la lista de alumnos", error.message);
  }
}

//para ver los detalles completos de un alumno en particular
export const verDetallesAlumnos = async (req, res) => {
    try {
        const id = req.params.id;
        const rol = req.user?.role;

        const detalles = await getDetallesAlumnos(id, rol);

        return handleSuccess(res, 200, "Información completa de alumnos obtenida exitosamente", detalles);
    } catch (error) {

        //Acceso denegado por rol no autorizado
        if (error.message.includes("Acceso denegado")) {
            return handleErrorClient(res, 403, error.message);
        }

        if (error.message.includes("No encontrado") || error.message.includes("No es un alumno")) {
            return handleErrorClient(res, 404, error.message);
        }
        return handleErrorServer(res, 500, "Error interno al obtener los detalles.", error.message);
    }
}