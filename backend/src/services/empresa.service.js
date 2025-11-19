import { AppDataSource } from "../config/configDb";
import { EmpresaToken } from "../entities/empresaToken.entity.js";

export const validarTokenEmpresa = async (tokenAcceso) => {
    // Buscar el token en la base de datos
    const tokenRepo = AppDataSource.getRepository(EmpresaToken);

    const tokenData = await tokenRepo.findOne({
        where: { token: tokenAcceso },
        relations: ['practica', 'practica.student'],
    });

    // valida vigencia y existencia
    if (!tokenData) {
        throw new Error("Token inválido o no encontrado.");
    }
    if (tokenData.expiryDate < new Date()) {
        throw new Error("Token expirado");
    }
    return tokenData;
}