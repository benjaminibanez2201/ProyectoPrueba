import { AppDataSource } from "../config/configDb.js";
import { FormularioPlantilla } from "../entities/FormularioPlantilla.entity.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../Handlers/responseHandlers.js";
import { saveBitacoraResponse } from '../services/formulario.service.js';
import { getRespuestaById } from '../services/formulario.service.js';

// La llave
const plantillaRepository = AppDataSource.getRepository(FormularioPlantilla);

//Recibe las peticiones del frontend
export class FormularioController {
  
  // Obtener la plantilla por su tipo
  async getPlantillaByTipo(req, res) {
    try {
      const { tipo } = req.params;

      const plantilla = await plantillaRepository.findOne({
        where: { tipo: tipo }
      });

      if (!plantilla) {
        return handleErrorClient(res, 404, "Plantilla de formulario no encontrada");
      }

      handleSuccess(res, 200, "Plantilla obtenida", plantilla);

    } catch (error) {
      handleErrorServer(res, 500, "Error al obtener la plantilla", error.message);
    }
  }

// 2. Obtener TODAS las plantillas (CORREGIDO)
  async getAllPlantillas(req, res) {
    try {
      const plantillas = await plantillaRepository.find({
        // AQUÍ ESTABA EL ERROR: Cambiamos "updatedAt" por "actualizadoEn"
        select: ["id", "titulo", "tipo", "descripcion", "actualizadoEn", "esquema"],
        order: { tipo: "ASC" }
      });
      
      handleSuccess(res, 200, "Lista de plantillas", plantillas);
    } catch (error) {
      handleErrorServer(res, 500, "Error al listar plantillas", error.message);
    }
  }

  // 3. Actualizar una plantilla
  async updatePlantilla(req, res) {
    try {
      const { id } = req.params;
      const { titulo, descripcion, esquema } = req.body;

      // Buscamos por ID (nota: tu ID es un número entero, TypeORM lo maneja bien)
      const plantilla = await plantillaRepository.findOne({ where: { id: Number(id) } });
      
      if (!plantilla) return handleErrorClient(res, 404, "Plantilla no encontrada");

      // Actualizamos los campos si vienen en el body
      if (titulo) plantilla.titulo = titulo;
      if (descripcion) plantilla.descripcion = descripcion;
      if (esquema) plantilla.esquema = esquema;

      // TypeORM actualizará automáticamente el campo 'actualizadoEn'
      await plantillaRepository.save(plantilla);

      handleSuccess(res, 200, "Plantilla actualizada correctamente", plantilla);
    } catch (error) {
      handleErrorServer(res, 500, "Error al actualizar plantilla", error.message);
    }
  }
  // Crear una nueva plantilla desde cero
  async createPlantilla(req, res) {
    try {
      const { titulo, descripcion, tipo, esquema } = req.body;

      // Validamos que no exista otro con el mismo "tipo" (clave única)
      const existe = await plantillaRepository.findOne({ where: { tipo } });
      if (existe) {
        return handleErrorClient(res, 400, "Ya existe un formulario con ese código (tipo).");
      }

      const nueva = plantillaRepository.create({
        titulo,
        descripcion,
        tipo, // Ej: "encuesta_satisfaccion"
        esquema: esquema || [] // Las preguntas
      });

      await plantillaRepository.save(nueva);
      handleSuccess(res, 201, "Formulario creado exitosamente", nueva);
    } catch (error) {
      handleErrorServer(res, 500, "Error al crear formulario", error.message);
    }
  }
  // Eliminar una plantilla (Solo si no es del sistema)
  async deletePlantilla(req, res) {
    try {
      const { id } = req.params;
      
      const plantilla = await plantillaRepository.findOneBy({ id: Number(id) });
      if (!plantilla) {
        return handleErrorClient(res, 404, "Formulario no encontrado");
      }

      // 🛡️ LISTA DE INTOCABLES
      const protegidos = ["postulacion", "bitacora", "evaluacion_pr1", "evaluacion_pr2"];
      
      if (protegidos.includes(plantilla.tipo)) {
        return handleErrorClient(res, 403, "No puedes eliminar formularios base del sistema.");
      }

      // Si pasa el filtro, lo borramos
      await plantillaRepository.remove(plantilla);
      handleSuccess(res, 200, "Formulario eliminado correctamente", { id });
    } catch (error) {
      handleErrorServer(res, 500, "Error al eliminar formulario", error.message);
    }
  }
}

export async function submitBitacora(req, res) {
    try {
        const userId = req.user.id; // ID del alumno logueado
        const { practicaId, respuestas } = req.body; // Datos enviados desde el Frontend

        // 1. Llama al servicio para guardar la Bitácora
        const result = await saveBitacoraResponse(practicaId, userId, respuestas);
        
        handleSuccess(res, 201, 'Bitácora guardada exitosamente.', result);
    } catch (error) {
        console.error("Error al guardar bitácora:", error);
        handleErrorServer(res, 500, error.message || 'Error interno al procesar la bitácora.');
    }
}

export const getRespuesta = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogueadoId = req.userId || req.user?.id || req.user?._id || req.user?.sub;
        const respuesta = await getRespuestaById(parseInt(id));

        // --- LOGS DE DEBUGGING (Míralos en la terminal del Backend) ---
        //console.log("--- DEBUG DE PERMISOS ---");
        //console.log("Objeto req.user completo:", req.user); 
        //console.log("Práctica pertenece a Alumno ID:", respuesta.practica.student?.id);
        //console.log("ID recuperado del Token:", usuarioLogueadoId);
        // -------------------------------------------------------------

        // Si después de esto sigue undefined, lanza error
        if (!usuarioLogueadoId) {
            return res.status(401).json({ message: "Error de autenticación: No se pudo identificar al usuario." });
        }

        // Validación de Seguridad
        if (String(respuesta.practica.student.id) !== String(usuarioLogueadoId)) {
             return res.status(403).json({ message: "Acceso denegado. No eres el dueño de esta práctica." });
        }
        
        return res.status(200).json(respuesta);
    } catch (error) {
        console.error("Error en getRespuesta:", error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message });
    }
};
