/**
 * CONTROLADOR PRINCIPAL DE PRÁCTICAS
 * Gestiona el ciclo de vida completo: Postulación, Estados, Finalización y Cierre.
 */
import {
  findPracticas,
  findPracticaById,
  createPractica,
  updatePractica,
  deletePractica,
  findPracticaByStudentId,
  createPostulacion,
} from "../services/practica.service.js";
import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";
import { EmpresaToken } from "../entities/empresaToken.entity.js";
import { FormularioRespuesta } from "../entities/FormularioRespuesta.entity.js";
import { sendTokenEmail, sendSolicitudEvaluacionEmail } from "../services/email.service.js";
import crypto from "crypto";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export class PracticaController {

  /**
   * Obtiene todas las prácticas del sistema (Vista para el Coordinador).
   */
  async getAll(req, res) {
    try {
      const practicas = await findPracticas();
      handleSuccess(res, 200, "Prácticas obtenidas correctamente", practicas);
    } catch (error) {
      handleErrorServer(res, 500, "Error al obtener prácticas", error.message);
    }
  }

  /**
   * Obtiene la práctica específica del alumno logueado.
   * Usa req.user.id (o .sub para compatibilidad con diferentes proveedores de JWT).
   */
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

  /**
   * PROCESO DE POSTULACIÓN
   * Crea el registro inicial de la práctica y genera el token para la empresa.
   */
  async postularPractica(req, res) {
    try {
      const studentId = req.user.id || req.user.sub; 
      const data = req.body; 

      if (!studentId) {
        return handleErrorClient(res, 400, "Error de identidad: No se pudo obtener tu ID.");
      }

      // Validación básica de campos requeridos para la empresa
      if (!data.nombreEmpresa || !data.emailEmpresa || !data.nombreRepresentante) {
        return handleErrorClient(res, 400, "Faltan datos de la empresa (nombre, email y representante)");
      }
      
      // El servicio createPostulacion encapsula la lógica de crear la entidad y el token
      const nuevaPractica = await createPostulacion(data, studentId);
      
      handleSuccess(res, 201, "Postulación enviada. El token se ha generado.", nuevaPractica);
    } catch (error) {
      // Manejo de conflicto: Un alumno no puede tener dos prácticas activas
      if (error.message.includes("Ya tienes una práctica")) { 
        return handleErrorClient(res, 409, error.message); 
      }
      handleErrorServer(res, 500, "Error al crear la postulación", error.message);
    }
  }

  /**
   * Obtiene una práctica por su ID.
   * Usado principalmente por el Coordinador para ver detalles específicos.
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const practica = await findPracticaById(id);
      handleSuccess(res, 200, "Práctica encontrada", practica);
    } catch (error) {
      handleErrorClient(res, 404, error.message);
    }
  }

  /**
   * Crea una nueva práctica (uso interno o administrativo).
   */
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

  /**
   * Actualiza una práctica existente.
   */
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

  /**
   * Elimina una práctica por su ID.
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await deletePractica(id);
      handleSuccess(res, 200, "Práctica eliminada correctamente", { id });
    } catch (error) {
      handleErrorClient(res, 404, error.message);
    }
  }

  /**
   * ACTUALIZAR ESTADO (Flujo del Coordinador)
   * Incluye una lógica especial de "Reinicio": Si el estado vuelve a 'pendiente', se borra todo.
   */
  async actualizarEstado(req, res) { 
    try {
      const { id } = req.params;
      const { nuevoEstado } = req.body;
      const estadosPermitidos = [ "pendiente", "enviada_a_empresa", "pendiente_validacion", "rechazada", "en_curso", "finalizada", "evaluada", "cerrada" ];
      
      if (!estadosPermitidos.includes(nuevoEstado)) {
        return handleErrorClient(res, 400, "Estado no válido");
      }

      const practicaRepo = AppDataSource.getRepository(Practica);
      const practica = await practicaRepo.findOne({ where: { id } });
      
      if (!practica) {
        return handleErrorClient(res, 404, "Práctica no encontrada");
      }

      /**
       * LÓGICA DE REINICIO CRÍTICO:
       * Si el coordinador selecciona 'pendiente', se eliminan todos los rastros para 
       * permitir que el alumno empiece de cero.
       */
      if (nuevoEstado === 'pendiente') {
          // 1. Eliminar Tokens asociados
          const tokenRepo = AppDataSource.getRepository(EmpresaToken);
          const token = await tokenRepo.findOne({ where: { practica: { id } } });
          if (token) await tokenRepo.remove(token);

          // 2. Eliminar respuestas de formularios (Postulaciones, bitácoras)
          const respuestasRepo = AppDataSource.getRepository(FormularioRespuesta);
          const respuestas = await respuestasRepo.find({ where: { practica: { id } } });
          if (respuestas.length > 0) await respuestasRepo.remove(respuestas);

          // 3. Eliminar la práctica
          await practicaRepo.remove(practica);

          return handleSuccess(res, 200, "Práctica reiniciada y eliminada. El alumno puede postular nuevamente.", null);
      }
      // Si no es reinicio, solo actualizamos el estado
      practica.estado = nuevoEstado;
      const updated = await practicaRepo.save(practica);
      handleSuccess(res, 200, "Estado de práctica actualizado correctamente", updated);
    } catch (error) {
      handleErrorServer(res, 500, "Error al actualizar estado de práctica", error.message);
    }
  }

  /**
   * CERRAR PRÁCTICA (Acción del Coordinador)
   */
  async cerrarPractica(req, res) { 
    try {
      const { id } = req.params;
      const userRole = req.user?.role; 

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
      practica.fecha_cierre = new Date();
      practica.cerrado_por = req.user?.name || req.user?.email || "Coordinador";

      const updated = await updatePractica(id, practica);

      handleSuccess(res, 200, "Práctica cerrada correctamente", {
        id: practica.id,
        fecha_cierre: practica.fecha_cierre,
        cerrado_por: practica.cerrado_por,
        estado: practica.estado,
      });
    } catch (error) {
      handleErrorServer(res, 500, "Error al cerrar práctica", error.message);
    }
  }
  
  /**
   * FINALIZAR PRÁCTICA (Acción del Alumno)
   * Marca el fin de horas de trabajo y solicita la evaluación a la empresa vía email.
   */
  async finalizarPractica(req, res) {
    try {
      const { id } = req.params; 
      const alumnoId = req.user?.id || req.user?.sub;
      if (!alumnoId) return handleErrorClient(res, 401, "No autenticado");

      const practicaRepo = AppDataSource.getRepository(Practica);
      const tokenRepo = AppDataSource.getRepository(EmpresaToken);

      // Cargamos relaciones para identificar al supervisor y nivel de práctica
      const practica = await practicaRepo.findOne({ where: { id }, relations: ["student", "empresaToken", "formularioRespuestas", "formularioRespuestas.plantilla"] });
      if (!practica) return handleErrorClient(res, 404, "Práctica no encontrada");
      if (practica.student?.id !== alumnoId) return handleErrorClient(res, 403, "No autorizado");

      if (practica.estado !== 'en_curso' && practica.estado !== 'finalizada') {
        return handleErrorClient(res, 400, "La práctica debe estar en curso para finalizar.");
      }

      // Identificamos el nivel (Profesional I o II) para personalizar el correo de evaluación
      const postResp = practica.formularioRespuestas?.find(r => r.plantilla?.tipo === 'postulacion');
      const tipoPractica = postResp?.datos?.tipo_practica; // "Profesional I" | "Profesional II"
      practica.nivel = (tipoPractica === 'Profesional II') ? 'pr2' : 'pr1';

      practica.estado = 'finalizada';
      practica.evaluacion_pendiente = true;

      // Recuperamos o generamos un token de acceso para el supervisor
      let tokenValue = practica.empresaToken?.token;
      if (!tokenValue) {
        tokenValue = crypto.randomBytes(20).toString('hex');
        const fechaExp = new Date();
        fechaExp.setDate(fechaExp.getDate() + 30);

        const nuevoToken = tokenRepo.create({
          token: tokenValue,
          empresaNombre: practica.empresa?.name || practica.empresaToken?.empresaNombre || null,
          empresaCorreo: practica.empresa?.email || practica.empresaToken?.empresaCorreo || null,
          expiracion: fechaExp,
          practica,
        });
        await tokenRepo.save(nuevoToken);
      }

      await practicaRepo.save(practica);

      // Enviar correo a empresa con instrucción para evaluación (plantilla específica)
      try {
        // Obtener correo/nombre del supervisor desde la postulación
        const post = practica.formularioRespuestas?.find(r => r.plantilla?.tipo === 'postulacion');
        const correo = post?.datos?.correo_supervisor || practica.empresa?.email || practica.empresaToken?.empresaCorreo;
        const nombreRep = post?.datos?.nombre_supervisor || practica.empresa?.name || practica.empresaToken?.empresaNombre || "Supervisor";
        if (correo) {
          const nivelTexto = practica.nivel === 'pr2' ? 'Profesional II' : 'Profesional I';
          await sendSolicitudEvaluacionEmail(
            correo,
            nombreRep,
            tokenValue,
            practica.student?.name || "Alumno",
            nivelTexto
          );
        }
      } catch (e) {
        console.warn("No se pudo enviar correo de evaluación:", e.message);
      }

      return handleSuccess(res, 200, "Práctica finalizada. Se ha enviado la evaluación a la empresa.", {
        id: practica.id,
        estado: practica.estado,
        evaluacion_pendiente: practica.evaluacion_pendiente,
      });
    } catch (error) {
      return handleErrorServer(res, 500, "Error al finalizar práctica", error.message);
    }
  }

  /**
   * APROBAR INICIO DE PRÁCTICA (Acción del Coordinador)
   * Marca el inicio de la práctica como aprobado.
   */
  async aprobarInicioPractica(req, res) {
    try {
      const { id } = req.params;
      const userRole = req.user?.role;

      if (userRole !== "coordinador") {
        return handleErrorClient(res, 403, "Solo el coordinador puede aprobar prácticas.");
      }

      const practica = await findPracticaById(id);
      if (!practica) return handleErrorClient(res, 404, "Práctica no encontrada");

      // Actualizamos el estado a 'en_curso'
      practica.estado = "en_curso";

      const updated = await updatePractica(id, practica);
      handleSuccess(res, 200, "Práctica aprobada y puesta En Curso.", updated);
    } catch (error) {
      handleErrorServer(res, 500, "Error al aprobar la práctica", error.message);
    }
  }

  /**
   * OBSERVAR PRÁCTICA (Acción del Coordinador)
   */
  async observarPractica(req, res) {
    try {
      const { id } = req.params;
      const userRole = req.user?.role;

      if (userRole !== "coordinador") return handleErrorClient(res, 403, "Sin permisos");

      const practica = await findPracticaById(id);
      if (!practica) return handleErrorClient(res, 404, "Práctica no encontrada");

      practica.estado = "rechazada"; 
      
      const updated = await updatePractica(id, practica);
      handleSuccess(res, 200, "Práctica observada. Se ha notificado al alumno.", updated);
    } catch (error) {
      handleErrorServer(res, 500, "Error al observar práctica", error.message);
    }
  }

}
