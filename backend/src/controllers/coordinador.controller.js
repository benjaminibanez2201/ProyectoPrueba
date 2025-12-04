import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";
import { FormularioRespuesta } from "../entities/FormularioRespuesta.entity.js";
import { handleErrorClient, handleSuccess, handleErrorServer } from "../Handlers/responseHandlers.js";
import { enviarNotificacionEvaluacion } from "../services/email.service.js";

// 1. Obtener lista de prácticas pendientes de validación
export const getPendientes = async (req, res) => {
    try {
        const practicaRepo = AppDataSource.getRepository(Practica);
        
        const pendientes = await practicaRepo.find({
            where: { estado: "pendiente_validacion" },
            relations: ["student", "empresaToken", "formularioRespuestas", "formularioRespuestas.plantilla"],
            order: { fecha_actualizacion: "DESC" }
        });

        return handleSuccess(res, 200, "Solicitudes pendientes obtenidas", pendientes);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener pendientes", error.message);
    }
};

// 2. Acción de Aprobar o Rechazar
export const evaluarSolicitud = async (req, res) => {
    try {
        const { id } = req.params; // ID de la práctica
        const { decision, observaciones, destinatario } = req.body; // decision: 'aprobar' | 'rechazar'

        const practicaRepo = AppDataSource.getRepository(Practica);
        const respuestaRepo = AppDataSource.getRepository(FormularioRespuesta);

        // Buscar la práctica
        const practica = await practicaRepo.findOne({
            where: { id },
            relations: ["formularioRespuestas"]
        });

        if (!practica) return handleErrorClient(res, 404, "Práctica no encontrada");

        // Buscar la respuesta del formulario asociada (Postulación)
        // Asumimos que es la primera o filtramos por tipo si es necesario
        const respuestaForm = practica.formularioRespuestas[0]; 

        if (decision === 'aprobar') {
            practica.estado = "en_curso"; // O el estado que siga en tu flujo
            practica.fecha_inicio = new Date(); // Marcamos inicio oficial
            
            if (respuestaForm) {
                respuestaForm.estado = "aprobado";
                respuestaForm.comentario_coordinador = observaciones || "Solicitud aprobada exitosamente.";
                await respuestaRepo.save(respuestaForm);
            }

        } else if (decision === 'rechazar') {
            practica.estado = "rechazada"; // Vuelve al alumno o muere ahí
            
            if (respuestaForm) {
                respuestaForm.estado = "rechazado";
                respuestaForm.comentario_coordinador = observaciones; // ¡Obligatorio!
                await respuestaRepo.save(respuestaForm);
            }
        } else {
            return handleErrorClient(res, 400, "Decisión inválida");
        }

        await practicaRepo.save(practica);

        // 3. ENVÍO DE CORREO (Después de guardar todo)
        // No ponemos await para que el response sea rápido y el correo se envíe en segundo plano
        enviarNotificacionEvaluacion(practica, decision, observaciones, destinatario);

        return handleSuccess(res, 200, `Solicitud ${decision === 'aprobar' ? 'Aprobada' : 'Rechazada'} correctamente.`);

    } catch (error) {
        return handleErrorServer(res, 500, "Error al evaluar solicitud", error.message);
    }
};