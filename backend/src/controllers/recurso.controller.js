/**
 * CONTROLADOR DE RECURSOS (BIBLIOTECA DE DOCUMENTOS)
 * Maneja archivos generales del sistema que están disponibles para descarga pública o institucional.
 */
import { AppDataSource } from "../config/configDb.js";
import { Recurso } from "../entities/recurso.entity.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../Handlers/responseHandlers.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * 1. SUBIR RECURSO
 * Guarda un archivo en el servidor y registra su metadatos (nombre, tipo, url) en la BD.
 */
export const uploadRecurso = async (req, res) => {
    try {
        const { nombre } = req.body;
        const file = req.file; // Archivo capturado por el middleware de Multer

        if (!file) {
            return handleErrorClient(res, 400, "No se ha subido ningún archivo.");
        }

        const recursoRepo = AppDataSource.getRepository(Recurso);

        /**
         * Creamos el registro del recurso.
         * nombre: Se usa el nombre enviado o el nombre original del archivo.
         * tipo: Extraemos la extensión (pdf, docx, etc.) y la normalizamos a minúsculas.
         * url: Ruta relativa para que el servidor estático de Express pueda servirlo.
         */
        const nuevoRecurso = recursoRepo.create({
            nombre: nombre || file.originalname,
            tipo: path.extname(file.originalname).replace('.', '').toLowerCase(),
            url: `/uploads/${file.filename}` 
        });

        await recursoRepo.save(nuevoRecurso);

        handleSuccess(res, 201, "Documento subido exitosamente", nuevoRecurso);
    } catch (error) {
        handleErrorServer(res, 500, "Error al subir el documento", error.message);
    }
};

/**
 * 2. OBTENER RECURSOS
 * Lista todos los documentos disponibles, ordenados por fecha de subida.
 */
export const getRecursos = async (req, res) => {
    try {
        const recursoRepo = AppDataSource.getRepository(Recurso);

        // Obtenemos la lista completa, los más nuevos aparecen primero
        const recursos = await recursoRepo.find({ order: { fecha_subida: 'DESC' } });
        
        handleSuccess(res, 200, "Lista de documentos obtenida", recursos);
    } catch (error) {
        handleErrorServer(res, 500, "Error al obtener documentos", error.message);
    }
};

/**
 * 3. ELIMINAR RECURSO
 * Borra el registro de la base de datos y el archivo físico correspondiente del disco.
 */
export const deleteRecurso = async (req, res) => {
    try {
        const { id } = req.params;
        const recursoRepo = AppDataSource.getRepository(Recurso);
        
        const recurso = await recursoRepo.findOneBy({ id: parseInt(id) });
        if (!recurso) {
            return handleErrorClient(res, 404, "Documento no encontrado");
        }

        /**
         * LIMPIEZA DEL ARCHIVO FÍSICO
         * Es importante borrar el archivo del almacenamiento para no llenar el servidor de basura.
         */
        try {
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            // Construimos la ruta absoluta: subimos dos niveles desde 'controllers' hasta la raíz y entramos a 'uploads'
            const filePath = path.join(__dirname, '../../uploads', path.basename(recurso.url));
            // Verificamos si existe antes de intentar borrarlo
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            // Si el archivo físico no existe (borrado manual), logueamos pero seguimos para limpiar la bdd
            console.error("No se pudo borrar el archivo físico:", err);
        }

        // Eliminamos el registro de la base de datos
        await recursoRepo.remove(recurso);
        handleSuccess(res, 200, "Documento eliminado correctamente");
    } catch (error) {
        handleErrorServer(res, 500, "Error al eliminar el documento", error.message);
    }
};