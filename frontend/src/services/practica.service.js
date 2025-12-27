import instance from "./root.service.js"; 

// Obtener todas las prácticas
export const getPracticas = async () => {
  try {
    const response = await instance.get("/practicas");
    return response.data.data;
  } catch (error) {
    console.error("Error al obtener prácticas:", error);
    throw error.response.data || error.message;
  }
};

export const getMyPractica = async () => {
  try {
    const response = await instance.get("/practicas/me");
    return response.data.data;
  } catch (error) {
    console.error("Error al obtener mi práctica:", error);
    throw error.response?.data || error;
  }
};

export const postularPractica = async (data) => {
  try {
    const response = await instance.post("/practicas/postular", data);
    return response.data.data;
  } catch (error) {
    console.error("Error al postular práctica:", error);
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

export const updateEstadoPractica = async (id, nuevoEstado) => {
  const response = await instance.put(`/practicas/estado/${id}`, {
    nuevoEstado,
  });
  return response.data;
};

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
