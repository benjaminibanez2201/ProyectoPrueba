/**
 * SERVICIO DE COMUNICACIÓN
 * Contiene la lógica de persistencia para el sistema de mensajería entre Coordinador y Empresa
 */
import { AppDataSource } from "../config/configDb.js";
import { Mensaje } from "../entities/mensaje.entity.js";
import { Practica } from "../entities/practica.entity.js";
import { User } from "../entities/user.entity.js";

/**
 * 1. ENVIAR MENSAJE
 * Crea un nuevo registro de mensaje vinculándolo a una práctica específica
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

        // Validación de integridad de datos
        if (!practicaId) throw new Error("ID de práctica no proporcionado");
        
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        const practicaRepo = AppDataSource.getRepository(Practica);

        // Verificamos que la práctica exista antes de intentar asociar un mensaje
        const practica = await practicaRepo.findOne({ 
            where: { id: practicaId },
            relations: ['student'] // Cargamos al estudiante para referencia
        });
        
        // Un coordinador no puede enviarse mensajes a sí mismo (y viceversa para empresa)
        if (remitenteTipo === destinatarioTipo) {
            throw new Error("La comunicación debe ser entre coordinador y empresa");
        }

        // Creación de la instancia del mensaje
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
            // Si el coordinador está involucrado, vinculamos su ID de usuario
            coordinador: coordinadorId ? { id: Number(coordinadorId) } : null,
            leido: false
        });

        const mensajeGuardado = await mensajeRepo.save(nuevoMensaje);

        // Retornamos el mensaje completo con sus relaciones para actualizar el frontend de inmediato
        return await mensajeRepo.findOne({
            where: { id: mensajeGuardado.id },
            relations: ['practica', 'practica.student', 'coordinador']
        });

    } catch (error) {
        throw new Error("Error al guardar el mensaje: " + error.message);
    }
};

/**
 * 2. OBTENER CONVERSACIÓN
 * Recupera el historial completo de mensajes de una práctica ordenados cronológicamente
 */
export const obtenerConversacionService = async (practicaId, emailUsuario) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        // Buscamos todos los mensajes que pertenezcan a la práctica ID
        return await mensajeRepo.find({
            where: { 
                practica: { id: Number(practicaId) }
            },
            relations: ['practica', 'practica.student', 'coordinador'],
            order: { fecha_envio: "ASC" }
        });
    } catch (error) {
        throw new Error("Error al obtener la conversación: " + error.message);
    }
};

/**
 * 3. OBTENER BANDEJA DE ENTRADA (COORDINADOR)
 * Recupera los mensajes recibidos por un coordinador específico
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

        // Calculamos los no leídos
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
 * 4. OBTENER MENSAJES ENVIADOS
 * Recupera el historial de salida del coordinador
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
 * 5. MARCAR COMO LEÍDO
 * Actualiza el estado de lectura y registra la fecha/hora exacta
 */
export const marcarComoLeidoService = async (mensajeId, emailUsuario) => {
    try {
        const mensajeRepo = AppDataSource.getRepository(Mensaje);
        
        // Buscamos el mensaje y validamos que el destinatario sea quien intenta leerlo
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
 * 6. CONTAR NO LEÍDOS
 * Consulta optimizada que solo devuelve el número de mensajes pendientes
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