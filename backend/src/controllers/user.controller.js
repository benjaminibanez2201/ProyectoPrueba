import { getDetallesAlumnos, findAlumnos } from "../services/user.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";
import path from 'path';

//para revisar el listado de alumnos(funcion del coordinador de practica)
export async function getAlumnos(req, res) {
  try {
    const alumnos = await findAlumnos();
    handleSuccess(res, 200, "Lista de alumnos obtenida exitosamente", alumnos);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener la lista de alumnos", error.message);
  }
}

//manejar lista completa Y alumno individual
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

            let fecha = 'Sin fecha';
            if (doc.fecha_creacion) {
              fecha = new Date(doc.fecha_creacion).toISOString().split('T')[0];
            } 
            if (doc.fecha_envio) {
              fecha = new Date(doc.fecha_envio).toISOString().split('T')[0];
            } 

            return {
                tipo: doc.tipo,
                fechaEnvio: fecha,
                estado: doc.estado,
                extension: extension, 
                nombre_archivo: nombreBase,
                urlRevision: doc.ruta_archivo ? `/api/documentos/revisar/${doc.id}` : null,
                documentoId: doc.id, 
                datosFormulario: doc.datos_json
            };
        });

        // Formularios (Postulación y Evaluación) - Solo los enviados/aprobados
        const formulariosRespuestas = practicaActiva.formularioRespuestas || [];
        const formulariosInfo = formulariosRespuestas
            .filter(r => 
                ['postulacion', 'evaluacion_pr1', 'evaluacion_pr2'].includes(r.plantilla?.tipo) &&
                ['enviado', 'aprobado'].includes(r.estado) // Formularios ya completados
            )
            .map(r => ({
                id: r.id,
                tipo: r.plantilla?.tipo,
                titulo: r.plantilla?.titulo,
                estado: r.estado,
                fechaEnvio: r.fecha_envio 
                    ? new Date(r.fecha_envio).toISOString().split('T')[0] 
                    : 'N/A'
            }));

        const detallesCompletos = {
            alumno: alumnoInfo,
            practica: practicaInfo,
            documentos: documentosInfo,
            formularios: formulariosInfo,
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