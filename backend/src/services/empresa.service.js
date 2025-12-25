import { AppDataSource } from "../config/configDb.js";
import { EmpresaToken } from "../entities/empresaToken.entity.js";
import { Practica } from "../entities/practica.entity.js";
import { FormularioRespuesta } from "../entities/FormularioRespuesta.entity.js";
import { FormularioPlantilla } from "../entities/FormularioPlantilla.entity.js";
import { User } from "../entities/user.entity.js";
import { enviarConfirmacionEvaluacionEmpresa } from "./email.service.js";

// Validar token de empresa y obtener datos de la práctica asociada
export const validarTokenEmpresa = async (tokenAcceso) => {
    const tokenRepo = AppDataSource.getRepository(EmpresaToken);
    const practicaRepo = AppDataSource.getRepository(Practica);

    // validar token
    const tokenData = await tokenRepo.findOne({
        where: { token: tokenAcceso }, // buscar por token
        relations: ["practica"], // solo para obtener el id de la práctica
    });

    if (!tokenData) { 
        throw new Error("Token inválido.");
    }

    if (tokenData.expiracion < new Date()) {
        throw new Error("Token expirado.");
    }

    if (!tokenData.practica) {
        throw new Error("El token no tiene práctica asociada.");
    }

    const practicaId = tokenData.practica.id;

    // buscar práctica completa
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
        throw new Error("La práctica no existe.");
    }

    if (!practicaCompleta.student) {
        throw new Error("La práctica no tiene alumno asignado.");
    }

    console.log("Práctica cargada. Alumno:", practicaCompleta.student.name);

    // Buscar coordinador para mensajería
    const userRepo = AppDataSource.getRepository(User);
    const coordinador = await userRepo.findOne({ where: { role: 'coordinador' } });

    // Retornar datos relevantes
    return {
        practicaId: practicaCompleta.id,
        alumnoNombre: practicaCompleta.student.name,
        empresaNombre: tokenData.empresaNombre,
        empresaCorreo: tokenData.empresaCorreo, // Email de la empresa desde el token
        estado: practicaCompleta.estado,
        formularioRespuestas: practicaCompleta.formularioRespuestas ?? [], 
        evaluacionPendiente: !!practicaCompleta.evaluacion_pendiente,
        evaluacionCompletada: !!practicaCompleta.evaluacion_completada,
        nivel: practicaCompleta.nivel || null,
        coordinadorId: coordinador?.id || null, // ID del coordinador para mensajería
        coordinadorEmail: coordinador?.email || null, // Email del coordinador
    };
};

// Confirmar inicio de práctica por parte de la empresa
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

    // 4. Corrección Empresa + Estado de la Práctica
    practica.correccion_empresa_hecha = true;

    if (practica.correccion_destinatario === 'ambos') {
        // Si el alumno aún no corrige, no avanzar a validación
        if (!practica.correccion_alumno_hecha) {
            // Mantener estado en 'rechazada' si todavía no cambió
            // o en 'rechazada' / 'enviada_a_empresa' según haya sido ajustado por el alumno
        } else {
            // Ambos ya corrigieron → enviar a coordinador
            practica.estado = 'pendiente_validacion';
            practica.fecha_inicio = new Date();
        }
    } else {
        // Solo empresa o alumno → al confirmar empresa, pasa a validación
        practica.estado = 'pendiente_validacion';
        practica.fecha_inicio = new Date();
    }

    await practicaRepo.save(practica);

    // 5. Guardamos las Respuestas del Formulario
    // Buscamos el formulario de postulación
    let formulario = practica.formularioRespuestas.find(r => r.plantilla.tipo === 'postulacion');

    if (formulario) {
        // Hacemos copia de lo que ya había
        let datosFinales = formulario.datos ? JSON.parse(JSON.stringify(formulario.datos)) : {};
        
        console.log("Datos ANTES de fusionar:", datosFinales);

        // FUSIONAR respuestas de empresa: escribir en raíz y reflejar también en datosFormulario
        datosFinales = { ...datosFinales, ...(respuestasEmpresa || {}) };
        const datosFormulario = datosFinales?.datosFormulario && typeof datosFinales.datosFormulario === 'object'
            ? { ...datosFinales.datosFormulario }
            : {};
        for (const [key, value] of Object.entries(respuestasEmpresa || {})) {
            datosFormulario[key] = value;
        }
        datosFinales.datosFormulario = datosFormulario;

        console.log("Datos DESPUÉS de fusionar (A Guardar):", datosFinales);

        // Guardar estructura final coherente
        formulario.datos = datosFinales;
        formulario.estado = 'enviado';
        
        await respuestaRepo.save(formulario);
    } else {
        console.warn("No se encontró formulario para guardar respuestas.");
    }

    return { 
        message: "Datos guardados y práctica enviada a validación.", 
        practicaId: practica.id 
    };
};

// Empresa envía evaluación final (PR1/PR2)
export const guardarEvaluacionEmpresa = async (tokenAcceso, respuestas) => {
    const tokenRepo = AppDataSource.getRepository(EmpresaToken);
    const practicaRepo = AppDataSource.getRepository(Practica);
    const respuestaRepo = AppDataSource.getRepository(FormularioRespuesta);
    const plantillaRepo = AppDataSource.getRepository(FormularioPlantilla);

    const tokenData = await tokenRepo.findOne({ where: { token: tokenAcceso }, relations: ["practica"] });
    if (!tokenData || !tokenData.practica) throw new Error("Token inválido o práctica no encontrada.");

    const practica = await practicaRepo.findOne({ where: { id: tokenData.practica.id }, relations: ["formularioRespuestas", "student", "empresa", "empresaToken"] });
    if (!practica) throw new Error("Práctica no existe.");

    if (!practica.evaluacion_pendiente) {
        // Idempotente: si ya está evaluada, retornamos ok
        if (practica.evaluacion_completada || practica.estado === 'evaluada') {
            return { message: "Evaluación ya registrada.", practicaId: practica.id };
        }
        throw new Error("No hay evaluación pendiente para esta práctica.");
    }

    const tipoPlantilla = practica.nivel === 'pr2' ? 'evaluacion_pr2' : 'evaluacion_pr1';
    const plantillaEval = await plantillaRepo.findOne({ where: { tipo: tipoPlantilla } });
    if (!plantillaEval) throw new Error(`No existe plantilla de ${tipoPlantilla}.`);

    if (!practica.id) throw new Error("Práctica inválida (sin ID).");
    if (!plantillaEval.id) throw new Error("Plantilla inválida (sin ID).");

    console.log('➡️ Guardar evaluación: practica.id =', practica.id, 'plantilla.id =', plantillaEval.id);

    // Inserción explícita con SQL crudo para fijar columnas join correctamente
    const insertSql = `
        INSERT INTO formulario_respuestas (datos, estado, fecha_envio, plantilla_id, practica_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `;
    const insertParams = [
        JSON.stringify(respuestas || {}),
        'enviado',
        new Date(),
        plantillaEval.id,
        practica.id,
    ];
    const insertResult = await AppDataSource.query(insertSql, insertParams);
    console.log('✔️ Evaluación insertada, id =', insertResult?.[0]?.id);

        // Actualizar práctica con UPDATE directo para evitar side-effects en relaciones
        await practicaRepo.createQueryBuilder()
                .update(Practica)
                .set({
                    evaluacion_pendiente: false,
                    evaluacion_completada: true,
                    estado: 'evaluada'
                })
                .where("id = :id", { id: practica.id })
                .execute();

    // Notificar por correo que la evaluación fue registrada
    try {
        await enviarConfirmacionEvaluacionEmpresa(practica, tipoPlantilla);
    } catch (e) {
        console.warn("No se pudo enviar confirmación de evaluación:", e?.message);
    }

    return { message: "Evaluación registrada.", practicaId: practica.id };
};
