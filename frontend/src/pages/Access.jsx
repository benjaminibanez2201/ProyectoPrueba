import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validarTokenEmpresa, confirmarInicioPractica } from '../services/empresa.service.js';
import { getPlantilla } from '../services/formulario.service.js'; // 1. Traer la plantilla
import FormRender from '../components/FormRender'; // 2. Traer tu componente estrella
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert.js'; 
import { CheckCircle, XCircle, Loader2, Building2, User, LogOut, FileText, ClipboardList } from 'lucide-react';

const Access = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    // Estados de Datos
    const [data, setData] = useState(null);
    const [plantilla, setPlantilla] = useState(null); // Para guardar las preguntas
    
    // Estados de UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [procesando, setProcesando] = useState(false);

    // Lógica de Carga Inicial
    useEffect(() => {
        if (!token) {
            setError("Error: Token no proporcionado.");
            setLoading(false);
            return;
        }

        const cargarTodo = async () => {
            try {
                // A. Validar Token y traer datos de la práctica
                const response = await validarTokenEmpresa(token);
                if (!response?.data) throw new Error('Datos inválidos del servidor');
                setData(response.data);

                // B. Cargar la Plantilla del Formulario (Ej: "postulacion")
                // Asumimos que la empresa debe llenar la parte de "postulacion"
                // OJO: Podrías necesitar un endpoint que te diga QUÉ plantilla cargar.
                // Por ahora usamos 'postulacion' por defecto.
                const plantillaData = await getPlantilla('postulacion');
                setPlantilla(plantillaData);

            } catch (err) {
                console.error('Error de carga:', err);
                setError(err.message || 'Token inválido o expirado.');
            } finally {
                setLoading(false);
            }
        };

        cargarTodo();
    }, [token]);

    // 👇 1. AGREGAMOS ESTA FUNCIÓN AUXILIAR
    // Esta función busca entre todas las respuestas de la práctica (postulación, evaluación, etc.)
    // y extrae solo la que corresponde a la 'postulacion' para mostrarla en el formulario.
    const getRespuestasAlumno = () => {
        // 1. Validamos que exista el array
        if (!data || !data.formularioRespuestas) return {};
        
        // 2. Buscamos la respuesta de postulación
        const respuestaEncontrada = data.formularioRespuestas.find(
            r => r.plantilla?.tipo === 'postulacion'
        );
        
        if (!respuestaEncontrada) return {};

        const misDatos = respuestaEncontrada.datos;

        // 👇 LA CORRECCIÓN MÁGICA
        // Si los datos están escondidos dentro de "datosFormulario", los sacamos hacia afuera.
        if (misDatos && misDatos.datosFormulario) {
            return { ...misDatos, ...misDatos.datosFormulario };
        }

        return misDatos || {};
    };

    // Lógica para enviar el formulario completado
    const handleFormSubmit = async (respuestas) => {
        try {
            setProcesando(true);

            // 1. Enviamos respuestas + confirmación (true)
            // IMPORTANTE: Asegúrate que confirmarInicioPractica acepte un segundo argumento (respuestas)
            // O crea una función nueva en el servicio: completarDatosEmpresa(token, respuestas)
            const response = await confirmarInicioPractica(token, true, respuestas);

            showSuccessAlert("¡Enviado!", "Los datos han sido enviados al Coordinador para su validación.");
            
            // 2. Actualizamos el estado local para que la UI cambie inmediatamente
            setData(prev => ({ ...prev, estado: 'pendiente_validacion' }));

        } catch (err) {
            showErrorAlert("Error", err.message || 'Error al guardar los datos.');
        } finally {
            setProcesando(false);
        }
    };

    const handleCerrarSesion = () => navigate('/auth');

    // --- RENDERIZADO ---

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-16 h-16 text-blue-700 animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
                <p className="text-gray-600">{error}</p>
            </div>
        </div>
    );

    // Determinamos qué mostrar según el estado
    const { alumnoNombre, empresaNombre, estado } = data;
    
    // Estados Clave
    const esModoEdicion = estado === 'enviada_a_empresa' || estado === 'rechazada';
    const esPendienteValidacion = estado === 'pendiente_validacion';
    const esEnCurso = estado === 'en_curso';

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Building2 className="text-blue-600" size={28} />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Portal Empresa</h1>
                            <p className="text-xs text-gray-500">{empresaNombre}</p>
                        </div>
                    </div>
                    <button onClick={handleCerrarSesion} className="text-gray-500 hover:text-red-600 flex items-center gap-2 text-sm font-medium transition-colors">
                        <LogOut size={16} /> Salir
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 mt-8">
                
                {/* 1. FICHA DEL ALUMNO (Siempre visible) */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <User className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Solicitud de: {alumnoNombre}</h2>
                        <p className="text-gray-500 text-sm">
                            Estado actual: <span className="font-semibold text-blue-600 uppercase">{estado.replace(/_/g, ' ')}</span>
                        </p>
                    </div>
                </div>

                {/* 2. AREA DE ACCIÓN (Cambia según estado) */}

                {/* CASO A: MODO EDICIÓN (Llenar Formulario) */}
                {esModoEdicion && (
                    <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                        <div className="bg-blue-600 p-4 text-white">
                            <h3 className="font-bold flex items-center gap-2">
                                <FileText size={20} /> Completar Datos de Práctica
                            </h3>
                            <p className="text-blue-100 text-sm mt-1">Por favor complete los datos requeridos para formalizar la solicitud.</p>
                        </div>
                        
                        <div className="p-6">
                            {plantilla ? (
                                <FormRender 
                                    esquema={plantilla.esquema} 
                                    
                                    // 👇 2. AQUÍ USAMOS LA NUEVA FUNCIÓN
                                    // Antes decíamos: respuestasIniciales={data.datos || {}}
                                    respuestasIniciales={getRespuestasAlumno()} 
                                    
                                    onSubmit={handleFormSubmit}
                                    buttonText={procesando ? "Enviando..." : "Enviar a Validación"}
                                    userType="empresa" 
                                />
                            ) : (
                                <p className="text-center py-8 text-gray-500">Cargando formulario...</p>
                            )}
                        </div>
                    </div>
                )}

                {/* CASO B: ESPERANDO VALIDACIÓN (Bloqueado) */}
                {esPendienteValidacion && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                        <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-yellow-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-yellow-800 mb-2">Solicitud Enviada</h3>
                        <p className="text-yellow-700 max-w-md mx-auto">
                            Hemos recibido sus datos. La solicitud está siendo revisada por el Coordinador de Prácticas de la universidad.
                        </p>
                        <p className="text-sm text-yellow-600 mt-4 font-medium">Le notificaremos cuando sea aprobada.</p>
                    </div>
                )}

                {/* CASO C: APROBADA / EN CURSO (Panel de Evaluación) */}
                {esEnCurso && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ClipboardList className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-green-800 mb-2">Práctica En Curso</h3>
                        <p className="text-green-700 mb-6">
                            El alumno está activo. Al finalizar el periodo, podrá realizar su evaluación aquí.
                        </p>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-200">
                            Realizar Evaluación de Desempeño
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
};

export default Access;