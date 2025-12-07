// En: frontend/src/pages/FormReviewPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRespuesta } from '../services/formulario.service';
import FormRender from '../components/FormRender';
import { Loader2, ArrowLeft, FileText } from 'lucide-react';
import { showErrorAlert } from '../helpers/sweetAlert';

const VistaPreviaAlumno = () => {
    const { id } = useParams(); // Obtenemos el ID de la URL
    const navigate = useNavigate();

    const [respuesta, setRespuesta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarRespuesta = async () => {
            try {
                // Llamamos al servicio que creamos antes
                const data = await getRespuesta(id);
                setRespuesta(data);
            } catch (error) {
                console.error(error);
                showErrorAlert("Error", "No se pudo cargar el formulario.");
                navigate('/panel');
            } finally {
                setLoading(false);
            }
        };
        cargarRespuesta();
    }, [id, navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
    );

    if (!respuesta) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header simple */}
            <div className="bg-white shadow-sm py-4 px-6 mb-8 flex items-center relative">
                <button 
                    onClick={() => navigate(-1)} // Volver atrás
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition z-10"
                >
                    <ArrowLeft size={20} /> Volver
                </button>
                <h1 className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-xl font-bold text-gray-800">
                    <FileText className="text-blue-600" /> 
                    Revisión de {respuesta.plantilla?.titulo || "Formulario"}
                </h1>
            </div>

            <main className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 pointer-events-none opacity-90"> 
                    {/* NOTA: Usamos 'pointer-events-none' en el div padre para que 
                        el formulario parezca de "solo lectura" y no se pueda editar.
                    */}
                    
                    <FormRender 
                        esquema={respuesta.plantilla.esquema}
                        // Pasamos los datos guardados para que se rellenen los campos
                        valores={respuesta.datos} 
                        // Dependiendo de tu versión de FormRender, puede ser 'respuestasIniciales' o 'valores'
                        // Prueba con 'valores' primero, si sale vacío, usa 'respuestasIniciales'
                        respuestasIniciales={respuesta.datos}

                        // Botón dummy (ya que está deshabilitado por el div padre)
                        buttonText="Modo Lectura"
                        onSubmit={() => {}} 
                    />
                </div>
                
                <div className="mt-6 text-center text-gray-500 text-sm">
                    Este documento es una copia de solo lectura de tu envío realizado el {new Date(respuesta.fecha_envio).toLocaleDateString()}.
                </div>
            </main>
        </div>
    );
};

export default VistaPreviaAlumno;