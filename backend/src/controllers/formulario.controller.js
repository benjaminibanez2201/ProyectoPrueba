import { AppDataSource } from "../config/configDb.js";
import { FormularioPlantilla } from "../entities/FormularioPlantilla.entity.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../Handlers/responseHandlers.js";

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
        select: ["id", "titulo", "tipo", "descripcion", "actualizadoEn"],
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
}