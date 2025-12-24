import { 
    enviarMensajeService, 
    obtenerConversacionService,
    obtenerBandejaEntradaService,
    obtenerMensajesEnviadosService,
    marcarComoLeidoService,
    contarNoLeidosService
} from "../services/comunicacion.service.js";
import { validarTokenEmpresa } from "../services/empresa.service.js";
import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";
import { Mensaje } from "../entities/mensaje.entity.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { User } from "../entities/user.entity.js";

//Enviar mensaje (Empresa o Coordinador)
export const enviarMensaje = async (req, res) => {
    try {
        const { asunto, contenido, practicaId, token } = req.body; // Puede venir de empresa (token) o coordinador (practicaId)
        const practicaRepo = AppDataSource.getRepository(Practica); 
        const userRepo = AppDataSource.getRepository(User);

        // Variables para el remitente y destinatario
        let remitenteTipo, remitenteNombre, remitenteEmail, coordinadorId; 
        let destinatarioTipo, destinatarioNombre, destinatarioEmail;
        let practicaIdFinal; 

        // Buscar coordinador con rol 'coordinador'
        const coordinador = await userRepo.findOne({ where: { role: 'coordinador' } });

        // Caso 1: Envía la empresa (con token)
        if (token) {
            const tokenData = await validarTokenEmpresa(token);

            // Determinar el practicaIdFinal 
            practicaIdFinal = tokenData.practica?.id || tokenData.practicaId || practicaId;

            if (!practicaIdFinal) {
                return handleErrorClient(res, 400, "No se pudo determinar el ID de la práctica. Verifique que el token sea válido para esta práctica.");
            }
            
            // Obtener práctica con relaciones necesarias
            const practica = await practicaRepo.findOne({
                where: { id: practicaIdFinal },
                relations: ['empresa', 'empresaToken']
            });

            if (!practica) return handleErrorClient(res, 404, "Práctica no encontrada");

            remitenteTipo = "empresa"; // La empresa envía el mensaje
            // Prioridad para nombre y email del remitente
            remitenteNombre = practica.empresaToken?.empresaNombre || practica.empresa?.name || "Representante Empresa";
            remitenteEmail = practica.empresaToken?.empresaCorreo || practica.empresa?.email || "empresa@correo.com";

            // Destinatario es el coordinador
            destinatarioTipo = "coordinador";
            destinatarioNombre = coordinador?.name || "Coordinador de Prácticas";
            destinatarioEmail = coordinador?.email || "coordinador@u.cl";
            coordinadorId = coordinador?.id; 
        } 
        // Caso 2: Envía el coordinador (Autenticado)
        else {
            practicaIdFinal = practicaId;
                
            if (!practicaIdFinal) {
                return handleErrorClient(res, 400, "No se pudo determinar el ID de la práctica.");
            }
        
            // Obtener práctica con relaciones necesarias
            const practica = await practicaRepo.findOne({
                where: { id: Number(practicaIdFinal) },
                relations: ['empresa', 'empresaToken']
            });
        
            if (!practica) return handleErrorClient(res, 404, "Práctica no encontrada");
        
            remitenteTipo = "coordinador"; // El coordinador envía el mensaje
            // Prioridad para nombre y email del remitente
            remitenteNombre = req.user?.name || "Coordinador";
            remitenteEmail = req.user?.email || "coordinador@u.cl";
            coordinadorId = req.user?.id || null;
        
            destinatarioTipo = "empresa"; // Lo recibe la empresa
            destinatarioNombre =
                practica.empresaToken?.empresaNombre ||
                practica.empresa?.name ||
                "Empresa";
        
            destinatarioEmail =
                practica.empresa?.email ||
                practica.empresaToken?.empresaCorreo;
        }

        // Antes de llamar al servicio, nos aseguramos de que practicaIdFinal tenga valor
        if (!practicaIdFinal) {
            return handleErrorClient(res, 400, "No se pudo determinar el ID de la práctica.");
        }

        const mensaje = await enviarMensajeService({
            practicaId: practicaIdFinal,
            asunto,
            contenido,
            remitenteTipo,
            remitenteNombre,
            remitenteEmail,
            destinatarioTipo,
            destinatarioNombre,
            destinatarioEmail,
            coordinadorId
        });

        return handleSuccess(res, 201, "Mensaje enviado exitosamente", mensaje);
    } catch (error) {
        console.error("Error:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

// Obtener conversación de una práctica
export const getConversacion = async (req, res) => {
    try {
        const { practicaId } = req.params; // ID de la práctica desde la URL
        const token = req.query.token; // Token desde query
        
        let emailUsuario; // Email de la empresa o coordinador
        
        if (token) {
            // Validar token
            const tokenData = await validarTokenEmpresa(token);
            
            // Obtener email de la empresa desde la práctica
            const practicaRepo = AppDataSource.getRepository(Practica);
            const practica = await practicaRepo.findOne({
                where: { id: parseInt(practicaId) },
                relations: ['empresaToken', 'empresa', 'student'] // Cargar todas las relaciones
            });

            if (!practica) {
                return handleErrorClient(res, 404, "Práctica no encontrada");
            }

            // Prioridad de búsqueda de email:
            // 1. De la relación empresa (User)
            // 2. Del empresaToken (empresaCorreo)
            // 3. Del tokenData validado
            emailUsuario = practica.empresa?.email 
                        || practica.empresaToken?.empresaCorreo
                        || tokenData.empresaCorreo;

            if (!emailUsuario) {
                return handleErrorClient(res, 400, "No se pudo identificar el email de la empresa. Por favor contacte al coordinador.");
            }
            
        } else if (req.user) {
            // Coordinador autenticado
            emailUsuario = req.user.email;
        } else {
            return handleErrorClient(res, 401, "No autorizado");
        }

        // Obtener conversación
        const conversacion = await obtenerConversacionService(practicaId, emailUsuario);

        return handleSuccess(res, 200, "Conversación obtenida", conversacion);

    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
};

// Obtener bandeja de entrada

export const getBandejaEntrada = async (req, res) => {
    try {
        const coordinadorId = req.user.id; // ID del coordinador autenticado
        const bandeja = await obtenerBandejaEntradaService(coordinadorId); // Obtener bandeja de entrada
        return handleSuccess(res, 200, "Bandeja de entrada obtenida", bandeja); 

    } catch (error) {
        console.error("Error al obtener bandeja:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

// Obtener mensajes enviados
export const getMensajesEnviados = async (req, res) => {
    try {
        const coordinadorId = req.user.id; // ID del coordinador autenticado
        const mensajes = await obtenerMensajesEnviadosService(coordinadorId); // Obtener mensajes enviados
        return handleSuccess(res, 200, "Mensajes enviados obtenidos", mensajes);

    } catch (error) {
        console.error("Error al obtener enviados:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

// Marcar mensaje como leído

export const marcarLeido = async (req, res) => {
    try {
        const { id } = req.params; // ID del mensaje desde la URL
        const token = req.query.token; // Token desde query
        
        let emailUsuario;
        
        if (token) {
            // Validar token
            const tokenData = await validarTokenEmpresa(token);
            
            // Obtener email de la empresa desde la práctica
            const practicaRepo = AppDataSource.getRepository(Practica);
            const practica = await practicaRepo.findOne({
                where: { id: tokenData.practica.id }
            });

            // Prioridad para email de la empresa
            emailUsuario = practica.empresa_email || tokenData.empresaCorreo;
        } else if (req.user) {
            emailUsuario = req.user.email;
        } else {
            return handleErrorClient(res, 401, "No autorizado");
        }

        const mensaje = await marcarComoLeidoService(id, emailUsuario);
        return handleSuccess(res, 200, "Mensaje marcado como leído", mensaje);

    } catch (error) {
        console.error("Error al marcar leído:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

// Obtener cantidad de mensajes no leídos
export const getNoLeidos = async (req, res) => {
    try {
        const coordinadorId = req.user.id; // ID del coordinador autenticado
        const count = await contarNoLeidosService(coordinadorId); // Contar no leídos
        return handleSuccess(res, 200, "No leídos obtenidos", { noLeidos: count });

    } catch (error) {
        console.error("Error al contar no leídos:", error);
        return handleErrorServer(res, 500, error.message);
    }
};