/**
 * SERVICIO DE GESTIÓN DE DOCUMENTOS
 * Maneja la persistencia de metadatos de archivos (bitácoras, informes, CVs) en la base de datos
 */
import { AppDataSource } from "../config/configDb.js";
import { DocumentosPractica } from "../entities/documentos.entity.js";

const documentoRepository = AppDataSource.getRepository(DocumentosPractica);
/**
 * CREAR REGISTRO DE DOCUMENTO
 * Vincula un archivo físico ya guardado en el servidor con una práctica en la base de datos
 */
export async function createDocumentoArchivo(fileData, metadata) {
  // Creamos la instancia de la entidad con los datos necesarios
  const newDoc = documentoRepository.create({
    tipo: metadata.tipo_documento, //CV, informe, otro
    ruta_archivo: fileData.filename, //nombre del archivo
    estado: "enviado", //estado inicial x defecto
    practica: { id: parseInt(metadata.practicaId) }, //relacion con practica
    fecha_creacion: new Date(), // Asegurar que se guarde la fecha
  });
  return await documentoRepository.save(newDoc);
}

/**
 * OBTENER DOCUMENTO POR ID
 * Recupera los metadatos de un documento específico
 * Útil para procesos de validación, descarga o eliminación
 */
export async function getDocumentoById(id) {
  return await documentoRepository.findOneBy({ id });
}

/**
 * ELIMINAR DOCUMENTO (BDD)
 * Borra el registro lógico de la base de datos
 */
export async function deleteDocumento(id) {
  return await documentoRepository.delete({ id });
}
