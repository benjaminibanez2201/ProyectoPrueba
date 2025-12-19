import { AppDataSource } from "../config/configDb.js";
import { Mensaje } from "../entities/mensaje.entity.js";
import { User } from "../entities/user.entity.js";
import { Practica } from "../entities/practica.entity.js";

/**
 * Enviar un mensaje entre coordinador y empresa
 */
export const enviarMensajeService = async (data) => {
    try {
        const { practicaId, asunto, contenido, remitenteId, remitenteTipo, destinatarioId, destinatarioTipo } = data;
        
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        // Validar que la práctica existe
        const practicaRepo = AppDataSource.getRepository(Practica);
        const practica = await practicaRepo.findOne({ where: { id: practicaId } });
        if (!practica) {
            throw new Error("Práctica no encontrada");
        }

        // Validar que los usuarios existen
        const userRepo = AppDataSource.getRepository(User);
        const remitente = await userRepo.findOne({ where: { id: remitenteId } });
        const destinatario = await userRepo.findOne({ where: { id: destinatarioId } });
        
        if (!remitente || !destinatario) {
            throw new Error("Remitente o destinatario no encontrado");
        }

        // Validar que la comunicación sea entre coordinador y empresa
        if (remitenteTipo === destinatarioTipo) {
            throw new Error("La comunicación debe ser entre coordinador y empresa");
        }

        const nuevoMensaje = mensajeRepo.create({
            practica: { id: practicaId },
            asunto,
            contenido,
            remitente: { id: remitenteId },
            remitente_tipo: remitenteTipo,
            destinatario: { id: destinatarioId },
            destinatario_tipo: destinatarioTipo,
            leido: false
        });

        const mensajeGuardado = await mensajeRepo.save(nuevoMensaje);

        // Retornar con las relaciones cargadas
        return await mensajeRepo.findOne({
            where: { id: mensajeGuardado.id },
            relations: ['remitente', 'destinatario', 'practica', 'practica.alumno']
        });

    } catch (error) {
        throw new Error("Error al guardar el mensaje: " + error.message);
    }
};

/**
 * Obtener conversación de una práctica específica
 */
export const obtenerConversacionService = async (practicaId, userId) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        // Obtener mensajes donde el usuario sea remitente o destinatario
        return await mensajeRepo.find({
            where: [
                { practica: { id: practicaId }, remitente: { id: userId } },
                { practica: { id: practicaId }, destinatario: { id: userId } }
            ],
            relations: ['remitente', 'destinatario', 'practica'],
            order: { fecha_envio: "ASC" }
        });
    } catch (error) {
        throw new Error("Error al obtener la conversación: " + error.message);
    }
};

/**
 * Obtener bandeja de entrada del usuario
 */
export const obtenerBandejaEntradaService = async (userId) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        const mensajes = await mensajeRepo.find({
            where: { destinatario: { id: userId } },
            relations: ['remitente', 'practica', 'practica.alumno'],
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
 * Obtener mensajes enviados por el usuario
 */
export const obtenerMensajesEnviadosService = async (userId) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        return await mensajeRepo.find({
            where: { remitente: { id: userId } },
            relations: ['destinatario', 'practica', 'practica.alumno'],
            order: { fecha_envio: "DESC" }
        });
    } catch (error) {
        throw new Error("Error al obtener mensajes enviados: " + error.message);
    }
};

/**
 * Marcar mensaje como leído
 */
export const marcarComoLeidoService = async (mensajeId, userId) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        const mensaje = await mensajeRepo.findOne({
            where: { 
                id: mensajeId,
                destinatario: { id: userId }
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
export const contarNoLeidosService = async (userId) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        return await mensajeRepo.count({
            where: {
                destinatario: { id: userId },
                leido: false
            }
        });
    } catch (error) {
        throw new Error("Error al contar mensajes no leídos: " + error.message);
    }
};