import { createDocumentoArchivo } from "../services/documento.service.js";
import {handleSuccess, handleErrorClient, handleErrorServer} from '../Handlers/responseHandlers.js';
import {getPublicUrl} from '../helpers/file.helper.js';
import fs from 'fs/promises'; 
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocumentoById, deleteDocumento } from '../services/documento.service.js';

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