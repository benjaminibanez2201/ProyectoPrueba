import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlantilla } from '../services/formulario.service.js'; // Servicio para traer la plantilla
import FormRender from '../components/FormRender'; // El componente que dibuja el formulario
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert.js';
import { Loader2, BookOpen, ArrowLeft } from 'lucide-react';
import { postBitacora } from '../services/formulario.service';
import { getMyPractica } from '../services/practica.service';

const ResponderBitacora = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Necesitamos el ID del usuario logueado
    
    const [practicaId, setPracticaId] = useState(null);
    const [plantilla, setPlantilla] = useState(null);
    const [loading, setLoading] = useState(true);

    const [procesando, setProcesando] = useState(false);

    // Lógica para cargar la plantilla Y la práctica activa
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // 1. CARGAR PRÁCTICA (Necesaria para obtener el ID y el estado)
                // Asumiendo que getMyPractica() trae todo el objeto de la práctica activa
                const practicaData = await getMyPractica(); 
                
                // 2. REGLA DE NEGOCIO: Solo si la práctica está "En Curso"
                if (practicaData.estado !== 'en_curso') {
                    showErrorAlert('Acceso denegado', 'Solo puedes crear Bitácoras si la práctica está "En Curso".');
                    navigate('/panel');
                    return;
                }
                
                // 3. ESTABLECER EL ID Y ESTADO
                setPracticaId(practicaData.id); // <-- ¡Aquí se establece el ID!
                
                // 4. CARGAR PLANTILLA
                const plantillaData = await getPlantilla('bitacora'); 
                setPlantilla(plantillaData);
                
            } catch (err) {
                // Error: No hay práctica o falla de conexión
                showErrorAlert('Error', 'No se encontró una práctica activa para el usuario o fallo la conexión.');
                navigate('/panel');
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [navigate]);

    const valoresIniciales = {
        nombre_alumno: user.name,
        correo_alumno: user.email,
    };
    
    const handleFormSubmit = async (respuestas) => {
        // Bloqueo de seguridad: No deberíamos llegar aquí si practicaId es nulo
        if (!practicaId) { 
            showErrorAlert('Error', 'No se puede enviar, ID de práctica no encontrado.');
            return;
        }
        try {
            setProcesando(true);
            
            const dataToSend = {
                practicaId: practicaId, // Usamos el ID cargado en el useEffect
                respuestas: respuestas
            };

            // 1. LLAMADA REAL A LA API PARA GUARDAR
            await postBitacora(dataToSend); 
            
            // 2. ÉXITO: Mostramos alerta y navegamos
            await showSuccessAlert("Bitácora Enviada", "Los datos han sido guardados y registrados.");
            
            // **IMPORTANTE:** Navegamos *después* del éxito para que el usuario pueda ver la alerta.
            navigate('/panel'); 
           

        } catch (err) {
        // En caso de error de red o backend (ej. 500, 401, 400)
            showErrorAlert("Error al guardar", err.message || 'Error desconocido al enviar la Bitácora.');
        } finally {
            setProcesando(false);
        }
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
                <div className="flex items-center justify-between mb-6">
                    {/* 1. Botón Izquierda */}
                    <button 
                        onClick={() => navigate(-1)} // O la ruta específica: navigate("/dashboard/alumno")
                        className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors font-medium"
                    >
                        <ArrowLeft size={24} />
                        <span className="hidden sm:inline">Volver</span>
                    </button>

                    {/* 2. Título Centro */}
                    <h2 className="text-3xl font-bold text-green-700 flex items-center justify-center gap-3">
                        <BookOpen size={28} /> 
                        Completar Bitácora
                    </h2>

                    {/* 3. Espaciador Derecho (Invisible) para mantener el centro perfecto */}
                    <div className="w-[88px] hidden sm:block"></div> 
                </div>
                {/* ------------------------------------------------ */}

                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-8">
                    <FormRender 
                        esquema={plantilla.esquema} 
                        valores={valoresIniciales}
                        onSubmit={handleFormSubmit}
                        buttonText={procesando ? "Enviando..." : "Guardar Bitácora"} 
                        disabled={procesando}
                    />
                </div>
            </main>
        </div>
    );
};

export default ResponderBitacora;