import { AppDataSource } from "../config/configDb.js";
import { EmpresaToken } from "../entities/empresaToken.entity.js";
import { Practica } from "../entities/practica.entity.js";
import { FormularioRespuesta } from "../entities/FormularioRespuesta.entity.js";

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

// ... (tus imports y la función validarTokenEmpresa déjalos igual) ...

export const confirmarInicioPracticaService = async (token, confirmacion, respuestasEmpresa) => {
    const tokenRepo = AppDataSource.getRepository(EmpresaToken);
    const practicaRepo = AppDataSource.getRepository(Practica);
    const respuestaRepo = AppDataSource.getRepository(FormularioRespuesta);

    // 1. Buscamos el token para obtener el ID de la práctica
    const tokenData = await tokenRepo.findOne({
        where: { token },
        relations: ['practica']
    });

    if (!tokenData || !tokenData.practica) {
        throw new Error("Token inválido o práctica no encontrada.");
    }

    const practicaId = tokenData.practica.id;

    // 2. Buscamos la Práctica completa
    const practica = await practicaRepo.findOne({
        where: { id: practicaId },
        relations: ['formularioRespuestas', 'formularioRespuestas.plantilla', 'student']
    });

    if (!practica) throw new Error("La práctica no existe.");

    // 3. Validaciones de Estado (Para no confirmar dos veces)
    if (practica.estado !== 'enviada_a_empresa' && practica.estado !== 'rechazada') {
        // Si ya pasó esta etapa, retornamos éxito igual para no bloquear al usuario
        return { message: "La práctica ya había sido procesada anteriormente.", practicaId };
    }

    if (!confirmacion) {
        throw new Error("Se requiere confirmación explícita.");
    }

    // 4. Actualizamos Estado de la Práctica
    practica.estado = 'pendiente_validacion';
    practica.fecha_inicio = new Date(); // Guardamos fecha tentativa de inicio
    await practicaRepo.save(practica);

    // 5. Guardamos las Respuestas del Formulario
    // Buscamos el formulario de postulación
    let formulario = practica.formularioRespuestas.find(r => r.plantilla.tipo === 'postulacion');

    if (formulario) {
        // Hacemos copia de lo que ya había
        let datosFinales = formulario.datos ? JSON.parse(JSON.stringify(formulario.datos)) : {};
        
        console.log("💾 Datos ANTES de fusionar:", datosFinales);

        // FUSIONAMOS:
        // Lo que envía la empresa se agrega al objeto raíz, junto a lo que ya había
        datosFinales = { ...datosFinales, ...respuestasEmpresa };

        console.log("💾 Datos DESPUÉS de fusionar (A Guardar):", datosFinales);

        formulario.datos = datosFinales;
        formulario.estado = 'enviado';
        
        await respuestaRepo.save(formulario);
    } else {
        console.warn("⚠️ No se encontró formulario para guardar respuestas.");
    }

    return { 
        message: "Datos guardados y práctica enviada a validación.", 
        practicaId: practica.id 
    };
};
