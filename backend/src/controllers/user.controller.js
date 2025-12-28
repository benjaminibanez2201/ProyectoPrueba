/**
 * CONTROLADOR DE DETALLES DE ALUMNOS
 * Proporciona vistas resumidas y detalladas de los estudiantes y sus procesos de práctica
 */
import { getDetallesAlumnos, findAlumnos } from "../services/user.service.js";
import path from "path";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../Handlers/responseHandlers.js";

/**
 * LISTADO SIMPLE DE ALUMNOS
 * Retorna una lista básica de todos los usuarios con rol de alumno
 */
export async function getAlumnos(req, res) {
  try {
    const alumnos = await findAlumnos();
    handleSuccess(res, 200, "Lista de alumnos obtenida exitosamente", alumnos);
  } catch (error) {
    handleErrorServer(
      res,
      500,
      "Error al obtener la lista de alumnos",
      error.message
    );
  }
}

/**
 * VISTA DETALLADA (LISTA O INDIVIDUAL)
 * si recibe un ID, entrega todo sobre ese alumno, sino entrega un resumen de todos los alumnos para la tabla principal.
 */
export const verDetallesAlumnos = async (req, res) => {
  try {
    const id = req.params.id; // Puede ser undefined
    const rol = req.user?.role;

    // El servicio central recupera los datos crudos de la BD
    const detalles = await getDetallesAlumnos(id || null, rol);

    // Caso 1: Lista completa de alumnos (sin ID)
    if (!id) {
      // detalles es un array. Mapeamos para enviar solo lo necesario y evitar sobrecarga de datos.
      const listaAlumnos = detalles.map((alumno) => {
        const practicaActiva = alumno.practicasComoAlumno?.[0] || {};

        return {
          id: alumno.id,
          name: alumno.name,
          email: alumno.email,
          tipo_practica: alumno.tipo_practica || "N/A",
          estado_practica: practicaActiva.estado || "pendiente",
          practicasComoAlumno: alumno.practicasComoAlumno || [],
        };
      });

      return handleSuccess(
        res,
        200,
        "Lista de alumnos obtenida exitosamente",
        listaAlumnos
      );
    }

    // Caso 2: Alumno específico (con ID)
    if (!detalles) {
      return handleErrorClient(res, 404, "Alumno no encontrado");
    }

    // Tomamos la práctica más reciente (activa)
    const practicaActiva = detalles.practicasComoAlumno[0] || {};

    // Datos básicos del alumno
    const alumnoInfo = {
      id: detalles.id,
      name: detalles.name,
      email: detalles.email,
      tipo_practica: detalles.tipo_practica || "N/A",
    };

    // Datos de la práctica
    const practicaInfo = {
      id: practicaActiva.id,
      estado: practicaActiva.estado || "No Iniciada",
      // Formateo de fecha para que el frontend no tenga problemas de zona horaria
      fechaInicio:
        practicaActiva.fecha_inicio &&
        practicaActiva.fecha_inicio instanceof Date
          ? practicaActiva.fecha_inicio.toISOString().split("T")[0]
          : typeof practicaActiva.fecha_inicio === "string"
          ? practicaActiva.fecha_inicio.split("T")[0]
          : "Pendiente",
    };

    // Datos de la empresa
    const empresa = practicaActiva.empresaToken || {};
    practicaInfo.empresa = {
      nombre: empresa.empresaNombre || "N/A",
      email: empresa.empresaCorreo || "N/A",
    };

    // Documentos
    const documentosInfo = (practicaActiva.documentos || []).map((doc) => {
      const ruta = doc.ruta_archivo;
      const extension = ruta ? path.extname(ruta).toLowerCase() : ".N/A";
      const nombreBase = ruta ? path.basename(ruta) : doc.tipo;

      // Determinar la fecha de actividad del documento
      let fecha = "Sin fecha";
      if (doc.fecha_creacion) {
        fecha = new Date(doc.fecha_creacion).toISOString().split("T")[0];
      }
      if (doc.fecha_envio) {
        fecha = new Date(doc.fecha_envio).toISOString().split("T")[0];
      }

      return {
        tipo: doc.tipo,
        fechaEnvio: fecha,
        estado: doc.estado,
        extension: extension,
        nombre_archivo: nombreBase,
        // Generamos la URL de revisión para que el coordinador haga clic directo
        urlRevision: doc.ruta_archivo
          ? `/api/documentos/revisar/${doc.id}`
          : null,
        documentoId: doc.id,
        datosFormulario: doc.datos_json,
      };
    });

    // Formularios (postulación y evaluación) - Solo los enviados/aprobados
    const formulariosRespuestas = practicaActiva.formularioRespuestas || [];
    const formulariosInfo = formulariosRespuestas
      .filter(
        (r) =>
          ["postulacion", "evaluacion_pr1", "evaluacion_pr2"].includes(
            r.plantilla?.tipo
          ) && ["enviado", "aprobado"].includes(r.estado)
      )
      .map((r) => ({
        id: r.id,
        tipo: r.plantilla?.tipo,
        titulo: r.plantilla?.titulo,
        estado: r.estado,
        fechaEnvio: r.fecha_envio
          ? new Date(r.fecha_envio).toISOString().split("T")[0]
          : "N/A",
      }));

    // Consolidación final del expediente
    const detallesCompletos = {
      alumno: alumnoInfo,
      practica: practicaInfo,
      documentos: documentosInfo,
      formularios: formulariosInfo,
    };

    return handleSuccess(
      res,
      200,
      "Información completa de alumno obtenida exitosamente",
      detallesCompletos
    );
  } catch (error) {
    // Manejo de errores de seguridad y existencia
    if (error.message.includes("Acceso denegado")) {
      return handleErrorClient(res, 403, error.message);
    }
    if (
      error.message.includes("No encontrado") ||
      error.message.includes("No es un alumno")
    ) {
      return handleErrorClient(res, 404, error.message);
    }
    return handleErrorServer(
      res,
      500,
      "Error interno al obtener los detalles.",
      error.message
    );
  }
};
