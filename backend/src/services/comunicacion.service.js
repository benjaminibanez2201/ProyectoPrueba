import { AppDataSource } from "../config/configDb.js";
import { Mensaje } from "../entities/mensaje.entity.js";
import { Practica } from "../entities/practica.entity.js";
import { User } from "../entities/user.entity.js";

/**
 * Enviar un mensaje entre coordinador y empresa
 */
export const enviarMensajeService = async (data) => {
    try {
        const { 
            practicaId, 
            asunto, 
            contenido, 
            remitenteTipo, // 'coordinador' o 'empresa'
            remitenteNombre,
            remitenteEmail,
            destinatarioTipo, // 'coordinador' o 'empresa'
            destinatarioNombre,
            destinatarioEmail,
            coordinadorId // Solo si el remitente o destinatario es coordinador
        } = data;

        // 1. Validar que el ID llegó antes de usarlo
        if (!practicaId) throw new Error("ID de práctica no proporcionado");
        
        const mensajeRepo = AppDataSource.getRepository(Mensaje);

        // Validar que la práctica existe
        const practicaRepo = AppDataSource.getRepository(Practica);

        const practica = await practicaRepo.findOne({ 
            where: { id: practicaId },
            relations: ['student']
        });
        
        // Validar que la comunicación sea entre coordinador y empresa
        if (remitenteTipo === destinatarioTipo) {
            throw new Error("La comunicación debe ser entre coordinador y empresa");
        }

        const nuevoMensaje = mensajeRepo.create({
            practica: { id: Number(practicaId) },
            asunto,
            contenido,
            remitente_tipo: remitenteTipo,
            remitente_nombre: remitenteNombre,
            remitente_email: remitenteEmail,
            destinatario_tipo: destinatarioTipo,
            destinatario_nombre: destinatarioNombre,
            destinatario_email: destinatarioEmail,
            coordinador: coordinadorId ? { id: Number(coordinadorId) } : null,
            leido: false
        });

        const mensajeGuardado = await mensajeRepo.save(nuevoMensaje);

        // Retornar con las relaciones cargadas
        return await mensajeRepo.findOne({
            where: { id: mensajeGuardado.id },
            relations: ['practica', 'practica.student', 'coordinador']
        });

    } catch (error) {
        throw new Error("Error al guardar el mensaje: " + error.message);
    }
};

/**
 * Obtener conversación de una práctica específica
 */
export const obtenerConversacionService = async (practicaId, emailUsuario) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        // Obtener mensajes donde el usuario sea remitente o destinatario (por email)
        return await mensajeRepo.find({
            where: [
                { practica: { id: practicaId }, remitente_email: emailUsuario },
                { practica: { id: practicaId }, destinatario_email: emailUsuario }
            ],
            relations: ['practica', 'practica.student', 'coordinador'],
            order: { fecha_envio: "ASC" }
        });
    } catch (error) {
        throw new Error("Error al obtener la conversación: " + error.message);
    }
};

/**
 * Obtener bandeja de entrada del coordinador
 */
export const obtenerBandejaEntradaService = async (coordinadorId) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        const mensajes = await mensajeRepo.find({
            where: { 
                destinatario_tipo: 'coordinador',
                coordinador: { id: coordinadorId }
            },
            relations: ['practica', 'practica.student'],
            order: { fecha_envio: "DESC" }
        });

        const noLeidos = mensajes.filter(m => !m.leido).length;

        return {
            mensajes,
            totalNoLeidos: noLeidos
        };
    } catch (error) {
        throw new Error("Error al obtener bandeja de entrada: " + error.message);
    }
};

/**
 * Obtener mensajes enviados por el coordinador
 */
export const obtenerMensajesEnviadosService = async (coordinadorId) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        return await mensajeRepo.find({
            where: { 
                remitente_tipo: 'coordinador',
                coordinador: { id: coordinadorId }
            },
            relations: ['practica', 'practica.student'],
            order: { fecha_envio: "DESC" }
        });
    } catch (error) {
        throw new Error("Error al obtener mensajes enviados: " + error.message);
    }
};

/**
 * Marcar mensaje como leído
 */
export const marcarComoLeidoService = async (mensajeId, emailUsuario) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        const mensaje = await mensajeRepo.findOne({
            where: { 
                id: mensajeId,
                destinatario_email: emailUsuario
            }
        });

        if (!mensaje) {
            throw new Error("Mensaje no encontrado o no tienes permiso");
        }

        if (!mensaje.leido) {
            mensaje.leido = true;
            mensaje.fecha_lectura = new Date();
            await mensajeRepo.save(mensaje);
        }

        return mensaje;
    } catch (error) {
        throw new Error("Error al marcar como leído: " + error.message);
    }
};

/**
 * Obtener cantidad de mensajes no leídos
 */
export const contarNoLeidosService = async (coordinadorId) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        return await mensajeRepo.count({
            where: {
                destinatario_tipo: 'coordinador',
                coordinador: { id: coordinadorId },
                leido: false
            }
        });
    } catch (error) {
        throw new Error("Error al contar mensajes no leídos: " + error.message);
    }
};