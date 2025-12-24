import instance from './root.service.js'; // 1. Importamos tu Axios (root.service)


export const getPracticas = async () => {
  try {
    const response = await instance.get('/practicas');
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener prácticas:', error);
    throw error.response.data || error.message;
  }
};

//llama al endpoint GET /practicas/me del backend para obtener a el alumno logueado
export const getMyPractica = async () => {
  try {
    const response = await instance.get('/practicas/me');
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener mi práctica:', error);
    throw error.response?.data || error;
  }
};


export const postularPractica = async (data) => {
  try {
    // 1. Llama al backend con los datos del formulario
    const response = await instance.post('/practicas/postular', data);
    
    // 2. Devuelve la nueva práctica creada (con el token)
    return response.data.data; 
    
  } catch (error) {
    console.error('Error al postular práctica:', error);
    // 'throw' es importante para que el formulario sepa que falló
    throw error.response?.data || error; 
  }
};

// Aprobar práctica (Coordinador)
export const aprobarPractica = async (id) => {
  try {
    const response = await instance.patch(`/practicas/${id}/aprobar`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Observar/Rechazar práctica (Coordinador)
export const observarPractica = async (id) => {
  try {
    const response = await instance.patch(`/practicas/${id}/observar`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 👇 AQUÍ ESTABA EL ERROR: Cambiamos 'axios' por 'instance'
export const updateEstadoPractica = async (id, nuevoEstado) => {
  // Usamos 'instance' para que incluya la URL base y el Token
  const response = await instance.put(`/practicas/estado/${id}`, { nuevoEstado });
  return response.data;
};

// 👇 AQUÍ TAMBIÉN: Cambiamos 'axios' por 'instance'
export const getPracticaById = async (id) => {
  const response = await instance.get(`/practicas/${id}`);
  return response.data;
};

// Alumno finaliza práctica para solicitar evaluación a la empresa
export const finalizarPractica = async (id) => {
  const response = await instance.post(`/practicas/${id}/finalizar`);
  return response.data;
};

// Cerrar práctica (Coordinador)
export const cerrarPractica = async (id) => {
  const response = await instance.patch(`/practicas/${id}/cerrar`);
  return response.data;
};