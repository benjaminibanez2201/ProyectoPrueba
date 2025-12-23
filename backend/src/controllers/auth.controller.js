import { registerUser, loginUser } from "../services/auth.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body; 
    
    if (!email || !password) {
      return handleErrorClient(res, 400, "Email y contraseña son requeridos");
    }
    
    const data = await loginUser(email, password);
    handleSuccess(res, 200, "Login exitoso", data);
  } catch (error) {
    handleErrorClient(res, 401, error.message);
  }
}

export async function register(req, res) {
  try {
    const userData = req.body;
    
    // VALIDAR CAMPOS REQUERIDOS
    if (!userData.name || !userData.email || !userData.password || !userData.role) {
      return handleErrorClient(res, 400, "Nombre, email, rol y contraseña son requeridos");
    }
    //ocupa el registro del auth.service
    const newUser = await registerUser(userData);

    handleSuccess(res, 201, "Usuario registrado exitosamente", newUser);
  } catch (error) {
    // Verificar si el error es por correo duplicado
    if (error.message && error.message.includes("El correo ya está registrado.")) { 
      // Si se encuentra, devolvemos un 409 (Conflict)
      return handleErrorClient(res, 409, error.message);
    }else {
      return handleErrorServer(res, 500, "Error interno del servidor", error.message);
    }
  }
}
