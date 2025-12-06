import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlantilla } from '../services/formulario.service.js'; // Servicio para traer la plantilla
import FormRender from '../components/FormRender'; // El componente que dibuja el formulario
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert.js';
import { Loader2, BookOpen } from 'lucide-react';

const ResponderBitacora = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Necesitamos el ID del usuario logueado
    
    const [plantilla, setPlantilla] = useState(null);
    const [loading, setLoading] = useState(true);

    // Lógica para cargar la plantilla de Bitácora
    useEffect(() => {
        const cargarPlantilla = async () => {
            try {
                // 1. Cargamos la plantilla de Bitácora 
                const plantillaData = await getPlantilla('bitacora'); 
                setPlantilla(plantillaData);
            } catch (err) {
                showErrorAlert('Error de carga', 'No se pudo cargar la plantilla de Bitácora. Revisa si existe en el backend.');
            } finally {
                setLoading(false);
            }
        };
        cargarPlantilla();
    }, []);

    const valoresIniciales = {
        nombre_alumno: user.name,
        correo_alumno: user.email,
    };

    // Esta función debe existir en tu compañero's service, pero la definimos como placeholder
    // Debería guardar la respuesta del formulario dinámico en la tabla respuestas_formulario
    const handleFormSubmit = async (respuestas) => {
        // Enviar la respuesta del formulario a un nuevo endpoint del backend
        console.log("Enviando Bitácora de:", user.name, respuestas);
        showSuccessAlert("Bitácora Enviada", "Los datos han sido guardados.");
        navigate('/panel'); // Volver al dashboard
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-16 h-16 text-green-700 animate-spin" /></div>
    );

    if (!plantilla) return (
        <div className="text-center p-8">No se encontró la plantilla de Bitácora. Contacte al coordinador.</div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12 pt-8">
            <main className="max-w-4xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-green-700 mb-6 flex items-center gap-3">
                    <BookOpen size={28} /> Completar Bitácora
                </h2>
                
                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-8">
                    {/* Renderizamos el formulario dinámico */}
                    <FormRender 
                        esquema={plantilla.esquema} 
                        valores={valoresIniciales}
                        // Aquí deberías pasar respuestasIniciales si la bitácora ya está guardada
                        onSubmit={handleFormSubmit}
                        buttonText="Guardar Bitácora"
                        userType="alumno" 
                    />
                </div>
            </main>
        </div>
    );
};

export default ResponderBitacora;