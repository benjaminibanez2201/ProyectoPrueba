import { AppDataSource } from "../config/configDb.js";
import { Mensaje } from "../entities/mensaje.entity.js";

//Guarda un nuevo mensaje en el historial.
export const enviarMensajeService = async (practicaId, contenido, remitente) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        const nuevoMensaje = mensajeRepo.create({
            practica: { id: practicaId },
            contenido,
            remitente
        });

        return await mensajeRepo.save(nuevoMensaje);
    } catch (error) {
        throw new Error("Error al guardar el mensaje: " + error.message);
    }
};

//Obtiene todos los mensajes de una práctica específica.
export const obtenerHistorialService = async (practicaId) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        return await mensajeRepo.find({
            where: { practica: { id: practicaId } },
            order: { fecha_envio: "ASC" } // Mensajes antiguos primero
        });
    } catch (error) {
        throw new Error("Error al obtener el historial: " + error.message);
    }
};