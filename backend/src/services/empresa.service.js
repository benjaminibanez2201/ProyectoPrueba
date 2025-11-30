import { AppDataSource } from "../config/configDb.js";
import { EmpresaToken } from "../entities/empresaToken.entity.js";
import { Practica } from "../entities/practica.entity.js";

export const validarTokenEmpresa = async (tokenAcceso) => {
    console.log("🔍 Validando token:", tokenAcceso);

    const tokenRepo = AppDataSource.getRepository(EmpresaToken);
    const practicaRepo = AppDataSource.getRepository(Practica);

    // 1️⃣ BUSCAR SOLO EL TOKEN
    const tokenData = await tokenRepo.findOne({
        where: { token: tokenAcceso },
        relations: ["practica"], // solo para obtener el id de la práctica
    });

    if (!tokenData) {
        console.log("❌ Token no existe");
        throw new Error("Token inválido.");
    }

    if (tokenData.expiracion < new Date()) {
        console.log("❌ Token expirado");
        throw new Error("Token expirado.");
    }

    if (!tokenData.practica) {
        console.log("❌ Token encontrado pero sin práctica asociada");
        throw new Error("El token no tiene práctica asociada.");
    }

    console.log("✔ Token válido. Práctica ID:", tokenData.practica.id);

    const practicaId = tokenData.practica.id;

    // 2️⃣ BUSCAR LA PRÁCTICA COMPLETA SIN QUE PETE
    const practicaCompleta = await practicaRepo.findOne({
        where: { id: practicaId },
        relations: [
            "student",
            "empresa",
            "formularioRespuestas",
            "formularioRespuestas.plantilla"
        ]
    });

    if (!practicaCompleta) {
        console.log("❌ La práctica no existe en la tabla");
        throw new Error("La práctica no existe.");
    }

    if (!practicaCompleta.student) {
        console.log("❌ La práctica existe pero student = NULL");
        throw new Error("La práctica no tiene alumno asignado.");
    }

    console.log("✔ Práctica cargada. Alumno:", practicaCompleta.student.name);

    // 3️⃣ RETORNAR INFORMACIÓN SANA
    return {
        practicaId: practicaCompleta.id,
        alumnoNombre: practicaCompleta.student.name,
        empresaNombre: tokenData.empresaNombre,
        estado: practicaCompleta.estado,
        formularioRespuestas: practicaCompleta.formularioRespuestas ?? []
    };
};
