import { AppDataSource } from "../config/configDb.js";
import { Recurso } from "../entities/recurso.entity.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../Handlers/responseHandlers.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export const uploadRecurso = async (req, res) => {
    try {
        const { nombre } = req.body;
        const file = req.file;

        if (!file) {
            return handleErrorClient(res, 400, "No se ha subido ningún archivo.");
        }

        const recursoRepo = AppDataSource.getRepository(Recurso);

        // Guardamos la ruta relativa que servirá el servidor estático
        // file.filename es el nombre que le puso multer (ej: file-123456.pdf)
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

export const getRecursos = async (req, res) => {
    try {
        const recursoRepo = AppDataSource.getRepository(Recurso);
        // Ordenamos por fecha descendente (lo más nuevo primero)
        const recursos = await recursoRepo.find({ order: { fecha_subida: 'DESC' } });
        
        handleSuccess(res, 200, "Lista de documentos obtenida", recursos);
    } catch (error) {
        handleErrorServer(res, 500, "Error al obtener documentos", error.message);
    }
};

export const deleteRecurso = async (req, res) => {
    try {
        const { id } = req.params;
        const recursoRepo = AppDataSource.getRepository(Recurso);
        
        const recurso = await recursoRepo.findOneBy({ id: parseInt(id) });
        if (!recurso) {
            return handleErrorClient(res, 404, "Documento no encontrado");
        }

        // OPCIONAL: Borrar el archivo físico del disco
        try {
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const filePath = path.join(__dirname, '../../uploads', path.basename(recurso.url));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            console.error("No se pudo borrar el archivo físico:", err);
            // No detenemos el proceso, igual borramos de la BD
        }

        await recursoRepo.remove(recurso);
        handleSuccess(res, 200, "Documento eliminado correctamente");
    } catch (error) {
        handleErrorServer(res, 500, "Error al eliminar el documento", error.message);
    }
};