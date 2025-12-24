import { getDetallesAlumnos, findAlumnos } from "../services/user.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";
import path from 'path';

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

//✅ CONTROLADOR ACTUALIZADO para manejar lista completa Y alumno individual
export const verDetallesAlumnos = async (req, res) => {
    try {
        const id = req.params.id; // Puede ser undefined
        const rol = req.user?.role;

        const detalles = await getDetallesAlumnos(id || null, rol);

        // --- CASO 1: Lista completa de alumnos (sin ID) ---
        if (!id) {
            // detalles es un ARRAY de alumnos
            const listaAlumnos = detalles.map(alumno => {
                const practicaActiva = alumno.practicasComoAlumno?.[0] || {};
                
                return {
                    id: alumno.id,
                    name: alumno.name,
                    email: alumno.email,
                    tipo_practica: alumno.tipo_practica || 'N/A',
                    estado_practica: practicaActiva.estado || 'pendiente',
                    practicasComoAlumno: alumno.practicasComoAlumno || [] // Para compatibilidad con tu frontend
                };
            });

            return handleSuccess(res, 200, "Lista de alumnos obtenida exitosamente", listaAlumnos);
        }

        // --- CASO 2: Alumno específico (con ID) ---
        if (!detalles) {
            return handleErrorClient(res, 404, "Alumno no encontrado");
        }

        // detalles es un OBJETO (un solo alumno)
        const practicaActiva = detalles.practicasComoAlumno[0] || {};

        // Datos básicos del alumno
        const alumnoInfo = {
            id: detalles.id,
            name: detalles.name, 
            email: detalles.email,
            tipo_practica: detalles.tipo_practica || 'N/A'
        };

        // Datos de la Práctica 
        const practicaInfo = {
            id: practicaActiva.id, 
            estado: practicaActiva.estado || 'No Iniciada',
            fechaInicio: (practicaActiva.fecha_inicio && practicaActiva.fecha_inicio instanceof Date) 
                ? practicaActiva.fecha_inicio.toISOString().split('T')[0] 
                : (typeof practicaActiva.fecha_inicio === 'string' 
                    ? practicaActiva.fecha_inicio.split('T')[0]
                    : 'Pendiente'),
        };

        // Datos de la Empresa
        const empresa = practicaActiva.empresaToken || {};
        practicaInfo.empresa = {
            nombre: empresa.empresaNombre || 'N/A',
            email: empresa.empresaCorreo || 'N/A',
        };

        // Documentos
        const documentosInfo = (practicaActiva.documentos || []).map(doc => {
            const ruta = doc.ruta_archivo;
            const extension = ruta ? path.extname(ruta).toLowerCase() : '.N/A';
            const nombreBase = ruta ? path.basename(ruta) : doc.tipo; 
                
            return {
                tipo: doc.tipo,
                fechaEnvio: (doc.fecha_creacion && doc.fecha_creacion instanceof Date)  
                    ? doc.fecha_creacion.toISOString().split('T')[0] 
                    : 'N/A', 
                estado: doc.estado,
                extension: extension, 
                nombre_archivo: nombreBase,
                urlRevision: doc.ruta_archivo ? `/api/documentos/revisar/${doc.id}` : null,
                documentoId: doc.id, 
                datosFormulario: doc.datos_json,
            };
        });

        const detallesCompletos = {
            alumno: alumnoInfo,
            practica: practicaInfo,
            documentos: documentosInfo,
        };

        return handleSuccess(res, 200, "Información completa de alumno obtenida exitosamente", detallesCompletos);

    } catch (error) {
        // Manejo de errores
        if (error.message.includes("Acceso denegado")) {
            return handleErrorClient(res, 403, error.message);
        }

        if (error.message.includes("No encontrado") || error.message.includes("No es un alumno")) {
            return handleErrorClient(res, 404, error.message);
        }

        return handleErrorServer(res, 500, "Error interno al obtener los detalles.", error.message);
    }
};