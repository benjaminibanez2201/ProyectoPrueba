import { createDocumentoArchivo } from "../services/documento.service.js";
import {handleSuccess, handleErrorClient, handleErrorServer} from '../Handlers/responseHandlers.js';
import {getPublicUrl} from '../helpers/file.helper.js';

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