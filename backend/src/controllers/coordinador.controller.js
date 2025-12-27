/**
 * CONTROLADOR DE EVALUACIÓN DE SOLICITUDES
 * Maneja el flujo de validación de prácticas por parte del coordinador.
 */
import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";
import { FormularioRespuesta } from "../entities/FormularioRespuesta.entity.js";
import { handleErrorClient, handleSuccess, handleErrorServer } from "../Handlers/responseHandlers.js";
import { enviarNotificacionEvaluacion } from "../services/email.service.js";
import { enviarMensajeService } from "../services/comunicacion.service.js";

/**
 * 1. OBTENER PENDIENTES
 * Recupera todas las prácticas que están esperando la revisión del coordinador.
 */
export const getPendientes = async (req, res) => {
    try {
        const practicaRepo = AppDataSource.getRepository(Practica);

        // Buscamos registros cuyo estado sea específicamente para revisión
        const pendientes = await practicaRepo.find({
            where: { estado: "pendiente_validacion" }, 
            // Traemos relaciones para mostrar quién es el alumno y qué empresa es
            relations: ["student", "empresaToken", "formularioRespuestas", "formularioRespuestas.plantilla"],
            order: { fecha_actualizacion: "DESC" }
        });

        return handleSuccess(res, 200, "Solicitudes pendientes obtenidas", pendientes);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener pendientes", error.message);
    }
};

/**
 * 2. EVALUAR SOLICITUD (Aprobar o Rechazar)
 * Cambia el estado de la práctica y dispara acciones automáticas (emails/mensajes).
 */
export const evaluarSolicitud = async (req, res) => {
    try {
        const { id } = req.params; // ID de la práctica a evaluar
        const { decision, observaciones, destinatario } = req.body; // decision: 'aprobar' | 'rechazar'

        const practicaRepo = AppDataSource.getRepository(Practica);
        const respuestaRepo = AppDataSource.getRepository(FormularioRespuesta);

        // Obtenemos la práctica con toda su información de contacto
        const practica = await practicaRepo.findOne({
            where: { id },
            relations: [
                "formularioRespuestas",
                "student",
                "empresaToken",
                "empresa"
            ]
        });

        if (!practica) return handleErrorClient(res, 404, "Práctica no encontrada");

        // Obtenemos el formulario de postulación asociado a esta práctica
        // Asumimos que es la primera o filtramos por tipo si es necesario
        const respuestaForm = practica.formularioRespuestas[0]; 

        /**
         * LÓGICA SEGÚN LA DECISIÓN
         */
        if (decision === 'aprobar') {
            // CASO APROBADO: La práctica inicia oficialmente
            practica.estado = "en_curso"; 
            practica.fecha_inicio = new Date(); 
            
            if (respuestaForm) {
                respuestaForm.estado = "aprobado"; // Actualizamos estado del formulario
                respuestaForm.comentario_coordinador = observaciones || "Solicitud aprobada exitosamente.";
                await respuestaRepo.save(respuestaForm);
            }

        } else if (decision === 'rechazar') {
            // CASO RECHAZADO: Se requiere corrección
            practica.estado = "rechazada"; 
            practica.correccion_destinatario = destinatario || null; // Quién debe corregir: 'alumno', 'empresa' o 'ambos'
            practica.correccion_alumno_hecha = false;
            practica.correccion_empresa_hecha = false;
            
            if (respuestaForm) {
                respuestaForm.estado = "rechazado";
                respuestaForm.comentario_coordinador = observaciones; // Feedback para el usuario
                await respuestaRepo.save(respuestaForm);
            }
        } else {
            return handleErrorClient(res, 400, "Decisión inválida");
        }

        // Guardamos los cambios en la práctica
        await practicaRepo.save(practica);

        /**
         * 3. NOTIFICACIONES AUTOMÁTICAS (POST-EVALUACIÓN)
         */
        
        // Envío de Email: Se dispara sin await para no bloquear la respuesta al usuario
        enviarNotificacionEvaluacion(practica, decision, observaciones, destinatario);

        /**
         * 4. MENSAJERÍA INTERNA AUTOMÁTICA
         * Si es un rechazo hacia la empresa, creamos un hilo en el chat automáticamente
         */
        try {
            if (decision === 'rechazar' && (destinatario === 'empresa' || destinatario === 'ambos')) {
                const asunto = "Observación de práctica – correcciones requeridas";
                const contenido = `Se ha observado la documentación de la práctica del alumno ${practica.student?.name || ''}.\n\nDetalle: ${observaciones || 'Sin detalle.'}`;

                const destinatarioNombre = practica.empresaToken?.empresaNombre || practica.empresa?.name || "Empresa";
                const destinatarioEmail = practica.empresa?.email || practica.empresaToken?.empresaCorreo;

                if (destinatarioEmail) {
                    // Crea el registro en la tabla de mensajes para que aparezca en el chat
                    enviarMensajeService({
                        practicaId: practica.id,
                        asunto,
                        contenido,
                        remitenteTipo: 'coordinador',
                        remitenteNombre: req.user?.name || 'Coordinador',
                        remitenteEmail: req.user?.email || 'coordinador@u.cl',
                        destinatarioTipo: 'empresa',
                        destinatarioNombre,
                        destinatarioEmail,
                        coordinadorId: req.user?.id || null
                    });
                }
            }
        } catch (e) {
            // Error silencioso: si falla el mensaje de chat, no queremos que falle toda la aprobación
            console.warn('No se pudo crear mensaje interno automático:', e?.message);
        }

        return handleSuccess(res, 200, `Solicitud ${decision === 'aprobar' ? 'Aprobada' : 'Rechazada'} correctamente.`);

    } catch (error) {
        return handleErrorServer(res, 500, "Error al evaluar solicitud", error.message);
    }
};