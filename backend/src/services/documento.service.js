import{AppDataSource} from "../config/configDb.js";
import { DocumentosPractica} from "../entities/documentos.entity.js";

const documentoRepository = AppDataSource.getRepository(DocumentosPractica);
export async function createDocumentoArchivo(fileData, metadata) {
    const newDoc = documentoRepository.create({
        
        tipo: metadata.tipo_documento, //bitacora, informe
        ruta_archivo: fileData.filename,//nombre del archivo 
        estado: 'enviado',//estado inicial x defecto
        practica: {id: parseInt(metadata.practicaId)},//relacion con practica
        fecha_creacion: new Date() // Asegurar que se guarde la fecha
    });    
    return await documentoRepository.save(newDoc);
}

export async function getDocumentoById(id) {//buscar por id
  return await documentoRepository.findOneBy({ id });
}

export async function deleteDocumento(id) {//eliminar registro de la bdd
  return await documentoRepository.delete({ id });
}