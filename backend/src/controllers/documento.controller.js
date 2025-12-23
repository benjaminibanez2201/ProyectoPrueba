import { AppDataSource } from "../config/configDb.js";
import { DocumentosPractica } from '../entities/documentos.entity.js';
import { createDocumentoArchivo } from "../services/documento.service.js";
import {handleSuccess, handleErrorClient, handleErrorServer} from '../Handlers/responseHandlers.js';
import {getPublicUrl} from '../helpers/file.helper.js';
import fs from 'fs/promises'; 
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocumentoById, deleteDocumento } from '../services/documento.service.js';

const DocumentoRepository = AppDataSource.getRepository(DocumentosPractica);

export async function uploadDocumento(req, res) {
    try {
        const file = req.file;

        //los datos de texto viene en req.body
        //recordar que en el frontend se va enviar 'tipo' y 'practicaId' 
        const{tipo, practicaId} = req.body;
        if (!file) {
            return handleErrorClient(res, 400, 'No se ha subido ningún archivo.');
        }
        if (!tipo || !practicaId) {
            return handleErrorClient(res, 400, 'Faltan datos obligatorios: tipo (bitácora/informe) o practicaId.');
        }
        //para guardar en la bd
        const nuevoDocumento = await createDocumentoArchivo(file, {tipo_documento: tipo, practicaId});

        //retornar la url publica del archivo subido
        const respuesta = { ...nuevoDocumento, url: getPublicUrl(file.filename) };
        handleSuccess(res, 201, 'Documento subido con éxito.', respuesta);
    } catch (error) {
        //si la practica no existe(error de clave foranea) o otros errores
        if (error.code === '23503') {
            return handleErrorClient(res, 404, 'La práctica especificada no existe.');
        }
        handleErrorServer(res, 500, 'Error al subir el documento.', error.message);
    }
}

export async function deleteDocumentoHandler(req, res) {
  try {
    const { id } = req.params;

    // Buscamos el documento en la bdd para saber su nombre
    const documento = await getDocumentoById(id);

    if (!documento) {
      return handleErrorClient(res, 404, "Documento no encontrado");
    }

    // ruta física del archivo
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.resolve(__dirname, '../../uploads', documento.ruta_archivo);

    //borrar el archivo físico
    try {
      await fs.unlink(filePath); // 'unlink' significa borrar archivo
    } catch (fileError) {
      // Si el archivo no existe físicamente (alguien lo borró a mano), 
      // solo hacemos un console.warn pero seguimos adelante para borrar el registro de la bdd
      console.warn("Advertencia: El archivo físico no se encontró, se borrará solo de la BDD.");
    }

    // Borrar el registro de la Base de Datos
    await deleteDocumento(id);

    handleSuccess(res, 200, "Documento eliminado correctamente");

  } catch (error) {
    handleErrorServer(res, 500, "Error al eliminar el documento", error.message);
  }
}

// para que el coordinador revise un documento específico
export async function revisarDocumento(req, res) {
    try {
        const documentoId = req.params.id; // id del documento a revisar

        // buscar el documento en la bdd
        const documento = await DocumentoRepository.findOne({ where: { id: documentoId } });

        if (!documento || !documento.ruta_archivo) { // si no existe o no tiene ruta de archivo
            return handleErrorClient(res, 404, "Documento o ruta de archivo no encontrada.");
        }

        // construir la ruta física del archivo
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // eliminar el prefijo 'uploads/' si existe
        let nombreArchivo = documento.ruta_archivo.replace(/^uploads\//, '');
        const filePath = path.resolve(__dirname, '../../uploads', nombreArchivo);

        // configuración de encabezados para visualización/descarga
        const fileExtension = path.extname(documento.ruta_archivo).toLowerCase();
        let contentType = 'application/octet-stream'; // Tipo genérico
        
        if (fileExtension === '.pdf') { // PDF
            contentType = 'application/pdf';
        } else if (fileExtension === '.docx' || fileExtension === '.doc') { // DOCX/DOC
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; 
        } else if (fileExtension === '.zip') { // ZIP
            contentType = 'application/zip'; 
        }
        
        //establecer los encabezados 
        res.setHeader('Content-Type', contentType);

        //establecer Content-Disposition según el tipo de archivo
        if (fileExtension === '.zip') {
            //ZIP, DOCX: Forzar DESCARGA.
            res.setHeader('Content-Disposition', `attachment; filename="${path.basename(documento.ruta_archivo)}"`);
        } else {
            //PDF: Visualización INLINE.
            res.setHeader('Content-Disposition', `inline; filename="${path.basename(documento.ruta_archivo)}"`);
        }
        //servir el archivo
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error("Error al servir el archivo:", err);
                if (err.code === 'ENOENT') { // archivo no encontrado
                    return handleErrorServer(res, 404, "Archivo físico no encontrado en el servidor.", err.code);
                }
                return handleErrorServer(res, 500, "Error desconocido al servir el archivo.", err.message);
            }
        });
    } catch (error) {
        handleErrorServer(res, 500, "Error interno al revisar el documento.", error.message);
    }
}