import { AppDataSource } from "../config/configDb.js";
import { Practica } from "../entities/practica.entity.js";
import { FormularioRespuesta } from "../entities/FormularioRespuesta.entity.js"; 
import { FormularioPlantilla } from "../entities/FormularioPlantilla.entity.js"; 


// Repositorios necesarios
const practicaRepository = AppDataSource.getRepository(Practica);
const respuestaRepository = AppDataSource.getRepository(FormularioRespuesta);
const plantillaRepository = AppDataSource.getRepository(FormularioPlantilla);

/**
 * [RF6/RF10] Guarda la respuesta de una Bitácora en la base de datos, 
 * vinculándola a la Práctica activa del alumno.
 */
export async function saveBitacoraResponse(practicaId, userId, respuestas) {
    
    // El tipo de formulario que buscamos en la base de datos
    const formType = 'bitacora'; 

    // 1. Encontrar la Práctica y la Plantilla
    const practica = await practicaRepository.findOneBy({ id: practicaId });
    const plantilla = await plantillaRepository.findOneBy({ tipo: formType });

    if (!practica || !plantilla) {
        throw new Error("Error de referencia: Práctica o plantilla no encontradas.");
    }

    // 2. Crear y Guardar la Respuesta
    const newResponse = respuestaRepository.create({
        datos: respuestas, // Datos JSON del formulario (lo que envías desde el Front)
        estado: 'enviado',
        fecha_envio: new Date(),
        plantilla: plantilla,
        practica: practica,
        respondido_por: { id: userId }, 
    });

    return await respuestaRepository.save(newResponse);
}

/**
 * Función auxiliar para obtener plantillas 
 */
export async function getPlantilla(tipo) {
    const plantilla = await plantillaRepository.findOne({ where: { tipo } });
    if (!plantilla) throw new Error("Plantilla de formulario no encontrada.");
    return plantilla;
}

export async function getRespuestaById(id) {
    const respuesta = await respuestaRepository.findOne({
        where: { id },
        // Traer la plantilla para que el Front sepa cómo dibujar el formulario
        relations: ['plantilla', 'practica', 'practica.student'] 
    });
    if (!respuesta){
        throw new Error("Respuesta de formulario no encontrada.");
        error.status = 404;
        throw error;
    } 
    return respuesta;
}