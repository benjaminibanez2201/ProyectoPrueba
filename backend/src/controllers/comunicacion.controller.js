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

/**
 * Enviar mensaje (Empresa o Coordinador)
 */
export const enviarMensaje = async (req, res) => {
    try {
        const { asunto, contenido, practicaId, token } = req.body;
        const practicaRepo = AppDataSource.getRepository(Practica);
        const userRepo = AppDataSource.getRepository(User);

        let remitenteTipo, remitenteNombre, remitenteEmail, coordinadorId;
        let destinatarioTipo, destinatarioNombre, destinatarioEmail;
        let practicaIdFinal;

        // --- BUSCAR COORDINADOR ---
        // Como no está en la práctica, buscamos al usuario con rol 'coordinador'
        const coordinador = await userRepo.findOne({ where: { role: 'coordinador' } });

        if (token) {
            const tokenData = await validarTokenEmpresa(token);

            // Intentamos obtener el ID de la práctica de todas las fuentes posibles
            // 1. Del objeto practica dentro del token
            // 2. Del campo practicaId que podría venir directamente en tokenData
            // 3. Del practicaId que viene en el req.body (desde el frontend)
            practicaIdFinal = tokenData.practica?.id || tokenData.practicaId || practicaId;

            if (!practicaIdFinal) {
                return handleErrorClient(res, 400, "No se pudo determinar el ID de la práctica. Verifique que el token sea válido para esta práctica.");
            }
            
            const practica = await practicaRepo.findOne({
                where: { id: practicaIdFinal },
                relations: ['empresa', 'empresaToken']
            });

            if (!practica) return handleErrorClient(res, 404, "Práctica no encontrada");

            remitenteTipo = "empresa";
            remitenteNombre = practica.empresaToken?.empresaNombre || practica.empresa?.name || "Representante Empresa";
            remitenteEmail = practica.empresaToken?.empresaCorreo || practica.empresa?.email || "empresa@correo.com";

            destinatarioTipo = "coordinador";
            destinatarioNombre = coordinador?.name || "Coordinador de Prácticas";
            destinatarioEmail = coordinador?.email || "coordinador@u.cl";
            coordinadorId = coordinador?.id; 
        } 
        else if (req.user && req.user.role === 'coordinador') {
            practicaIdFinal = practicaId;
            const practica = await practicaRepo.findOne({ 
                where: { id: practicaIdFinal },
                relations: ['empresa', 'empresaToken']
            });

            if (!practica) return handleErrorClient(res, 404, "Práctica no encontrada");

            remitenteTipo = "coordinador";
            remitenteNombre = req.user.name;
            remitenteEmail = req.user.email;
            coordinadorId = req.user.id;
            
            destinatarioTipo = "empresa";
            destinatarioNombre = practica.empresaToken?.empresaNombre || practica.empresa?.name || "Empresa";
            destinatarioEmail = practica.empresaToken?.empresaCorreo || practica.empresa?.email;
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

/**
 * Obtener conversación de una práctica
 */
export const getConversacion = async (req, res) => {
    try {
        const { practicaId } = req.params;
        const token = req.query.token;
        
        console.log('🔍 getConversacion llamado');
        console.log('📋 PracticaId:', practicaId);
        console.log('🔑 Token:', token ? token.substring(0, 10) + '...' : 'NO');
        
        let emailUsuario;
        
        if (token) {
            // Empresa con token
            console.log('👔 Procesando como empresa...');
            
            // Validar token
            const tokenData = await validarTokenEmpresa(token);
            console.log('✅ Token validado');
            
            // ✅ Obtener email de la empresa desde la práctica
            const practicaRepo = AppDataSource.getRepository(Practica);
            const practica = await practicaRepo.findOne({
                where: { id: parseInt(practicaId) },
                relations: ['empresaToken', 'empresa', 'student'] // Cargar todas las relaciones
            });

            console.log('📋 Práctica encontrada:', {
                id: practica?.id,
                empresa: practica?.empresa,
                empresaToken: practica?.empresaToken
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
            
            console.log('📧 Email empresa:', emailUsuario);

            if (!emailUsuario) {
                console.error('❌ No se encontró email de la empresa en ninguna fuente');
                return handleErrorClient(res, 400, "No se pudo identificar el email de la empresa. Por favor contacte al coordinador.");
            }
            
        } else if (req.user) {
            // Coordinador autenticado
            console.log('👨‍💼 Procesando como coordinador');
            emailUsuario = req.user.email;
            console.log('📧 Email coordinador:', emailUsuario);
        } else {
            return handleErrorClient(res, 401, "No autorizado");
        }

        console.log('🎯 Buscando conversación para:', emailUsuario);
        const conversacion = await obtenerConversacionService(practicaId, emailUsuario);
        console.log('✅ Conversación obtenida:', conversacion.length, 'mensajes');
        
        return handleSuccess(res, 200, "Conversación obtenida", conversacion);

    } catch (error) {
        console.error("💥 Error al obtener conversación:", error);
        console.error("💥 Stack:", error.stack);
        return handleErrorServer(res, 500, error.message);
    }
};

/**
 * Obtener bandeja de entrada
 */
export const getBandejaEntrada = async (req, res) => {
    try {
        const coordinadorId = req.user.id;
        const bandeja = await obtenerBandejaEntradaService(coordinadorId);
        return handleSuccess(res, 200, "Bandeja de entrada obtenida", bandeja);

    } catch (error) {
        console.error("Error al obtener bandeja:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

/**
 * Obtener mensajes enviados
 */
export const getMensajesEnviados = async (req, res) => {
    try {
        const coordinadorId = req.user.id;
        const mensajes = await obtenerMensajesEnviadosService(coordinadorId);
        return handleSuccess(res, 200, "Mensajes enviados obtenidos", mensajes);

    } catch (error) {
        console.error("Error al obtener enviados:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

/**
 * Marcar mensaje como leído
 */
export const marcarLeido = async (req, res) => {
    try {
        const { id } = req.params;
        const token = req.query.token;
        
        let emailUsuario;
        
        if (token) {
            // Validar token
            const tokenData = await validarTokenEmpresa(token);
            
            // Obtener email de la empresa desde la práctica
            const practicaRepo = AppDataSource.getRepository(Practica);
            const practica = await practicaRepo.findOne({
                where: { id: tokenData.practica.id }
            });

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

/**
 * Obtener cantidad de mensajes no leídos
 */
export const getNoLeidos = async (req, res) => {
    try {
        const coordinadorId = req.user.id;
        const count = await contarNoLeidosService(coordinadorId);
        return handleSuccess(res, 200, "No leídos obtenidos", { noLeidos: count });

    } catch (error) {
        console.error("Error al contar no leídos:", error);
        return handleErrorServer(res, 500, error.message);
    }
};