/**
 * CONTROLADOR DE GESTIÓN DE DOCUMENTOS
 * Maneja la subida, eliminación y previsualización de archivos de las prácticas
 */
import { AppDataSource } from "../config/configDb.js";
import { DocumentosPractica } from "../entities/documentos.entity.js";
import { Practica } from "../entities/practica.entity.js";
import { createDocumentoArchivo } from "../services/documento.service.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../Handlers/responseHandlers.js";
import { getPublicUrl } from "../helpers/file.helper.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  getDocumentoById,
  deleteDocumento,
} from "../services/documento.service.js";

const DocumentoRepository = AppDataSource.getRepository(DocumentosPractica);

/**
 * SUBIR DOCUMENTO
 * Recibe un archivo mediante Multer y lo asocia a una práctica
 */
export async function uploadDocumento(req, res) {
  try {
    const file = req.file; // Archivo procesado por el middleware (Multer)
    const { tipo, practicaId } = req.body; // Datos adicionales (ej. bitácora o informe)

    // Validaciones iniciales
    if (!file) {
      return handleErrorClient(res, 400, "No se ha subido ningún archivo.");
    }
    if (!tipo || !practicaId) {
      return handleErrorClient(
        res,
        400,
        "Faltan datos obligatorios: tipo (bitácora/informe) o practicaId."
      );
    }

    // Persistencia en Base de Datos a través del servicio
    const nuevoDocumento = await createDocumentoArchivo(file, {
      tipo_documento: tipo,
      practicaId,
    });

    // Construimos respuesta incluyendo la URL pública para acceso inmediato
    const respuesta = { ...nuevoDocumento, url: getPublicUrl(file.filename) };

    handleSuccess(res, 201, "Documento subido con éxito.", respuesta);
  } catch (error) {
    // Manejo de error de clave foránea (la práctica no existe en la DB)
    if (error.code === "23503") {
      return handleErrorClient(res, 404, "La práctica especificada no existe.");
    }
    handleErrorServer(res, 500, "Error al subir el documento.", error.message);
  }
}

/**
 * ELIMINAR DOCUMENTO
 * Borra el registro de la base de datos y el archivo físico del servidor
 */
export async function deleteDocumentoHandler(req, res) {
  try {
    const { id } = req.params;

    // 1. Buscamos el documento en la bdd para saber su nombre
    const documento = await getDocumentoById(id);
    if (!documento) {
      return handleErrorClient(res, 404, "Documento no encontrado");
    }

    // 2. Determinar ruta física del archivo
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.resolve(
      __dirname,
      "../../uploads",
      documento.ruta_archivo
    );

    //3. Borrar el archivo físico
    try {
      await fs.unlink(filePath); // 'unlink' significa borrar archivo
    } catch (fileError) {
      // Si el archivo no está en el disco, avisamos pero permitimos limpiar la DB
      console.warn(
        "Advertencia: El archivo físico no se encontró, se borrará solo de la BDD."
      );
    }

    // 4. Borrar el registro de la Base de Datos
    await deleteDocumento(id);

    handleSuccess(res, 200, "Documento eliminado correctamente");
  } catch (error) {
    handleErrorServer(
      res,
      500,
      "Error al eliminar el documento",
      error.message
    );
  }
}

/**
 * REVISAR/DESCARGAR DOCUMENTO
 * Configura los headers HTTP para que el navegador sepa si mostrar (PDF) o descargar (ZIP/Word)
 */
export async function revisarDocumento(req, res) {
  try {
    const documentoId = req.params.id;
    const { tipo, practicaId } = req.body;

    // Buscamos el documento en la base de datos
    const documento = await DocumentoRepository.findOne({
      where: { id: documentoId },
    });
    if (!documento || !documento.ruta_archivo) {
      return handleErrorClient(
        res,
        404,
        "Documento o ruta de archivo no encontrada."
      );
    }

    const PracticaRepository = AppDataSource.getRepository(Practica);
    const practica = await PracticaRepository.findOne({
      where: { id: parseInt(practicaId) },
    });
    if (!practica) {
      return handleErrorClient(res, 404, "La práctica especificada no existe.");
    }
    if (practica.estado === "cerrada") {
      return handleErrorClient(
        res,
        403,
        "La práctica está cerrada. No se pueden subir documentos."
      );
    }

    // construir la ruta física del archivo
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    let nombreArchivo = documento.ruta_archivo.replace(/^uploads\//, "");
    const filePath = path.resolve(__dirname, "../../uploads", nombreArchivo);

    // CONFIGURACIÓN DE MIME TYPES (Tipo de contenido)
    const fileExtension = path.extname(documento.ruta_archivo).toLowerCase();
    let contentType = "application/octet-stream"; // Tipo genérico

    if (fileExtension === ".pdf") {
      contentType = "application/pdf";
    } else if (fileExtension === ".docx" || fileExtension === ".doc") {
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (fileExtension === ".zip") {
      contentType = "application/zip";
    }

    //establecer los encabezados
    res.setHeader("Content-Type", contentType);

    // LÓGICA DE VISUALIZACIÓN VS DESCARGA
    if (fileExtension === ".zip") {
      //ZIP, DOCX: Forzar DESCARGA.
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(documento.ruta_archivo)}"`
      );
    } else {
      //PDF: Visualización INLINE.
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${path.basename(documento.ruta_archivo)}"`
      );
    }
    // Envío del archivo al cliente
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error al servir el archivo:", err);
        if (err.code === "ENOENT") {
          // archivo no encontrado
          return handleErrorServer(
            res,
            404,
            "Archivo físico no encontrado en el servidor.",
            err.code
          );
        }
        return handleErrorServer(
          res,
          500,
          "Error desconocido al servir el archivo.",
          err.message
        );
      }
    });
  } catch (error) {
    handleErrorServer(
      res,
      500,
      "Error interno al revisar el documento.",
      error.message
    );
  }
}
