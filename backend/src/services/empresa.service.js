import { AppDataSource } from "../config/configDb.js";
import { EmpresaToken } from "../entities/empresaToken.entity.js";

export const validarTokenEmpresa = async (tokenAcceso) => {
    const tokenRepo = AppDataSource.getRepository(EmpresaToken);

    const tokenData = await tokenRepo.findOne({
        where: { token: tokenAcceso },
        relations: ['practica', 'practica.student'], 
    });

    if (!tokenData) {
        throw new Error("Token inválido o no encontrado.");
    }

    if (tokenData.expiracion < new Date()) {
        throw new Error("Token expirado.");
    }
    if (!tokenData.practica) {
        throw new Error("El token no está asociado a una práctica válida.");
    }
    return tokenData;
};