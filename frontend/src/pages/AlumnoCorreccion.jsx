import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getRespuesta,
  getPlantilla,
  corregirPostulacionRespuesta,
} from "../services/formulario.service.js";
import FormRender from "../components/FormRender";
import { showSuccessAlert, showErrorAlert } from "../helpers/sweetAlert.js";
import { Loader2, ArrowLeft, FileText } from "lucide-react";

const AlumnoCorreccion = () => {
  const { id } = useParams(); // id de FormularioRespuesta
  const navigate = useNavigate();

  const [respuesta, setRespuesta] = useState(null);
  const [plantilla, setPlantilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const resp = await getRespuesta(id);
        setRespuesta(resp);

        const pl = await getPlantilla("postulacion");
        setPlantilla(pl);
      } catch (e) {
        console.error(e);
        showErrorAlert("Error", "No se pudo cargar la corrección.");
        navigate("/panel");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id, navigate]);

  const getRespuestasIniciales = () => {
    if (!respuesta) return {};
    const datos = respuesta?.datos || {};
    if (datos && datos.datosFormulario) {
      return { ...datos, ...datos.datosFormulario };
    }
    return datos;
  };

  const handleSubmit = async (respuestas) => {
    try {
      setEnviando(true);
      // Filtrar solo campos del alumno según plantilla (fillBy === 'alumno' o sin fillBy)
      const esquema = plantilla?.esquema || [];
      const alumnoIds = new Set(
        esquema
          .filter((c) => c.fillBy === "alumno" || !c.fillBy)
          .map((c) => c.id)
      );
      const respuestasAlumno = Object.fromEntries(
        Object.entries(respuestas).filter(([k]) => alumnoIds.has(k))
      );
      await corregirPostulacionRespuesta(id, respuestasAlumno);
      await showSuccessAlert(
        "¡Enviado!",
        "Corrección enviada. Se retomará el flujo correspondiente."
      );
      navigate("/panel");
    } catch (e) {
      console.error(e);
      showErrorAlert("Error", e?.message || "No se pudo enviar la corrección.");
    } finally {
      setEnviando(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
      </div>
    );

  if (!respuesta || !plantilla) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow-sm py-4 px-6 mb-8 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium"
        >
          <ArrowLeft size={20} /> Volver
        </button>
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <FileText className="text-blue-600" /> Corregir Postulación
        </h1>
      </div>

      <main className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6">
          <FormRender
            esquema={plantilla.esquema}
            respuestasIniciales={getRespuestasIniciales()}
            onSubmit={handleSubmit}
            userType="alumno"
            buttonText={enviando ? "Enviando..." : "Enviar Corrección"}
          />
        </div>
      </main>
    </div>
  );
};

export default AlumnoCorreccion;
