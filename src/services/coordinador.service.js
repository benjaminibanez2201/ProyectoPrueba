//Requisito 2: Acceso a información completa de alumnos en práctica

import { AppDataSource } from "../config/configDb";
import { User } from "../entities/user.entity";

export const getDetallesAlumnos = async (userId) => {
    try {
        const userRepository = AppDataSource.getRepository(User);

        const detallesCompletos = await userRepository.findOne({
            where: { id: userId },
            relations: [
                "practicasComoAlumno",
                "practicasComoAlumno.formularios",
                "practicasComoAlumno.bitacoras",
                "practicasComoAlumno.evaluaciones",
                "practicasComoAlumno.informes"
            ],
        });

        //si no existe o si el usuario no es 'alumno'
        if (!detallesCompletos || detallesCompletos.role !== 'alumno') {
            throw new Error("Usuario no encontrado o no es un alumno.");
        } return detallesCompletos;
    } catch (error) {
        throw new Error("Error al obtener los detalles del alumno: " + error.message);
    }
}
