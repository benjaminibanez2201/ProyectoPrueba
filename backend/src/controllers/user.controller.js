import { getDetallesAlumnos, findAlumnos } from "../services/user.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";

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

// Obtener todas las prácticas confirmadas por empresa que esperan aprobación
export const obtenerPracticasConfirmadasPorEmpresa = async (req, res) => {
  try {
    const practicaRepo = AppDataSource.getRepository(Practica);

    const practicas = await practicaRepo.find({
      where: { estado: 'confirmada_por_empresa' },
      relations: ['student'], 
      order: { fecha_inicio: 'DESC' }
    });

    const practicasFormateadas = practicas.map(p => {
      return {
        id: p.id,
        alumnoNombre: p.student.name,
        alumnoEmail: p.student.email,
        empresaNombre: 'Pendiente de token',
        empresaCorreo: 'Pendiente de token',
        tipoPractica: p.tipoPractica,
        fechaInicio: p.fecha_inicio,
        estado: p.estado
      };
    });

    return handleSuccess(res, 200, "Prácticas confirmadas obtenidas exitosamente", practicasFormateadas);
  } catch (error) {
    console.error("Error al obtener prácticas confirmadas:", error);
    return handleErrorServer(res, 500, "Error al obtener prácticas confirmadas", error.message);
  }
};

//Aprobar una práctica confirmada por empresa (cambiar a en_curso)
export const aprobarPractica = async (req, res) => {
  try {
    const { id } = req.params;
    const practicaRepo = AppDataSource.getRepository(Practica);

    const practica = await practicaRepo.findOne({
      where: { id: parseInt(id) },
      relations: ['student']
    });

    if (!practica) {
      return handleErrorClient(res, 404, "Práctica no encontrada");
    }

    if (practica.estado !== 'confirmada_por_empresa') {
      return handleErrorClient(res, 400, `La práctica no está en estado válido para aprobación. Estado actual: ${practica.estado}`);
    }

    // Cambiar estado a en_curso
    practica.estado = 'en_curso';
    practica.fechaInicio = new Date();
    await practicaRepo.save(practica);

    console.log(`Práctica ${id} aprobada por coordinador - Estado: en_curso`);

    return handleSuccess(res, 200, "Práctica aprobada e iniciada exitosamente", {
      practicaId: practica.id,
      estado: practica.estado,
      fechaInicio: practica.fechaInicio,
      alumnoNombre: practica.student.name
    });
  } catch (error) {
    console.error("Error al aprobar práctica:", error);
    return handleErrorClient(res, 500, "Error al aprobar práctica");
  }
};

//Rechazar una práctica confirmada por empresa (devolver a pendiente)
export const rechazarPractica = async (req, res) => {
  try {
    const { id } = req.params;
    
    const practicaRepo = AppDataSource.getRepository(Practica);

    const practica = await practicaRepo.findOne({
      where: { id: parseInt(id) },
      relations: ['student']
    });

    if (!practica) {
      return handleErrorClient(res, 404, "Práctica no encontrada");
    }

    if (practica.estado !== 'confirmada_por_empresa') {
      return handleErrorClient(res, 400, "La práctica no está en estado válido para rechazo");
    }

    // Devolver a estado pendiente
    practica.estado = 'pendiente';
    practica.fechaConfirmacionEmpresa = null; // Limpiar la fecha de confirmación
    await practicaRepo.save(practica);

    console.log(`⚠️ Práctica ${id} rechazada por coordinador - Estado: pendiente`);

    return handleSuccess(res, 200, "Práctica rechazada. La empresa deberá confirmar nuevamente.", {
      practicaId: practica.id,
      estado: practica.estado
    });
  } catch (error) {
    console.error("Error al rechazar práctica:", error);
    return handleErrorClient(res, 500, "Error al rechazar práctica");
  }
};